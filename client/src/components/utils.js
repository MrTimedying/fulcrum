import { v4 as uuidv4 } from 'uuid';

function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

export {debounce};

export function remapNodesAndEdgesWithNewIds(nodes, edges) {
  // Create a map of old IDs to new IDs
  const idMap = {};
  
  // First pass: create new IDs for all nodes
  const newNodes = nodes.map(node => {
    // Ensure node has an ID
    if (!node.id) {
      console.warn("Node missing ID during remap operation");
      return null;
    }
    
    const newId = uuidv4();
    idMap[node.id] = newId;
    return { ...node, id: newId, selected: false };
  }).filter(Boolean); // Filter out any null nodes
  
  // Second pass: process edges, keeping only those where both source and target are in idMap
  const newEdges = edges
    .filter(edge => {
      // Skip edges without source or target
      if (!edge.source || !edge.target) {
        console.warn("Edge missing source or target:", edge);
        return false;
      }
      
      // Skip edges that reference nodes not in our selection
      if (!idMap[edge.source] || !idMap[edge.target]) {
        console.info("Skipping edge connecting to non-copied node:", edge);
        return false;
      }
      
      return true;
    })
    .map(edge => ({
      ...edge,
      id: uuidv4(),
      source: idMap[edge.source],
      target: idMap[edge.target],
    }));
    
  return { newNodes, newEdges };
}

// Clear the 'date' property from node.data
export function clearDatesFromNodes(nodes) {
  return nodes.map(node => ({
    ...node,
    data: { ...(node.data || {}), date: undefined },
  }));
}

// Offset positions of nodes and edges by (dx, dy)
export function offsetNodesEdgesPosition(nodes, edges, dx = 100, dy = 100) {
  const offsetedNodes = nodes.map(node => ({
    ...node,
    position: {
      x: (node.position?.x ?? node.x ?? 0) + dx,
      y: (node.position?.y ?? node.y ?? 0) + dy,
    },
  }));
  const offsetedEdges = edges.map(edge => ({
    ...edge,
    sourceX: (edge.sourceX ?? 0) + dx,
    sourceY: (edge.sourceY ?? 0) + dy,
    targetX: (edge.targetX ?? 0) + dx,
    targetY: (edge.targetY ?? 0) + dy,
  }));
  return { offsetedNodes, offsetedEdges };
}