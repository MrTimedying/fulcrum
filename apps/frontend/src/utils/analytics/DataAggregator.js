/**
 * DataAggregator.js
 * Pure utility functions for aggregating exercise metrics across the intervention hierarchy.
 */

import _ from 'lodash';
import { invoke } from '@tauri-apps/api/core';

/**
 * Parses a variant string (e.g., "10;12;10;") into a numeric array.
 * @param {string} variantStr 
 * @returns {number[]}
 */
export const parseVariantString = (variantStr) => {
  if (!variantStr || typeof variantStr !== 'string') return [];
  return variantStr
    .split(';')
    .filter(v => v.trim() !== '')
    .map(v => {
      const parsed = parseFloat(v.replace(',', '.'));
      return isNaN(parsed) ? 0 : parsed;
    });
};

/**
 * Calculates the total Volume Load for a single exercise.
 * Volume = Sum(Reps[i] * Intensity[i]) for each set.
 * @param {Object} exercise 
 * @returns {number}
 */
export const calculateExerciseVolume = (exercise) => {
  const reps = parseVariantString(exercise.reps_variant);
  const intensities = parseVariantString(exercise.intensity_string);
  
  // If no variant data, fallback to basic fields
  if (reps.length === 0) {
    return (exercise.sets || 0) * (exercise.reps || 0) * (exercise.intensity || 0);
  }

  return reps.reduce((sum, r, i) => {
    const intensity = intensities[i] || intensities[0] || 0;
    return sum + (r * intensity);
  }, 0);
};

/**
 * Extracts and normalizes tags from an exercise.
 * @param {Object} exercise 
 * @returns {string[]}
 */
export const getExerciseTags = (exercise) => {
  if (!exercise.tags) return [];
  return exercise.tags
    .split(';')
    .map(t => t.trim().toLowerCase())
    .filter(t => t !== '' && t.startsWith('#'));
};

/**
 * Aggregates metrics for a specific session.
 */
export const aggregateSessionMetrics = (session) => {
  const exercises = Object.values(session.exercises || {});
  let totalVolume = 0;
  let totalIntensity = 0;
  const tagVolume = {};

  exercises.forEach(ex => {
    const vol = calculateExerciseVolume(ex);
    totalVolume += vol;
    totalIntensity += (ex.intensity || 0);
    
    const tags = getExerciseTags(ex);
    tags.forEach(tag => {
      tagVolume[tag] = (tagVolume[tag] || 0) + vol;
    });
  });

  return {
    id: session.id,
    name: session.name,
    date: session.date,
    volume: totalVolume,
    avgIntensity: exercises.length > 0 ? totalIntensity / exercises.length : 0,
    tagVolume
  };
};

/**
 * The Main Entry Point for Data Analysis.
 * Aggregates data for a node and all its children using Rust commands.
 */
export const getMetricsForNode = async (nodeId, nodeType, store, options = {}) => {
  if (!nodeId || !nodeType || !store) return null;

  const { interventions, phases, microcycles, sessions } = store;
  const { selectedTags = [] } = options;
  let targetSessions = [];

  // 1. Collect all sessions belonging to the focus node
  if (nodeType === 'Intervention') {
    // Robust: Get all sessions belonging to this intervention regardless of hierarchy
    targetSessions = Object.values(sessions).filter(s => s.interventionId === nodeId);
  } else if (nodeType === 'Phase') {
    const phase = phases[nodeId];
    if (phase) {
      (phase.microcycleIds || []).forEach(mId => {
        const micro = microcycles[mId];
        (micro?.sessionIds || []).forEach(sId => {
          if (sessions[sId]) targetSessions.push(sessions[sId]);
        });
      });
    }
  } else if (nodeType === 'Microcycle') {
    const micro = microcycles[nodeId];
    if (micro) {
      (micro.sessionIds || []).forEach(sId => {
        if (sessions[sId]) targetSessions.push(sessions[sId]);
      });
    }
  } else if (nodeType === 'Session') {
    if (sessions[nodeId]) targetSessions.push(sessions[nodeId]);
  } else if (nodeType === 'Exercise') {
    // For a single exercise, we look at the session it belongs to
    // Note: Analysis for a specific exercise across multiple sessions 
    // would require matching by name/baseId, but for now we show the session it's in.
    const session = Object.values(sessions).find(s => s.exercises && s.exercises[nodeId]);
    if (session) targetSessions.push(session);
  }

  if (targetSessions.length === 0) return null;

  try {
    // 2. Call Rust commands for analysis
    const [analysisResult, acwr] = await Promise.all([
      invoke('calculate_hierarchical_metrics', { 
        sessions: targetSessions, 
        selectedTags: selectedTags.length > 0 ? selectedTags : null 
      }),
      invoke('calculate_acwr', { 
        sessions: targetSessions, 
        targetDate: new Date().toISOString().split('T')[0] 
      })
    ]);

    const { summary, trend_data } = analysisResult;

    // 3. Map to existing AggregatedMetrics format
    const distributionData = Object.entries(summary.tag_distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      focusName: nodeId,
      summary: {
        totalVolume: summary.total_volume.toLocaleString(),
        avgIntensity: summary.avg_intensity.toFixed(1) + '%',
        avgRpe: '0.0', // Rust does not calculate RPE yet
        sessionCount: summary.session_count,
        workloadRatio: acwr.toFixed(2)
      },
      trendData: trend_data.map(p => ({
        ...p,
        date: new Date(p.date).toLocaleDateString()
      })),
      distributionData
    };
  } catch (error) {
    console.warn('Rust metrics unavailable, using JS fallback:', error);

    // JS Fallback: compute basic aggregation without Rust
    const sessionMetrics = targetSessions.map(aggregateSessionMetrics);
    const totalVolume = sessionMetrics.reduce((s, m) => s + m.volume, 0);
    const allIntensities = sessionMetrics.map(m => m.avgIntensity).filter(v => v > 0);
    const avgIntensity = allIntensities.length > 0
      ? allIntensities.reduce((s, v) => s + v, 0) / allIntensities.length
      : 0;

    // Aggregate tag volumes across all sessions
    const tagVolumeTotals = {};
    sessionMetrics.forEach(m => {
      Object.entries(m.tagVolume).forEach(([tag, vol]) => {
        tagVolumeTotals[tag] = (tagVolumeTotals[tag] || 0) + vol;
      });
    });

    const distributionData = Object.entries(tagVolumeTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const trendData = sessionMetrics
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(m => ({
        date: m.date ? new Date(m.date).toLocaleDateString() : 'Unknown',
        name: m.name,
        volume: Math.round(m.volume),
        intensity: Math.round(m.avgIntensity)
      }));

    return {
      focusName: nodeId,
      summary: {
        totalVolume: Math.round(totalVolume).toLocaleString(),
        avgIntensity: avgIntensity.toFixed(1) + '%',
        avgRpe: '0.0',
        sessionCount: targetSessions.length,
        workloadRatio: 'N/A'
      },
      trendData,
      distributionData
    };
  }
};

