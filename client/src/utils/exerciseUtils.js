/**
 * Utility functions for handling exercise container data
 */

/**
 * Extracts the display name from a mangled container key
 * @param {string} mangledKey - The mangled key in format "containerName_containerId"
 * @returns {string} The original container name without the ID suffix
 */
export const getExerciseContainerDisplayName = (mangledKey) => {
  if (!mangledKey || typeof mangledKey !== 'string') {
    return '';
  }
  
  // Find the last occurrence of underscore
  const lastUnderscoreIndex = mangledKey.lastIndexOf('_');
  
  // If no underscore is found, return the original string
  if (lastUnderscoreIndex === -1) {
    return mangledKey;
  }
  
  // Return the substring before the last underscore
  return mangledKey.substring(0, lastUnderscoreIndex);
};

/**
 * Extracts the container ID from a mangled container key
 * @param {string} mangledKey - The mangled key in format "containerName_containerId"
 * @returns {string} The container ID portion of the key
 */
export const getExerciseContainerId = (mangledKey) => {
  if (!mangledKey || typeof mangledKey !== 'string') {
    return '';
  }
  
  // Find the last occurrence of underscore
  const lastUnderscoreIndex = mangledKey.lastIndexOf('_');
  
  // If no underscore is found, return empty string
  if (lastUnderscoreIndex === -1) {
    return '';
  }
  
  // Return the substring after the last underscore
  return mangledKey.substring(lastUnderscoreIndex + 1);
};

/**
 * Creates a mangled key from a container name and ID
 * @param {string} containerName - The display name of the container
 * @param {string} containerId - The unique ID of the container
 * @returns {string} The mangled key in format "containerName_containerId"
 */
export const createMangledContainerKey = (containerName, containerId) => {
  if (!containerName || !containerId) {
    return containerName || '';
  }
  
  return `${containerName}_${containerId}`;
}; 