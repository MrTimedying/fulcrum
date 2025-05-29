/**
 * Date utility functions for procedural date assignment
 */

import { format, addDays, isWeekend, isEqual, parseISO } from 'date-fns';

/**
 * Formats a date for the date picker
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDateForPicker = (date) => {
  if (!date) return '';
  if (typeof date === 'string') {
    // Try to parse the date if it's a valid string
    try {
      return format(parseISO(date), 'yyyy-MM-dd');
    } catch (e) {
      return '';
    }
  }
  if (date instanceof Date && !isNaN(date)) {
    return format(date, 'yyyy-MM-dd');
  }
  return '';
};

/**
 * Checks if a date is in an array of unavailable dates
 * @param {Date} date - The date to check
 * @param {Array} unavailableDates - Array of unavailable date strings
 * @returns {boolean} True if the date is unavailable
 */
export const isDateUnavailable = (date, unavailableDates) => {
  if (!date || !unavailableDates || !unavailableDates.length) return false;
  
  const formattedDate = formatDateForPicker(date);
  return unavailableDates.includes(formattedDate);
};

/**
 * Gets the next available date starting from a given date
 * @param {Date} startDate - The date to start from
 * @param {Array} unavailableDates - Array of unavailable date strings
 * @param {boolean} skipWeekends - Whether to skip weekends
 * @returns {Date} The next available date
 */
export const getNextAvailableDate = (startDate, unavailableDates = [], skipWeekends = true) => {
  if (!startDate) return new Date();
  
  let currentDate = new Date(startDate);
  let foundAvailable = false;
  let maxIterations = 365; // Safety limit
  
  while (!foundAvailable && maxIterations > 0) {
    // Skip weekends if requested
    if (skipWeekends && isWeekend(currentDate)) {
      currentDate = addDays(currentDate, 1);
      continue;
    }
    
    // Check if date is unavailable
    if (isDateUnavailable(currentDate, unavailableDates)) {
      currentDate = addDays(currentDate, 1);
    } else {
      foundAvailable = true;
    }
    
    maxIterations--;
  }
  
  return currentDate;
};

/**
 * Converts various date formats to a standard Date object
 * @param {string|Date} date - The date to standardize
 * @returns {Date|null} Standardized Date object or null if invalid
 */
export const standardizeDate = (date) => {
  if (!date) return null;
  
  if (typeof date === 'string') {
    try {
      return parseISO(date);
    } catch (e) {
      return null;
    }
  }
  
  if (date instanceof Date && !isNaN(date)) {
    return date;
  }
  
  return null;
};
