import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

const useFlowStore = create((set, get) => ({
  // Map to store flow states by patientId
  flowStates: {},
  selectedNodeId: [],
  columnsLayout: [],
  rowsData: [],
  nodes: [],  // Global nodes
  edges: [],  // Global edges

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },
  
  setNodes: (payload) => {
    set((state) => ({
      nodes: typeof payload === "function" ? payload(state.nodes) : payload,
    }));
  },
  // `setEdges` Implementation
  setEdges: (payload) => {
    set((state) => ({
      edges: typeof payload === "function" ? payload(state.edges) : payload,
    }));
  },
  
  
  initializeFlowState: (patientId) => {
    const flowState = get().flowStates[patientId] || { nodes: [], edges: [] };
    set({ nodes: flowState.nodes, edges: flowState.edges });
  },

  saveFlowState: (patientId) => {
    const { nodes, edges } = get();
    set((state) => ({
      flowStates: {
        ...state.flowStates,
        [patientId]: { nodes, edges },
      },
    }));
  },

  setSelectedNodeId: (nodeId) => set((state) => ({ ...state, selectedNodeId: nodeId})),

  setColumnsLayout: (layout) => set((state) => ({... state, columnsLayout: layout})),

  setRowsData: (data) => set((state) => ({... state, rowsData: data})),

}));

export default useFlowStore;
