/**
 * DataAggregator.js
 * Pure utility functions for aggregating exercise metrics across the intervention hierarchy.
 */

import _ from 'lodash';

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
 * Aggregates data for a node and all its children.
 */
export const getMetricsForNode = (nodeId, nodeType, store, options = {}) => {
  if (!nodeId || !nodeType || !store) return null;

  const { interventions, phases, microcycles, sessions } = store;
  const { selectedTags = [] } = options;
  let targetSessions = [];

  // 1. Collect all sessions belonging to the focus node
  if (nodeType === 'Intervention') {
    const intervention = interventions[nodeId];
    if (intervention) {
      const pIds = intervention.phaseIds || [];
      pIds.forEach(pId => {
        const phase = phases[pId];
        (phase?.microcycleIds || []).forEach(mId => {
          const micro = microcycles[mId];
          (micro?.sessionIds || []).forEach(sId => {
            if (sessions[sId]) targetSessions.push(sessions[sId]);
          });
        });
      });
    }
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
  }

  // 2. Aggregate metrics for each session
  const aggregatedSessions = targetSessions
    .map(s => {
      const metrics = aggregateSessionMetrics(s);
      
      // If tags are selected, filter exercises within the metrics calculation
      // Or filter the session entirely if no exercises match (if that's the intent)
      // For now, let's filter metrics based on tags if selectedTags is not empty
      if (selectedTags.length > 0) {
        const exercises = Object.values(s.exercises || {});
        const filteredExercises = exercises.filter(ex => {
          const exTags = getExerciseTags(ex);
          return selectedTags.some(t => exTags.includes(t));
        });

        let filteredVol = 0;
        let filteredInt = 0;
        const filteredTagVol = {};

        filteredExercises.forEach(ex => {
          const vol = calculateExerciseVolume(ex);
          filteredVol += vol;
          filteredInt += (ex.intensity || 0);
          const tags = getExerciseTags(ex);
          tags.forEach(tag => {
            filteredTagVol[tag] = (filteredTagVol[tag] || 0) + vol;
          });
        });

        return {
          ...metrics,
          volume: filteredVol,
          avgIntensity: filteredExercises.length > 0 ? filteredInt / filteredExercises.length : 0,
          tagVolume: filteredTagVol,
          exerciseCount: filteredExercises.length
        };
      }
      return { ...metrics, exerciseCount: Object.keys(s.exercises || {}).length };
    })
    .filter(s => selectedTags.length === 0 || s.exerciseCount > 0) // Hide empty sessions if filtering
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // 3. Compute Global Totals & Distributions
  let totalVolume = 0;
  const globalTagVolume = {};
  const trendData = aggregatedSessions.map(s => ({
    name: s.name,
    date: new Date(s.date).toLocaleDateString(),
    volume: s.volume,
    intensity: s.avgIntensity
  }));

  aggregatedSessions.forEach(s => {
    totalVolume += s.volume;
    Object.entries(s.tagVolume).forEach(([tag, vol]) => {
      globalTagVolume[tag] = (globalTagVolume[tag] || 0) + vol;
    });
  });

  const distributionData = Object.entries(globalTagVolume)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    focusName: nodeId,
    summary: {
      totalVolume: totalVolume.toLocaleString(),
      avgIntensity: aggregatedSessions.length > 0 
        ? (_.sumBy(aggregatedSessions, 'avgIntensity') / aggregatedSessions.length).toFixed(1) + '%'
        : '0%',
      sessionCount: aggregatedSessions.length,
      workloadRatio: '1.0'
    },
    trendData,
    distributionData
  };
};
