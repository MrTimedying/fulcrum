import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import * as _ from "lodash";

const useFlowStore = create(
  persist(
    (set, get) => ({
      // Map to store flow states by patientId
      patientId: "",
      trailingPatientId: "",
      activeTab: "Profile",
      trailingActiveTab: "",
      patients: {},
      interventions: {},
      editorStates: {},
      profileStates: {},
      selectedNodeId: [],
      columnsLayout: [],
      rowsData: [],
      nodes: [], // Global nodes
      edges: [], // Global edges

      setPatientId: (id) => {
        if (id === "") {
          return set({ patientId: id });
        }
        const { activeTab, patientId, hydrateFlowState } = get();
        console.log("Saving state for patient:", patientId);
        if (patientId) {
          // Only save if there was a previous patient
          if (activeTab === "Profile") {
            get().setProfileState(patientId);
          } else if (activeTab === "Editor") {
            get().setEditorState(patientId);
          }
        }
        set({ patientId: id, trailingPatientId: patientId });
        set({ nodes: [], edges: [] });
        hydrateFlowState(id, activeTab);
      },

      // In setActiveTab function: add explicit saving at the beginning
      setActiveTab: (tab) => {
        const { patientId, hydrateFlowState, tabStateLogic, activeTab } = get();

        // Explicitly save current state before switching
        console.log("Saving state for tab:", activeTab);
        if (activeTab === "Profile") {
          get().setProfileState(patientId);
        } else if (activeTab === "Editor") {
          get().setEditorState(patientId);
        }

        // Continue with existing logic
        set({ trailingActiveTab: activeTab, activeTab: tab });
        tabStateLogic(activeTab, patientId); // Note: now passing activeTab, not trailing
        set({ nodes: [], edges: [] });
        hydrateFlowState(patientId, tab);
      },

      setTrailingActiveTab: (tab) => {
        set({ trailingActiveTab: tab }); // Update trailingActiveTab in the store
      },

      // Hydrate nodes and edges based on activeTab
      hydrateFlowState: (patientId, activeTab) => {
        // set({ nodes: [], edges: [] });

        const { editorStates, profileStates } = get();

        if (activeTab === "Editor") {
          const editorState = editorStates[patientId] || {
            nodes: [],
            edges: [],
          };
          if (editorState) {
            set({
              nodes: editorState.nodes || [],
              edges: editorState.edges || [],
            });
          }
        } else if (activeTab === "Profile") {
          const profileState = profileStates[patientId] || {
            nodes: [],
            edges: [],
          };
          if (profileState) {
            set({
              nodes: profileState.nodes || [],
              edges: profileState.edges || [],
            });
          } else {
            return;
          }
        }
      },

      patientStateLogic: (trailingPatientId, activeTab) => {
        if (trailingPatientId === "") {
          return;
        }
        const { setProfileState, setEditorState } = get();
        if (activeTab === "Editor") {
          setEditorState(trailingPatientId);
        } else if (activeTab === "Profile") {
          setProfileState(trailingPatientId);
        }
      },

      // Comment out the entire logic in tabStateLogic
      tabStateLogic: (trailingActiveTab, patientId) => {
        console.log("Tab logic triggered - trailing tab:", trailingActiveTab);
        // Temporarily comment out all state saving logic
        // if (trailingActiveTab === "Editor") {
        //   setEditorState(patientId);
        // } else if (trailingActiveTab === "Profile") {
        //   setProfileState(patientId);
        // }
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
        const flowState = get().flowStates[patientId] || {
          nodes: [],
          edges: [],
        };
        set({ nodes: flowState.nodes, edges: flowState.edges });
      },

      // Save Editor State
      setEditorState: (patientId) => {
        const { nodes, edges } = get();
        console.log("Saving to Profile state:", nodes.length, "nodes");
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
        console.log("Saving to Editor state:", nodes.length, "nodes");
        set((state) => ({
          profileStates: {
            ...state.profileStates,
            [patientId]: { nodes, edges },
          },
        }));
      },

      // CREATING A NEW PATIENT REQUIRES INITIALIZATION OF THE STATE

      setNewEditor: (patientId) => {
        set((state) => ({
          editorStates: {
            ...state.editorStates,
            [patientId]: { nodes: [], edges: [] },
          },
        }));
      },

      setNewProfile: (patientId) => {
        set((state) => ({
          profileStates: {
            ...state.profileStates,
            [patientId]: { nodes: [], edges: [] },
          },
        }));
      },

      setSelectedNodeId: (nodeId) =>
        set((state) => ({ ...state, selectedNodeId: nodeId })),

      setColumnsLayout: (layout) =>
        set((state) => ({ ...state, columnsLayout: layout })),

      setRowsData: (data) => set((state) => ({ ...state, rowsData: data })),

      addPatient: (patientId, patientDetails) => {
        set((state) => ({
          patients: {
            ...state.patients,
            [patientId]: { ...state.patients[patientId], ...patientDetails },
          },
        }));
      },

      removePatient: (patientId) => {
        set((state) => {
          const { [patientId]: _, ...updatedPatients } = state.patients;
          return { patients: updatedPatients };
        });
      },

      // Add an intervention for a patient
      addIntervention: (patientID, interventionData) => {
        set((state) => {
          const newState = _.cloneDeep(state);
          const patientInterventions = _.get(newState, `interventions.${patientID}`, []);
          _.set(newState, `interventions.${patientID}`, [...patientInterventions, interventionData]);
          return newState;
        });
      },

      loadIntervention: (patientID, interventionID) => {
        const { interventions } = get();
      
        const patientInterventions = _.get(interventions, patientID, []);
        const intervention = patientInterventions.find(
          (item) => item.id === interventionID
        );
      
        if (!intervention) {
          console.error(`Intervention with ID ${interventionID} not found for patient ${patientID}`);
          return;
        }
      
        set({
          nodes: intervention.nodes || [],
          edges: intervention.edges || [],
        });
      
        console.log(`Intervention ${interventionID} loaded for patient ${patientID}`);
      },

      // Remove an intervention for a patient
      removeIntervention: (patientID, interventionID) => {
        set((state) => {
          const newState = _.cloneDeep(state);
          const patientInterventions = _.get(newState, `interventions.${patientID}`, []);
          const updatedInterventions = patientInterventions.filter(
            (intervention) => intervention.interventionID !== interventionID
          );
          _.set(newState, `interventions.${patientID}`, updatedInterventions);
          return newState;
        });
      },

    }),

    {
      name: "flow-store",
      partialize: (state) => ({
        patients: state.patients,
        interventions: state.interventions,
        editorStates: state.editorStates,
        profileStates: state.profileStates,
      }),
    }
  )
);

export default useFlowStore;
