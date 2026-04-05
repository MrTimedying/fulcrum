import ELK from "elkjs";

const elk = new ELK();

export const elkOptions: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

export interface LayoutNode {
  id: string;
  width?: number;
  height?: number;
  type?: string;
  position?: { x: number; y: number };
  targetPosition?: "top" | "bottom" | "left" | "right";
  sourcePosition?: "top" | "bottom" | "left" | "right";
  [key: string]: any;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  [key: string]: any;
}

export const getLayoutedElements = (
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options: Record<string, string> = {}
): Promise<{ nodes: LayoutNode[]; edges: LayoutEdge[] }> => {
  const isHorizontal = options?.["elk.direction"] === "DOWN";
  
  // Validate input before processing
  if (!nodes || !edges) {
    console.error("Missing nodes or edges for layout");
    return Promise.resolve({ nodes: nodes || [], edges: edges || [] });
  }
  
  // Create a simplified version of nodes for ELK that only includes what ELK needs
  const nodesForLayout = nodes
    .filter(node => {
      // Filter out nodes without IDs
      if (!node?.id) {
        console.error("Found node without ID during layout:", node);
        return false;
      }
      return true;
    })
    .map(node => {
      // Create a minimal node object for ELK to avoid issues
      return {
        id: node.id,
        width: node.width || 150, // Provide default if missing
        height: node.height || 50, // Provide default if missing
        // Only these basic properties needed for layout
        type: node.type, 
        // ELK specific data
        targetPosition: node.type === "session" 
          ? (isHorizontal ? "top" : "left")
          : (isHorizontal ? "left" : "top"),
        sourcePosition: node.type === "session"
          ? (isHorizontal ? "bottom" : "right")
          : (isHorizontal ? "right" : "bottom")
      };
    });

  // Create a simplified version of edges for ELK, filtering out any with missing source/target
  const edgesForLayout = edges
    .filter(edge => {
      if (!edge?.id || !edge?.source || !edge?.target) {
        console.error("Found edge with missing id/source/target during layout:", edge);
        return false;
      }
      
      // Check that source and target nodes exist in the nodes array
      const sourceExists = nodesForLayout.some(node => node.id === edge.source);
      const targetExists = nodesForLayout.some(node => node.id === edge.target);
      
      if (!sourceExists || !targetExists) {
        console.warn("Edge references non-existent node:", edge);
        return false;
      }
      
      return true;
    })
    .map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target
    }));

  // If we filtered out all nodes or edges, return early
  if (nodesForLayout.length === 0) {
    console.warn("No valid nodes for layout after filtering");
    return Promise.resolve({ nodes, edges });
  }

  const graph = {
    id: "root",
    layoutOptions: options,
    children: nodesForLayout as any,
    edges: edgesForLayout
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => {
      if (!layoutedGraph || !layoutedGraph.children) {
        console.error("ELK layout returned invalid result", layoutedGraph);
        return { nodes, edges }; // Return original nodes and edges if layout fails
      }
      
      // Map the layout positions back to the original nodes
      const updatedNodes = nodes.map(originalNode => {
        // Skip nodes without IDs
        if (!originalNode?.id) return originalNode;
        
        const layoutedNode = layoutedGraph.children?.find(n => n.id === originalNode.id);
        
        if (!layoutedNode) {
          // If layout didn't return this node, keep it as is
          return originalNode;
        }
        
        // Update only the position from layout, preserving all other properties
        return {
          ...originalNode,
          position: { 
            x: layoutedNode.x !== undefined ? layoutedNode.x : (originalNode.position?.x || 0),
            y: layoutedNode.y !== undefined ? layoutedNode.y : (originalNode.position?.y || 0)
          },
          // Update handle positions based on node type
          targetPosition: originalNode.type === "session" 
            ? (isHorizontal ? "top" : "left")
            : (isHorizontal ? "left" : "top"),
          sourcePosition: originalNode.type === "session"
            ? (isHorizontal ? "bottom" : "right") 
            : (isHorizontal ? "right" : "bottom")
        } as LayoutNode;
      });

      return {
        nodes: updatedNodes,
        edges: edges // Keep original edges, ELK only changes node positions
      };
    })
    .catch(error => {
      console.error("ELK layout error:", error);
      return { nodes, edges }; // Return original nodes and edges on error
    });
};
