import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import * as _ from "lodash";
import { getProfileComposerTemplates, getEditorComposerTemplates } from "../components/variables";
import {
  remapNodesAndEdgesWithNewIds,
  clearDatesFromNodes,
  offsetNodesEdgesPosition,
} from "../components/utils";
import { v4 as uuidv4 } from "uuid";

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
      templates: [],
      columnsLayout: [],
      rowsData: [],
      clipboard: { nodes: [], edges: [] },
      nodes: [], // Global nodes
      edges: [], // Global edges

      updateColumnsForSelectedNode: () => {
        const { nodes, activeTab } = get();
        const selectedNode = nodes.find((node) => node.selected);

        if (selectedNode) {
          const templates =
            activeTab === "Profile" ? getProfileComposerTemplates(get().updateNodeData) : getEditorComposerTemplates(get().updateNodeData);
          if (templates[selectedNode.type]) {
            get().setColumnsLayout(templates[selectedNode.type]);
            console.log(
              `Updated columns for ${activeTab} node type: ${selectedNode.type}`
            );
          } else {
            console.log(
              `No column template for ${activeTab} node type: ${selectedNode.type}`
            );
          }
        } else {
          console.log("No node selected, columns not updated");
        }
      },

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
        get().updateColumnsForSelectedNode();
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
          const patientInterventions = _.get(
            newState,
            `interventions.${patientID}`,
            []
          );
          _.set(newState, `interventions.${patientID}`, [
            ...patientInterventions,
            interventionData,
          ]);
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
          console.error(
            `Intervention with ID ${interventionID} not found for patient ${patientID}`
          );
          return;
        }

        set({
          nodes: intervention.nodes || [],
          edges: intervention.edges || [],
        });

        console.log(
          `Intervention ${interventionID} loaded for patient ${patientID}`
        );
      },

      // Remove an intervention for a patient
      removeIntervention: (patientID, interventionID) => {
        set((state) => {
          const newState = _.cloneDeep(state);
          const patientInterventions = _.get(
            newState,
            `interventions.${patientID}`,
            []
          );
          const updatedInterventions = patientInterventions.filter(
            (intervention) => intervention.interventionID !== interventionID
          );
          _.set(newState, `interventions.${patientID}`, updatedInterventions);
          return newState;
        });
      },

      // Update a specific field in the selected node
      updateNodeData: (field, value) => {
        const { nodes } = get();

        // Prepare the updated nodes array by mapping over the current nodes
        const updatedNodes = nodes.map((node) =>
          node.selected
            ? { ...node, data: { ...node.data, [field]: value } }
            : node
        );

        // Directly set the updated nodes, mimicking loadIntervention's approach
        set({
          nodes: updatedNodes,
        });

        console.log(`Updated node data field ${field} to ${value}`);
      },

      // Update a specific exercise in the selected node
      updateExerciseData: (exerciseId, field, value) => {
        set((state) => {
          const newNodes = _.cloneDeep(state.nodes);
          const selectedNodeIndex = _.findIndex(
            newNodes,
            (node) => node.selected
          );

          if (selectedNodeIndex >= 0) {
            const exercises = _.get(
              newNodes[selectedNodeIndex],
              "data.exercises",
              []
            );
            const exerciseIndex = _.findIndex(exercises, { id: exerciseId });

            if (exerciseIndex >= 0) {
              // Update the specific field in the specific exercise
              _.set(exercises[exerciseIndex], field, value);
            }
          }

          return { nodes: newNodes };
        });
      },

      // Add a new exercise to the selected node
      addExercise: () => {
        set((state) => {
          const newNodes = _.cloneDeep(state.nodes);
          const selectedNodeIndex = _.findIndex(
            newNodes,
            (node) => node.selected
          );

          if (selectedNodeIndex >= 0) {
            const exercises = _.get(
              newNodes[selectedNodeIndex],
              "data.exercises",
              []
            );

            // Create the new exercise
            const newExercise = {
              id: uuidv4(),
              name: "New Exercise",
              duration: 0,
              sets: 0,
              reps: 0,
              intensity: "low",
            };

            // Use lodash to add the exercise to the array
            _.set(newNodes[selectedNodeIndex], "data.exercises", [
              ...exercises,
              newExercise,
            ]);
          }

          return { nodes: newNodes };
        });
      },

      // Delete selected exercises from the selected node
      deleteExercises: (exerciseIds) => {
        set((state) => {
          const newNodes = _.cloneDeep(state.nodes);
          const selectedNodeIndex = _.findIndex(
            newNodes,
            (node) => node.selected
          );

          if (selectedNodeIndex >= 0) {
            const exercises = _.get(
              newNodes[selectedNodeIndex],
              "data.exercises",
              []
            );

            // Filter out the exercises to be deleted
            const filteredExercises = _.filter(
              exercises,
              (exercise) => !_.includes(exerciseIds, exercise.id)
            );

            // Set the filtered exercises back
            _.set(
              newNodes[selectedNodeIndex],
              "data.exercises",
              filteredExercises
            );
          }

          return { nodes: newNodes };
        });
      },

      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template],
        })),

      loadTemplate: (templateId) => {
        const tpl = _.find(get().templates, { id: templateId });
        if (tpl) {
          let { newNodes, newEdges } = remapNodesAndEdgesWithNewIds(
            tpl.nodes,
            tpl.edges
          );

          // Clear dates from nodes
          newNodes = clearDatesFromNodes(newNodes);

          // Offset nodes and edges to prevent overlap
          const { offsetedNodes, offsetedEdges } = offsetNodesEdgesPosition(
            newNodes,
            newEdges,
            100,
            100
          );

          set((state) => ({
            nodes: [...state.nodes, ...offsetedNodes],
            edges: [...state.edges, ...offsetedEdges],
          }));
        }
      },

      removeTemplate: (templateId) =>
        set((state) => ({
          templates: _.filter(state.templates, (tpl) => tpl.id !== templateId),
        })),

      updateNodeById: (id, date) =>
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id !== id) return node;
            // Deep clone node and node.data
            const updatedNode = _.cloneDeep(node);
            _.set(updatedNode, "data.date", date);
            return updatedNode;
          }),
        })),

      cutNodesEdges: () =>
        set((state) => {
          const nodesToCut = state.nodes.filter((n) => n.selected);
          const edgesToCut = state.edges.filter((e) => e.selected);
          const remainingNodes = state.nodes.filter((n) => !n.selected);
          const remainingEdges = state.edges.filter((e) => !e.selected);

          return {
            ...state,
            clipboard: {
              nodes: _.cloneDeep(nodesToCut),
              edges: _.cloneDeep(edgesToCut),
            },
            nodes: remainingNodes,
            edges: remainingEdges,
          };
        }),

      copyNodesEdges: () =>
        set((state) => {
          const nodesToCopy = state.nodes.filter((n) => n.selected);
          const edgesToCopy = state.edges.filter((e) => e.selected);
          return {
            ...state,
            clipboard: {
              nodes: _.cloneDeep(nodesToCopy),
              edges: _.cloneDeep(edgesToCopy),
            },
          };
        }),

      pasteNodesEdges: () =>
        set((state) => {
          const { clipboard } = state;
          // Deep copy and assign new IDs
          const { newNodes, newEdges } = remapNodesAndEdgesWithNewIds(
            clipboard.nodes,
            clipboard.edges
          );
          // Offset position (if needed)
          const { offsetedNodes, offsetedEdges } = offsetNodesEdgesPosition(
            newNodes,
            newEdges,
            400,
            400,
          );
          // Clear selection state on new nodes/edges
          offsetedNodes.forEach((n) => (n.selected = false));
          offsetedEdges.forEach((e) => (e.selected = false));
          return {
            ...state,
            nodes: [...state.nodes, ...offsetedNodes],
            edges: [...state.edges, ...offsetedEdges],
          };
        }),

      deleteSelectedNodesEdges: () =>
        set((state) => {
          const remainingNodes = state.nodes.filter((n) => !n.selected);
          const remainingEdges = state.edges.filter((e) => !e.selected);

          return {
            ...state,
            nodes: remainingNodes,
            edges: remainingEdges,
          };
        }),

      dumpClipboard: () =>
        set((state) => ({
          // Implicit return with ()
          ...state, // Keep existing state
          clipboard: {
            // Overwrite 'clipboard' with a new object
            nodes: [],
            edges: [],
          },
        })),
    }),
    {
      name: "flow-store",
      partialize: (state) => ({
        patients: state.patients,
        interventions: state.interventions,
        editorStates: state.editorStates,
        profileStates: state.profileStates,
        templates: state.templates,
      }),
    }
  )
);

export default useFlowStore;
