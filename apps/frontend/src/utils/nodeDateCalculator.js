/**
 * Utilities for calculating dates based on node order
 */

import { addDays } from 'date-fns';
import { getNextAvailableDate, standardizeDate, formatDateForPicker } from './dateUtils';

/**
 * Checks if a node is a Session node
 * @param {Object} node - The node to check
 * @returns {boolean} True if the node is a Session node
 */
export const isSessionNode = (node) => {
  return node && (node.type === 'session' || node.type === 'Session');
};

/**
 * Gets all Session nodes with an order property, sorted by order
 * @param {Array} nodes - All nodes in the flow
 * @returns {Array} Sorted array of Session nodes with order
 */
export const getOrderedNodes = (nodes) => {
  if (!nodes || !nodes.length) return [];

  return nodes
    .filter(node => isSessionNode(node) && node.data?.order !== undefined && node.data.order !== null)
    .sort((a, b) => a.data.order - b.data.order);
};

/**
 * Gets Session nodes with both order and date assigned
 * @param {Array} nodes - All nodes in the flow
 * @returns {Array} Sorted array of Session nodes with order and date
 */
export const getOrderedNodesWithDates = (nodes) => {
  if (!nodes || !nodes.length) return [];

  return getOrderedNodes(nodes)
    .filter(node => node.data?.date);
};

/**
 * Gets unavailable dates from all Session nodes except the current one
 * @param {Array} nodes - All nodes in the flow
 * @param {string} currentNodeId - ID of the current node
 * @returns {Array} Array of unavailable date strings
 */
export const getUnavailableDatesExcept = (nodes, currentNodeId) => {
  if (!nodes || !nodes.length) return [];

  return nodes
    .filter(node => isSessionNode(node) && node.id !== currentNodeId && node.data?.date)
    .map(node => formatDateForPicker(node.data.date))
    .filter(Boolean);
};

/**
 * Calculates a suggested date based on node order
 * @param {Object} node - The current node
 * @param {Array} allNodes - All nodes in the flow
 * @param {boolean} skipWeekends - Whether to skip weekends
 * @returns {Date|null} Suggested date or null if can't be calculated
 */
export const calculateSuggestedDate = (node, allNodes, skipWeekends = true) => {
  if (!node || !isSessionNode(node) || !node.data?.order || !allNodes || !allNodes.length) {
    return null;
  }

  const orderedNodesWithDates = getOrderedNodesWithDates(allNodes);
  const unavailableDates = getUnavailableDatesExcept(allNodes, node.id);
  
  // If no nodes have dates yet, suggest starting from today
  if (orderedNodesWithDates.length === 0) {
    return getNextAvailableDate(new Date(), unavailableDates, skipWeekends);
  }

  // If this is the first node by order, suggest today or next available
  if (node.data.order === 1) {
    return getNextAvailableDate(new Date(), unavailableDates, skipWeekends);
  }

  // Find the previous node with order (the highest order less than current)
  const prevNodes = orderedNodesWithDates
    .filter(n => n.data.order < node.data.order)
    .sort((a, b) => b.data.order - a.data.order);
  
  // If no previous nodes have dates, start from today
  if (!prevNodes.length) {
    return getNextAvailableDate(new Date(), unavailableDates, skipWeekends);
  }

  const prevNode = prevNodes[0];
  const prevDate = standardizeDate(prevNode.data.date);
  
  if (!prevDate) {
    return getNextAvailableDate(new Date(), unavailableDates, skipWeekends);
  }

  // Suggest next available day after previous node's date
  return getNextAvailableDate(
    addDays(prevDate, 1),
    unavailableDates,
    skipWeekends
  );
};

/**
 * Validates if a date would cause order conflicts for a node
 * @param {Object} node - The current node
 * @param {Date} proposedDate - The date to validate
 * @param {Array} allNodes - All nodes in the flow
 * @returns {Object} Validation result {valid, message}
 */
export const validateDateOrder = (node, proposedDate, allNodes) => {
  if (!node || !isSessionNode(node) || !node.data?.order || !proposedDate || !allNodes) {
    return { valid: true, message: '' };
  }

  const orderedNodesWithDates = getOrderedNodesWithDates(allNodes);
  const standardizedProposedDate = standardizeDate(proposedDate);
  
  const prevNodes = orderedNodesWithDates.filter(n => n.id !== node.id && n.data.order < node.data.order);
  const nextNodes = orderedNodesWithDates.filter(n => n.id !== node.id && n.data.order > node.data.order);
  
  for (const prev of prevNodes) {
    const prevDate = standardizeDate(prev.data.date);
    if (prevDate && standardizedProposedDate < prevDate) {
      return {
        valid: false,
        message: `Earlier than Session #${prev.data.order} (${formatDateForPicker(prevDate)})`
      };
    }
  }
  
  for (const next of nextNodes) {
    const nextDate = standardizeDate(next.data.date);
    if (nextDate && standardizedProposedDate > nextDate) {
      return {
        valid: false, 
        message: `Later than Session #${next.data.order} (${formatDateForPicker(nextDate)})`
      };
    }
  }
  
  return { valid: true, message: '' };
};

/**
 * Gets all sessions for a specific intervention, sorted by order
 * @param {Object} sessionsMap - The map of all sessions from store
 * @param {string} interventionId - ID of the intervention
 * @returns {Array} Sorted array of session objects
 */
export const getOrderedSessions = (sessionsMap, interventionId) => {
  if (!sessionsMap || !interventionId) return [];

  return Object.values(sessionsMap)
    .filter(session => session.interventionId === interventionId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

/**
 * Gets sessions with both order and date assigned
 * @param {Object} sessionsMap - The map of all sessions from store
 * @param {string} interventionId - ID of the intervention
 * @returns {Array} Sorted array of session objects with dates
 */
export const getOrderedSessionsWithDates = (sessionsMap, interventionId) => {
  return getOrderedSessions(sessionsMap, interventionId)
    .filter(session => session.date);
};

/**
 * Gets unavailable dates from all sessions in an intervention except the current one
 * @param {Object} sessionsMap - The map of all sessions from store
 * @param {string} interventionId - ID of the intervention
 * @param {string} currentSessionId - ID of the current session
 * @returns {Array} Array of unavailable date strings
 */
export const getUnavailableSessionDatesExcept = (sessionsMap, interventionId, currentSessionId) => {
  if (!sessionsMap || !interventionId) return [];

  return Object.values(sessionsMap)
    .filter(session => 
      session.interventionId === interventionId && 
      session.id !== currentSessionId && 
      session.date
    )
    .map(session => formatDateForPicker(session.date))
    .filter(Boolean);
};

/**
 * Calculates a suggested date based on session order
 * @param {Object} session - The current session
 * @param {Object} sessionsMap - All sessions
 * @param {boolean} skipWeekends - Whether to skip weekends
 * @returns {Date|null} Suggested date or null if can't be calculated
 */
export const calculateSuggestedSessionDate = (session, sessionsMap, skipWeekends = true) => {
  if (!session || !session.order || !sessionsMap) {
    return null;
  }

  const orderedSessionsWithDates = getOrderedSessionsWithDates(sessionsMap, session.interventionId);
  const unavailableDates = getUnavailableSessionDatesExcept(sessionsMap, session.interventionId, session.id);
  
  if (orderedSessionsWithDates.length === 0 || session.order === 1) {
    return getNextAvailableDate(new Date(), unavailableDates, skipWeekends);
  }

  const prevSessions = orderedSessionsWithDates
    .filter(s => s.order < session.order)
    .sort((a, b) => b.order - a.order);
  
  if (!prevSessions.length) {
    return getNextAvailableDate(new Date(), unavailableDates, skipWeekends);
  }

  const prevSession = prevSessions[0];
  const prevDate = standardizeDate(prevSession.date);
  
  if (!prevDate) {
    return getNextAvailableDate(new Date(), unavailableDates, skipWeekends);
  }

  return getNextAvailableDate(
    addDays(prevDate, 1),
    unavailableDates,
    skipWeekends
  );
};

/**
 * Validates if a date would cause order conflicts for a session
 * @param {Object} session - The current session
 * @param {Date} proposedDate - The date to validate
 * @param {Object} sessionsMap - All sessions
 * @returns {Object} Validation result {valid, message}
 */
export const validateSessionDateOrder = (session, proposedDate, sessionsMap) => {
  if (!session || !session.order || !proposedDate || !sessionsMap) {
    return { valid: true, message: '' };
  }

  const orderedSessionsWithDates = getOrderedSessionsWithDates(sessionsMap, session.interventionId);
  const standardizedProposedDate = standardizeDate(proposedDate);
  
  const prevSessions = orderedSessionsWithDates.filter(s => s.id !== session.id && s.order < session.order);
  const nextSessions = orderedSessionsWithDates.filter(s => s.id !== session.id && s.order > session.order);
  
  for (const prev of prevSessions) {
    const prevDate = standardizeDate(prev.date);
    if (prevDate && standardizedProposedDate < prevDate) {
      return {
        valid: false,
        message: `Earlier than Session #${prev.order} (${formatDateForPicker(prevDate)})`
      };
    }
  }
  
  for (const next of nextSessions) {
    const nextDate = standardizeDate(next.date);
    if (nextDate && standardizedProposedDate > nextDate) {
      return {
        valid: false, 
        message: `Later than Session #${next.order} (${formatDateForPicker(nextDate)})`
      };
    }
  }
  
  return { valid: true, message: '' };
};
