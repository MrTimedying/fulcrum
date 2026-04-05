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
 * Validates if a date would cause order conflicts
 * @param {Object} node - The current node
 * @param {Date} proposedDate - The date to validate
 * @param {Array} allNodes - All nodes in the flow
 * @returns {Object} Validation result {valid, message}
 */
export const validateDateOrder = (node, proposedDate, allNodes) => {
  if (!node || !isSessionNode(node) || !node.data?.order || !proposedDate || !allNodes || !allNodes.length) {
    return { valid: true, message: '' };
  }

  const orderedNodesWithDates = getOrderedNodesWithDates(allNodes);
  
  // Find previous nodes (with lower order)
  const prevNodes = orderedNodesWithDates
    .filter(n => n.id !== node.id && n.data.order < node.data.order);
  
  // Find next nodes (with higher order)
  const nextNodes = orderedNodesWithDates
    .filter(n => n.id !== node.id && n.data.order > node.data.order);
  
  // Check if any previous node has a later date
  const standardizedProposedDate = standardizeDate(proposedDate);
  
  for (const prevNode of prevNodes) {
    const prevDate = standardizeDate(prevNode.data.date);
    if (prevDate && standardizedProposedDate < prevDate) {
      return {
        valid: false,
        message: `This date is earlier than node #${prevNode.data.order} (${formatDateForPicker(prevDate)})`
      };
    }
  }
  
  // Check if any next node has an earlier date
  for (const nextNode of nextNodes) {
    const nextDate = standardizeDate(nextNode.data.date);
    if (nextDate && standardizedProposedDate > nextDate) {
      return {
        valid: false, 
        message: `This date is later than node #${nextNode.data.order} (${formatDateForPicker(nextDate)})`
      };
    }
  }
  
  return { valid: true, message: '' };
};
