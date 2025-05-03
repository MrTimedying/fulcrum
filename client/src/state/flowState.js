import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import * as _ from "lodash";
import {
  getProfileComposerTemplates,
  getEditorComposerTemplates,
} from "../components/variables";
import {
  remapNodesAndEdgesWithNewIds,
  clearDatesFromNodes,
  offsetNodesEdgesPosition,
} from "../components/utils";
import { v4 as uuidv4 } from "uuid";
import dagre from "@dagrejs/dagre";

const MAX_HISTORY_SIZE = 10; // Limit history to prevent memory issues

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    // Use node dimensions if available, otherwise use defaults
    const nodeWidth = node.width || 150; // Adjust default width as needed
    const nodeHeight = node.height || 40; // Adjust default height as needed
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // We need to center the node position because Dagre sets the top-left corner
    const position = {
      x: nodeWithPosition.x - (node.width || 150) / 2,
      y: nodeWithPosition.y - (node.height || 40) / 2,
    };

    return { ...node, position };
  });

  return { nodes: layoutedNodes, edges };
};

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
      contextualMemory: [],
      mirroredContextualMemory: [],
      nodes: [], // Global nodes
      edges: [], // Global edges

      updateColumnsForSelectedNode: () => {
        const { nodes, activeTab } = get();
        const selectedNode = nodes.find((node) => node.selected);

        if (selectedNode) {
          const templates =
            activeTab === "Profile"
              ? getProfileComposerTemplates(get().updateNodeData)
              : getEditorComposerTemplates(get().updateNodeData);
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
        const { editorStates, profileStates } = get();

        if (activeTab === "Editor") {
          const editorState = editorStates[patientId] || {
            nodes: [],
            edges: [],
            contextualMemory: [{ nodes: [], edges: [] }], // Initialize history
            historyIndex: 0,
          };
          set({
            nodes: editorState.nodes || [],
            edges: editorState.edges || [],
          });
        } else if (activeTab === "Profile") {
          const profileState = profileStates[patientId] || {
            nodes: [],
            edges: [],
            contextualMemory: [{ nodes: [], edges: [] }], // Initialize history
            historyIndex: 0,
          };
          set({
            nodes: profileState.nodes || [],
            edges: profileState.edges || [],
          });
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

      // Save Editor State with history
      setEditorState: (patientId) => {
        const { nodes, edges } = get();
        console.log("Saving to Editor state:", nodes.length, "nodes");
        set((state) => ({
          editorStates: {
            ...state.editorStates,
            [patientId]: {
              nodes,
              edges,
              contextualMemory: state.editorStates[patientId]
                ?.contextualMemory || [{ nodes: [], edges: [] }],
              historyIndex: state.editorStates[patientId]?.historyIndex || 0,
            },
          },
        }));
      },

      // Save Profile State with history
      setProfileState: (patientId) => {
        const { nodes, edges } = get();
        console.log("Saving to Profile state:", nodes.length, "nodes");
        set((state) => ({
          profileStates: {
            ...state.profileStates,
            [patientId]: {
              nodes,
              edges,
              contextualMemory: state.profileStates[patientId]
                ?.contextualMemory || [{ nodes: [], edges: [] }],
              historyIndex: state.profileStates[patientId]?.historyIndex || 0,
            },
          },
        }));
      },

      // CREATING A NEW PATIENT REQUIRES INITIALIZATION OF THE STATE
      setNewEditor: (patientId) => {
        set((state) => ({
          editorStates: {
            ...state.editorStates,
            [patientId]: {
              nodes: [],
              edges: [],
              contextualMemory: [{ nodes: [], edges: [] }],
              historyIndex: 0,
            },
          },
        }));
      },

      setNewProfile: (patientId) => {
        set((state) => ({
          profileStates: {
            ...state.profileStates,
            [patientId]: {
              nodes: [],
              edges: [],
              contextualMemory: [{ nodes: [], edges: [] }],
              historyIndex: 0,
            },
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
              intensity: 0,
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

      updateNodeTestData: (id, testData) =>
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id !== id) return node;
            const updatedNode = _.cloneDeep(node);
            _.set(updatedNode, "data.tests", testData);
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
            clearDatesFromNodes(clipboard.nodes),
            clipboard.edges
          );
          // Offset position (if needed)
          const { offsetedNodes, offsetedEdges } = offsetNodesEdgesPosition(
            newNodes,
            newEdges,
            400,
            400
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

      deleteSelectedNodesEdges: () => {
        let nodesDeleted = false;
        let edgesDeleted = false;

        get().recordState();

        set((state) => {
          const initialNodesCount = (state.nodes || []).length;
          const initialEdgesCount = (state.edges || []).length;
          const remainingNodes = (state.nodes || []).filter((n) => !n.selected);
          const remainingEdges = (state.edges || []).filter((e) => !e.selected);

          nodesDeleted = initialNodesCount !== remainingNodes.length;
          edgesDeleted = initialEdgesCount !== remainingEdges.length;

          // Return updated state with spread of previous state for clarity
          return {
            ...state,
            nodes: remainingNodes,
            edges: remainingEdges,
          };
        });
      },

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

      // Add function to add a new Test to the selected Session node
      addTest: (testData) => {
        const selectedNode = get().nodes.find((node) => node.selected);
        if (selectedNode && selectedNode.type === "session") {
          const newTest = {
            id: uuidv4(),
            ...testData, // Data from the modular form
          };
          const updatedTests = [...(selectedNode.data.tests || []), newTest];
          set((state) => ({
            nodes: state.nodes.map((n) =>
              n.id === selectedNode.id
                ? { ...n, data: { ...n.data, tests: updatedTests } }
                : n
            ),
          }));
        }
      },

      // Add function to update existing Test data
      updateTestData: (nodeId, testId, updatedData) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    tests: (node.data.tests || []).map((test) =>
                      test.id === testId ? { ...test, ...updatedData } : test
                    ),
                  },
                }
              : node
          ),
        }));
      },

      // Add function to delete Tests
      deleteTests: (nodeId, testIds) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    tests: (node.data.tests || []).filter(
                      (test) => !testIds.includes(test.id)
                    ),
                  },
                }
              : node
          ),
        }));
      },

      recordState: () => {
        const { nodes, edges, contextualMemory } = get();

        // Use fallback to empty array if nodes or edges are undefined to prevent TypeError
        const safeNodes = nodes || [];
        const safeEdges = edges || [];

        // Create a deep copy of current nodes and edges as a past state snapshot
        const pastState = {
          nodes: _.cloneDeep(safeNodes),
          edges: _.cloneDeep(safeEdges),
        };

        // Start with the current history array
        let updatedContextualMemory = [...(contextualMemory || [])];

        // Append the current state as a past state to contextualMemory
        updatedContextualMemory.push(pastState);

        // Limit contextualMemory size by removing oldest state if necessary
        while (updatedContextualMemory.length > MAX_HISTORY_SIZE) {
          updatedContextualMemory.shift();
        }

        // Log for debugging (remove in production)
        console.log(
          "Recording past state - Contextual Memory Length:",
          updatedContextualMemory.length,
          "Mirrored Memory Cleared",
          "Past State:",
          pastState
        );

        // Update state: add past state to contextualMemory and clear mirroredContextualMemory
        set({
          contextualMemory: updatedContextualMemory,
          mirroredContextualMemory: [], // Clear redo history on new action
        });
      },

      // Undo Logic: Reverts to the last past state in contextualMemory, or to initial state if none remain
      undoNodesEdges: () => {
        const { contextualMemory, mirroredContextualMemory } = get();

        // Start with current history arrays
        let currentContextualMemory = [...(contextualMemory || [])];
        let updatedMirroredMemory = [...(mirroredContextualMemory || [])];

        // Log current state before undo for debugging (remove in production)
        console.log(
          "Undo triggered - Contextual Memory Length:",
          currentContextualMemory.length,
          "Mirrored Memory Length:",
          updatedMirroredMemory.length,
          "Timestamp:",
          Date.now()
        );

        // Capture the current state to move to mirrored memory for redo
        const currentState = {
          nodes: _.cloneDeep(get().nodes || []),
          edges: _.cloneDeep(get().edges || []),
        };
        updatedMirroredMemory.push(currentState);

        // Limit mirroredContextualMemory size by removing oldest state if necessary
        while (updatedMirroredMemory.length > MAX_HISTORY_SIZE) {
          updatedMirroredMemory.shift();
        }

        // If there are past states in contextualMemory, revert to the last one
        if (currentContextualMemory.length > 0) {
          const previousState = currentContextualMemory.pop();
          console.log(
            "Reverting to past state - Contextual Memory Length:",
            currentContextualMemory.length,
            "Previous State:",
            previousState
          );

          // Update state to revert to previous nodes/edges and update histories
          set({
            nodes: previousState.nodes || [],
            edges: previousState.edges || [],
            contextualMemory: currentContextualMemory,
            mirroredContextualMemory: updatedMirroredMemory,
          });
        } else {
          // If no past states remain, revert to an initial empty state
          console.log(
            "No past states in contextualMemory - Reverting to initial empty state."
          );
          set({
            nodes: [],
            edges: [],
            contextualMemory: currentContextualMemory,
            mirroredContextualMemory: updatedMirroredMemory,
          });
        }
      },

      // Redo Logic: Moves a state from mirroredContextualMemory back to become the current state
      redoNodesEdges: () => {
        const { contextualMemory, mirroredContextualMemory } = get();

        // Start with current history arrays
        let updatedContextualMemory = [...(contextualMemory || [])];
        let currentMirroredMemory = [...(mirroredContextualMemory || [])];

        // Log current state before redo for debugging (remove in production)
        console.log(
          "Redo triggered - Contextual Memory Length:",
          updatedContextualMemory.length,
          "Mirrored Memory Length:",
          currentMirroredMemory.length,
          "Timestamp:",
          Date.now()
        );

        // If there's a state to redo (mirrored memory is not empty)
        if (currentMirroredMemory.length > 0) {
          // Pop the last state from mirrored memory to reapply it as current state
          const redoState = currentMirroredMemory.pop();
          // Add the current state to contextualMemory as a past state before applying redo
          const currentState = {
            nodes: _.cloneDeep(get().nodes || []),
            edges: _.cloneDeep(get().edges || []),
          };
          updatedContextualMemory.push(currentState);

          // Limit contextualMemory size by removing oldest state if necessary
          while (updatedContextualMemory.length > MAX_HISTORY_SIZE) {
            updatedContextualMemory.shift();
          }

          console.log(
            "Reapplying redo state - Contextual Memory Length:",
            updatedContextualMemory.length,
            "Redo State:",
            redoState
          );

          // Update state to apply redo nodes/edges and update histories
          set({
            nodes: redoState.nodes || [],
            edges: redoState.edges || [],
            contextualMemory: updatedContextualMemory,
            mirroredContextualMemory: currentMirroredMemory,
          });
        } else {
          console.log("Cannot redo - No states in mirroredContextualMemory.");
        }
      },

      applyLayout: (direction = "TB") => {
        const { nodes, edges } = get(); // Get *all* current nodes and edges

        // No filtering needed here
        if (nodes.length === 0) return;

        const { nodes: layoutedNodes } = getLayoutedElements( // Only need layoutedNodes
          nodes,
          edges,
          direction
        );

        // Update all nodes with their new positions
        set({ nodes: layoutedNodes });
      },




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
