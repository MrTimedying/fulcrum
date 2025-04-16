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
  const idMap = {};
  const newNodes = nodes.map(node => {
    const newId = uuidv4();
    idMap[node.id] = newId;
    return { ...node, id: newId, selected: false };
  });
  const newEdges = edges.map(edge => ({
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