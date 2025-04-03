import { create } from "zustand";

const useFlowStore = create((set, get) => ({
  // Map to store flow states by patientId
  flowStates: {},
  selectedNodeId: [],
  columnsLayout: [],
  rowsData: [],
  
  // Save flow state for a specific patient
  saveFlowState: (patientId, nodes, edges) => set((state) => ({
    flowStates: {
      ...state.flowStates,
      [patientId]: { nodes, edges }
    }
  })),
  
  // Get flow state for a specific patient
  getFlowState: (patientId) => {
    const state = get();
    return state.flowStates[patientId] || { nodes: [], edges: [] };
  },
  
  // Clear flow state for a specific patient
  clearFlowState: (patientId) => set((state) => {
    const { [patientId]: _, ...rest } = state.flowStates;
    return { flowStates: rest };
  }),

  setSelectedNodeId: (nodeId) => set((state) => ({ ...state, selectedNodeId: nodeId})),

  setColumnsLayout: (layout) => set((state) => ({... state, columnsLayout: layout})),

  setRowsData: (data) => set((state) => ({... state, rowsData: data})),

}));

export default useFlowStore;
