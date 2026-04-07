import * as _ from 'lodash';
import { isValid, parseISO } from 'date-fns';
import { getExerciseContainerDisplayName } from './exerciseUtils';

/**
 * Builds a hierarchical content object for saving as a template.
 * @param {string} id - The ID of the item (Phase, Micro, or Session)
 * @param {string} type - The type of the item ('Phase', 'Micro', or 'Session')
 * @param {Object} phases - All phases records
 * @param {Object} micros - All microcycles records
 * @param {Object} sessions - All sessions records
 * @returns {Object} Hierarchical content for template
 */
export const buildHierarchicalContent = (id, type, phases, micros, sessions) => {
  const build = (nodeId, nodeType) => {
    if (nodeType === 'Phase') {
      const item = phases[nodeId];
      if (!item) return null;
      const { id: _id, microcycleIds, ...data } = item;
      return {
        type: 'Phase',
        data,
        microcycles: (microcycleIds || []).map(mid => build(mid, 'Micro')).filter(Boolean)
      };
    }
    if (nodeType === 'Micro') {
      const item = micros[nodeId];
      if (!item) return null;
      const { id: _id, sessionIds, ...data } = item;
      return {
        type: 'Micro',
        data,
        sessions: (sessionIds || []).map(sid => build(sid, 'Session')).filter(Boolean)
      };
    }
    if (nodeType === 'Session') {
      const item = sessions[nodeId];
      if (!item) return null;
      const { id: _id, interventionId, ...data } = item;
      return {
        type: 'Session',
        data
      };
    }
    return null;
  };

  return build(id, type);
};
