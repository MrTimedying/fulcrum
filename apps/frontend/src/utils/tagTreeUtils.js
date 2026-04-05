import * as _ from 'lodash';
import { isBefore, isAfter, isValid, parseISO } from 'date-fns';

/**
 * Transforms flat session objects into a dynamic tree structure based on grouping keys.
 * @param {Array} sessions - Array of session objects
 * @param {Array} groupingKeys - Ordered list of keys to group by (e.g., ['Phase', 'Micro'])
 * @returns {Array} Tree structure for react-arborist
 */
export const getDynamicTagTree = (sessions, groupingKeys = ['Phase', 'Micro']) => {
  if (!sessions || sessions.length === 0) return [];

  // Helper to build the tree recursively
  const buildLevel = (items, keys, parentTags = {}, path = '') => {
    if (keys.length === 0) {
      // Sort sessions by date and then by name
      return _.sortBy(items, [
        item => item.date || '',
        item => item.name || ''
      ]).map(session => {
        const sessionData = {
          id: session.id,
          name: session.name || 'Unnamed Session',
          type: 'session',
          originalNode: session, // Keep for backward compat or direct access
          tags: { ...parentTags },
          children: []
        };

        // Add exercises as children if they exist
        if (session.exercises && typeof session.exercises === 'object') {
          sessionData.children = Object.entries(session.exercises).map(([mangledKey, data]) => ({
            id: `exercise-${mangledKey}`,
            name: mangledKey.split('_')[0] || 'Unnamed Exercise',
            type: 'exercise',
            originalExercise: data,
            isLeaf: true
          }));
        }

        if (sessionData.children.length === 0) {
          sessionData.isLeaf = true;
          delete sessionData.children;
        }

        return sessionData;
      });
    }

    const [currentKey, ...remainingKeys] = keys;
    
    // Group items by the value of the current key in their tags
    const grouped = _.groupBy(items, item => {
      const tagValue = item.tags?.[currentKey];
      return tagValue || 'Uncategorized';
    });

    return Object.entries(grouped).map(([value, childItems]) => {
      const currentTags = { ...parentTags, [currentKey]: value };
      const currentPath = path ? `${path}/${value}` : value;
      
      const dates = childItems
        .map(s => s.date)
        .filter(Boolean)
        .map(d => typeof d === 'string' ? parseISO(d) : new Date(d))
        .filter(d => isValid(d));
      
      const startDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
      const endDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;

      return {
        id: `folder-${currentKey}-${currentPath}`,
        name: value,
        type: 'folder',
        tagKey: currentKey,
        tagValue: value,
        tags: currentTags,
        startDate,
        endDate,
        children: buildLevel(childItems, remainingKeys, currentTags, currentPath)
      };
    });
  };

  return buildLevel(sessions, groupingKeys);
};

/**
 * Validates n-consistency (chronological integrity)
 * @param {Object} session - The session being moved
 * @param {Object} prevSibling - The sibling before the new position
 * @param {Object} nextSibling - The sibling after the new position
 * @returns {Object} { valid: boolean, suggestedDate: Date|null }
 */
export const validateNConsistency = (session, prevSibling, nextSibling) => {
  const sessionDate = session.date ? new Date(session.date) : null;
  const prevDate = prevSibling?.date ? new Date(prevSibling.date) : null;
  const nextDate = nextSibling?.date ? new Date(nextSibling.date) : null;

  if (!sessionDate) return { valid: false, suggestedDate: prevDate || nextDate || new Date() };

  let valid = true;
  if (prevDate && isBefore(sessionDate, prevDate)) valid = false;
  if (nextDate && isAfter(sessionDate, nextDate)) valid = false;

  if (valid) return { valid: true, suggestedDate: null };

  let suggestedDate = sessionDate;
  if (prevDate && nextDate) {
    suggestedDate = prevDate; 
  } else if (prevDate) {
    suggestedDate = prevDate;
  } else if (nextDate) {
    suggestedDate = nextDate;
  }

  return { valid: false, suggestedDate };
};

/**
 * Validates k-consistency (taxonomic categorization)
 * @param {Object} session - The session being moved
 * @param {Object} targetParent - The folder node it's being dropped into
 * @returns {Object} { valid: boolean, conflictingTags: Array }
 */
export const validateKConsistency = (session, targetParent) => {
  if (!targetParent || targetParent.type !== 'folder') return { valid: true, conflictingTags: [] };

  const sessionTags = session.tags || {};
  const targetTags = targetParent.tags || {};
  const conflictingTags = [];

  for (const [key, value] of Object.entries(targetTags)) {
    if (sessionTags[key] !== value) {
      conflictingTags.push({ key, expected: value, actual: sessionTags[key] });
    }
  }

  return {
    valid: conflictingTags.length === 0,
    conflictingTags
  };
};
