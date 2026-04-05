import * as _ from "lodash";

export interface ResequenceNode {
  id: string;
  data: {
    order?: number | null;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ResequenceEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: any;
}

/**
 * Resequences the 'order' property of child nodes connected to a common parent.
 * This ensures that children have sequential orders starting from 1.
 * 
 * @param parentId The ID of the parent node whose children should be resequenced
 * @param allNodes All nodes in the current flow
 * @param allEdges All edges in the current flow
 * @returns A new array of nodes with updated order values
 */
export const resequenceSiblingOrders = (
  parentId: string | null,
  allNodes: ResequenceNode[],
  allEdges: ResequenceEdge[]
): ResequenceNode[] => {
  if (!parentId) return allNodes;
  
  // Get all edges where this parent is the source
  const parentEdges = allEdges.filter(edge => edge.source === parentId);
  
  // If no children, nothing to resequence
  if (parentEdges.length === 0) return allNodes;
  
  // Find all child nodes connected to this parent
  const childNodeIds = parentEdges.map(edge => edge.target);
  
  // Clone nodes to avoid reference issues
  const updatedNodes = _.cloneDeep(allNodes);
  
  // Update child nodes with new sequential order values
  childNodeIds.forEach((childId, index) => {
    const nodeIndex = updatedNodes.findIndex(node => node.id === childId);
    if (nodeIndex !== -1) {
      // Add 1 to make orders start from 1 instead of 0
      updatedNodes[nodeIndex].data.order = index + 1;
    }
  });
  
  return updatedNodes;
};
