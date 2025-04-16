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