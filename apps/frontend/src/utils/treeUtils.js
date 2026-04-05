import * as _ from 'lodash';

/**
 * Transforms flat nodes and edges from xyflow into a tree structure for react-arborist.
 * @param {Array} nodes 
 * @param {Array} edges 
 * @returns {Array} Tree structure
 */
export const getInterventionTree = (nodes, edges) => {
  if (!nodes || nodes.length === 0) return [];

  // 1. Identify all nodes by ID for quick access
  const nodesById = _.keyBy(nodes, 'id');

  // 2. Identify all outgoing edges by source ID
  const edgesBySource = _.groupBy(edges, 'source');

  // 3. Find root nodes (intervention type)
  const rootNodes = nodes.filter(node => node.type === 'intervention');

  // Recursive function to build the tree
  const buildTree = (node) => {
    const nodeData = {
      id: node.id,
      name: node.data?.label || node.data?.name || node.data?.scope || `Unnamed ${node.type}`,
      type: node.type,
      originalNode: node,
      children: []
    };

    // Add child nodes from edges
    const childEdges = edgesBySource[node.id] || [];
    const childrenNodes = childEdges
      .map(edge => nodesById[edge.target])
      .filter(Boolean);
    
    // Sort children by order if available
    const sortedChildren = _.sortBy(childrenNodes, n => n.data?.order || 0);

    nodeData.children = sortedChildren.map(child => buildTree(child));

    // Special case: sessions contain exercises as sub-items (not nodes)
    if (node.type === 'session' && node.data?.exercises && node.data.exercises.length > 0) {
      const exerciseChildren = node.data.exercises.map(ex => ({
        id: `exercise-${ex.id}`,
        name: ex.name || 'Unnamed Exercise',
        type: 'exercise',
        originalExercise: ex,
        isLeaf: true
      }));
      nodeData.children = [...nodeData.children, ...exerciseChildren];
    }

    // If no children, mark as leaf (unless it can have children but they're missing)
    if (nodeData.children.length === 0) {
      delete nodeData.children;
    }

    return nodeData;
  };

  return rootNodes.map(root => buildTree(root));
};
