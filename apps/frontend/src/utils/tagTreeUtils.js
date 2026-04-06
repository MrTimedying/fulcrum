import * as _ from 'lodash';
import { isValid, parseISO } from 'date-fns';

/**
 * Transforms pointer-based structure into a tree structure for react-arborist.
 * @param {Object} intervention - The active intervention object
 * @param {Object} phases - All phases records
 * @param {Object} micros - All microcycles records
 * @param {Object} sessions - All sessions records
 * @returns {Array} Tree structure for react-arborist
 */
export const getStructureTree = (intervention, phases, micros, sessions) => {
  if (!intervention || !intervention.phaseIds) return [];

  const allAssignedSessionIds = new Set();

  // 1. Build the main hierarchical tree
  const tree = (intervention.phaseIds || []).map(phaseId => {
    const phase = phases[phaseId];
    if (!phase) return null;

    const phaseMicros = (phase.microcycleIds || []).map(microId => {
      const micro = micros[microId];
      if (!micro) return null;

      const microSessions = (micro.sessionIds || []).map(sessionId => {
        const session = sessions[sessionId];
        if (!session) return null;
        
        allAssignedSessionIds.add(sessionId);

        return {
          id: session.id,
          name: session.name || 'Unnamed Session',
          type: 'session',
          originalNode: session,
          isLeaf: true,
          parentId: micro.id
        };
      }).filter(Boolean);

      // Deduct dates for Microcycle
      const sessionDates = microSessions
        .map(s => s.originalNode.date)
        .filter(Boolean)
        .map(d => parseISO(d))
        .filter(isValid);
      
      const startDate = sessionDates.length > 0 ? new Date(Math.min(...sessionDates)) : null;
      const endDate = sessionDates.length > 0 ? new Date(Math.max(...sessionDates)) : null;

      return {
        id: micro.id,
        name: micro.name || 'Unnamed Microcycle',
        type: 'folder',
        tagKey: 'Micro',
        startDate,
        endDate,
        children: microSessions,
        parentId: phase.id
      };
    }).filter(Boolean);

    // Deduct dates for Phase from its Micros
    const microDates = phaseMicros
      .map(m => [m.startDate, m.endDate])
      .flat()
      .filter(Boolean);
    
    const phaseStart = microDates.length > 0 ? new Date(Math.min(...microDates)) : null;
    const phaseEnd = microDates.length > 0 ? new Date(Math.max(...microDates)) : null;

    return {
      id: phase.id,
      name: phase.name || 'Unnamed Phase',
      type: 'folder',
      tagKey: 'Phase',
      startDate: phaseStart,
      endDate: phaseEnd,
      children: phaseMicros,
      parentId: null
    };
  }).filter(Boolean);

  // 2. Identify and add orphaned sessions
  const orphanedSessions = Object.values(sessions)
    .filter(s => s.interventionId === intervention.id && !allAssignedSessionIds.has(s.id))
    .map(s => ({
      id: s.id,
      name: s.name || 'Orphaned Session',
      type: 'session',
      originalNode: s,
      isLeaf: true,
      parentId: 'orphaned'
    }));

  if (orphanedSessions.length > 0) {
    tree.push({
      id: 'folder-orphaned',
      name: 'Unassigned Sessions',
      type: 'folder',
      tagKey: 'Orphaned',
      children: orphanedSessions,
      parentId: null
    });
  }

  return tree;
};
