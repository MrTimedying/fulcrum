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

/**
 * Calculates inherited tags for exercises based on their parent node hierarchy
 * @param {Object} sessionNode - The session node containing exercises
 * @param {Array} allNodes - Array of all nodes in the flow
 * @param {Array} allEdges - Array of all edges in the flow
 * @returns {Array} - Array of tag strings inherited from parent nodes
 */
export const getInheritedTagsForSession = (sessionNode, allNodes, allEdges) => {
  if (!sessionNode || !allNodes || !allEdges) return [];
  
  const inheritedTags = [];
  
  // Add session's own tags
  if (sessionNode.data?.tags) {
    const sessionTags = sessionNode.data.tags
      .split(';')
      .map(tag => tag.trim())
      .filter(tag => tag && tag.startsWith('#'))
      .map(tag => tag.substring(1));
    inheritedTags.push(...sessionTags);
  }
  
  // Find parent micro node
  const parentMicroEdge = allEdges.find(edge => 
    edge.target === sessionNode.id && 
    allNodes.find(n => n.id === edge.source && n.type === 'micro')
  );
  
  if (parentMicroEdge) {
    const microNode = allNodes.find(n => n.id === parentMicroEdge.source);
    if (microNode?.data?.tags) {
      const microTags = microNode.data.tags
        .split(';')
        .map(tag => tag.trim())
        .filter(tag => tag && tag.startsWith('#'))
        .map(tag => tag.substring(1));
      inheritedTags.push(...microTags);
    }
    
    // Find parent phase node
    const parentPhaseEdge = allEdges.find(edge => 
      edge.target === microNode.id && 
      allNodes.find(n => n.id === edge.source && n.type === 'phase')
    );
    
    if (parentPhaseEdge) {
      const phaseNode = allNodes.find(n => n.id === parentPhaseEdge.source);
      if (phaseNode?.data?.tags) {
        const phaseTags = phaseNode.data.tags
          .split(';')
          .map(tag => tag.trim())
          .filter(tag => tag && tag.startsWith('#'))
          .map(tag => tag.substring(1));
        inheritedTags.push(...phaseTags);
      }
    }
  }
  
  // Remove duplicates and return
  return [...new Set(inheritedTags)];
};

/**
 * Enhances exercise data with inherited tags for analysis purposes
 * @param {Array} exerciseData - Array of exercise objects
 * @param {Object} sessionNode - The session node containing these exercises
 * @param {Array} allNodes - Array of all nodes in the flow
 * @param {Array} allEdges - Array of all edges in the flow
 * @returns {Array} - Array of exercise objects with inheritedTags property
 */
export const enhanceExercisesWithInheritedTags = (exerciseData, sessionNode, allNodes, allEdges) => {
  const inheritedTags = getInheritedTagsForSession(sessionNode, allNodes, allEdges);
  
  return exerciseData.map(exercise => ({
    ...exercise,
    inheritedTags,
    allTags: [...new Set([...exercise.tags, ...inheritedTags])] // Combine exercise tags with inherited tags
  }));
}; 