import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

const useFlowStore = create((set, get) => ({
  // Map to store flow states by patientId
  patientId: "",
  activeTab: "Profile",
  editorStates: {},
  profileStates: {},
  selectedNodeId: [],
  columnsLayout: [],
  rowsData: [],
  nodes: [],  // Global nodes
  edges: [],  // Global edges

  
  setPatientId: (id) => {
    set({ patientId: id }); 
    const { activeTab, hydrateBasedOnTab } = get();
    hydrateBasedOnTab(id, activeTab); 
  },

  // Change Tab (Profile or Editor) - Reacts to tab changes
  setActiveTab: (tab) => {
    set({ activeTab: tab }); // Update activeTab in the store
    const { patientId, hydrateBasedOnTab } = get();
    if (patientId) {
      hydrateBasedOnTab(patientId, tab); // Rehydrate if already on a patient
    }
  },

  // Hydrate nodes and edges based on activeTab
  hydrateBasedOnTab: (patientId, activeTab) => {
    console.log("Hydrating for PatientId:", patientId, "Tab:", activeTab);
    console.log("EditorStates:", get().editorStates);
    console.log("ProfileStates:", get().profileStates);
  
    if (activeTab === "Editor") {
      const editorState = get().editorStates[patientId];
      console.log("Editor State:", editorState);
      if (editorState) {
        set({
          nodes: editorState.nodes || [],
          edges: editorState.edges || [],
        });
      } else {
        console.warn(`No editor state found for patientId: ${patientId}`);
      }
    } else if (activeTab === "Profile") {
      const profileState = get().profileStates[patientId];
      console.log("Profile State:", profileState);
      if (profileState) {
        set({
          nodes: profileState.nodes || [],
          edges: profileState.edges || [],
        });
      } else {
        console.warn(`No profile state found for patientId: ${patientId}`);
      }
    }
  },
  

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

  // Save Editor State
  setEditorState: (patientId) => {
    const { nodes, edges } = get();
    set((state) => ({
      editorStates: {
        ...state.editorStates,
        [patientId]: { nodes, edges },
      },
    }));
  },

  // Save Profile State
  setProfileState: (patientId) => {
    const { nodes, edges } = get();
    set((state) => ({
      profileStates: {
        ...state.profileStates,
        [patientId]: { nodes, edges },
      },
    }));
  },

  setSelectedNodeId: (nodeId) => set((state) => ({ ...state, selectedNodeId: nodeId})),

  setColumnsLayout: (layout) => set((state) => ({... state, columnsLayout: layout})),

  setRowsData: (data) => set((state) => ({... state, rowsData: data})),

}));

export default useFlowStore;
