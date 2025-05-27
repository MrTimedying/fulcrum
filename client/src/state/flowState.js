import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
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
import ELK from "elkjs";

const MAX_HISTORY_SIZE = 10; // Limit history to prevent memory issues

const elk = new ELK();

const elkOptions = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  "elk.spacing.nodeNode": "80",
};

const getLayoutedElements = (nodes, edges, options = {}) => {
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
    children: nodesForLayout,
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
        
        const layoutedNode = layoutedGraph.children.find(n => n.id === originalNode.id);
        
        if (!layoutedNode) {
          // If layout didn't return this node, keep it as is
          return originalNode;
        }
        
        // Update only the position from layout, preserving all other properties
        return {
          ...originalNode,
          position: { 
            x: layoutedNode.x !== undefined ? layoutedNode.x : originalNode.position?.x || 0,
            y: layoutedNode.y !== undefined ? layoutedNode.y : originalNode.position?.y || 0
          },
          // Update handle positions based on node type
          targetPosition: originalNode.type === "session" 
            ? (isHorizontal ? "top" : "left")
            : (isHorizontal ? "left" : "top"),
          sourcePosition: originalNode.type === "session"
            ? (isHorizontal ? "bottom" : "right") 
            : (isHorizontal ? "right" : "bottom")
        };
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

// Add ORDER feature helper function after the getLayoutedElements function

const resequenceSiblingOrders = (parentId, allNodes, allEdges) => {
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
      exercises: [],
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
        // Store current state for identifying changes
        const currentEdges = get().edges;
        const currentNodes = get().nodes;
        
        // Track parents that need resequencing
        const parentIdsToResequence = new Set();
        
        // Process each change to identify edges being removed
        changes.forEach(change => {
          if (change.type === 'remove') {
            // Find the edge being removed
            const edgeToRemove = currentEdges.find(edge => edge.id === change.id);
            if (edgeToRemove) {
              // Get source (parent) of the edge
              const sourceId = edgeToRemove.source;
              
              // Get target (child) of the edge
              const targetId = edgeToRemove.target;
              
              // Find target node
              const targetNode = currentNodes.find(node => node.id === targetId);
              
              if (targetNode) {
                // Reset the order on the node being disconnected
                targetNode.data.order = null;
                
                // Add parent to resequencing set
                parentIdsToResequence.add(sourceId);
              }
            }
          }
        });
        
        // Apply the edge changes first
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
        }));
        
        // If we have parents needing resequencing, handle them
        if (parentIdsToResequence.size > 0) {
          // Get updated state after edge changes
          const { nodes, edges } = get();
          
          // Clone nodes for updating
          let updatedNodes = _.cloneDeep(nodes);
          
          // Process each parent that needs resequencing
          parentIdsToResequence.forEach(parentId => {
            // Resequence the children
            updatedNodes = resequenceSiblingOrders(parentId, updatedNodes, edges);
          });
          
          // Update the nodes with new orders
          set({ nodes: updatedNodes });
          
          console.log(`Resequenced children for ${parentIdsToResequence.size} parent(s) after edge removal`);
        }
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

      // Custom onConnect function to handle order assignment
      onConnect: (params) => {
        const { nodes, edges } = get();
        
        // First check if this is a valid connection
        const sourceNode = nodes.find(node => node.id === params.source);
        const targetNode = nodes.find(node => node.id === params.target);
        
        // Skip processing if nodes don't exist
        if (!sourceNode || !targetNode) {
          console.error("Invalid connection: Source or target node not found", params);
          return;
        }
        
        // Verify if the connection type is valid according to rules
        const validConnections = {
          intervention: ["phase"],
          phase: ["micro"],
          micro: ["session"]
        };
        
        const allowedTargetTypes = validConnections[sourceNode.type] || [];
        if (!allowedTargetTypes.includes(targetNode.type)) {
          console.error("Invalid connection type", sourceNode.type, "->", targetNode.type);
          return;
        }
        
        // Record state for undo
        get().recordState();
        
        // Find existing children of the source node to determine target's order
        const existingEdges = edges.filter(edge => edge.source === params.source);
        
        // Create a deep copy of nodes to modify
        let updatedNodes = _.cloneDeep(nodes);
        
        // Find the target node in the copied array
        const targetNodeIndex = updatedNodes.findIndex(node => node.id === params.target);
        
        if (targetNodeIndex !== -1) {
          // Assign new order based on existing sibling count 
          updatedNodes[targetNodeIndex].data.order = existingEdges.length + 1;
        }
        
        // Create the new edge
        const newEdge = addEdge(params, edges);
        
        // Update both nodes and edges in one operation
        set({
          nodes: updatedNodes,
          edges: newEdge
        });
        
        console.log(`Connection created: ${params.source} -> ${params.target}, assigned order ${existingEdges.length + 1}`);
      },

      // Handle edge reconnection with order adjustment
      onReconnect: (oldEdge, newConnection) => {
        const { nodes, edges } = get();
        
        // Record state for undo
        get().recordState();
        
        // Get the old source (parent) and the target (child being reconnected)
        const oldSourceId = oldEdge.source;
        const targetId = oldEdge.target;
        const newSourceId = newConnection.source;
        
        // Create a deep copy of nodes/edges to work with
        let updatedNodes = _.cloneDeep(nodes);
        let updatedEdges = _.cloneDeep(edges);
        
        // 1. Remove the old edge
        updatedEdges = updatedEdges.filter(edge => 
          !(edge.source === oldSourceId && edge.target === targetId)
        );
        
        // 2. Resequence the old parent's remaining children
        if (oldSourceId) {
          updatedNodes = resequenceSiblingOrders(oldSourceId, updatedNodes, updatedEdges);
        }
        
        // 3. Add the new edge
        updatedEdges.push({
          ...newConnection,
          id: `e-${uuidv4()}` // Generate a new edge ID
        });
        
        // 4. Find the node index in our updatedNodes array
        const targetNodeIndex = updatedNodes.findIndex(node => node.id === targetId);
        
        // 5. Count existing children of the new parent to determine new order
        const existingEdges = updatedEdges.filter(edge => edge.source === newSourceId);
        
        // 6. Assign new order for the node that was reconnected
        if (targetNodeIndex !== -1) {
          updatedNodes[targetNodeIndex].data.order = existingEdges.length;
        }
        
        // 7. Resequence the new parent's children (including the newly added one)
        updatedNodes = resequenceSiblingOrders(newSourceId, updatedNodes, updatedEdges);
        
        // 8. Update state with new nodes and edges
        set({
          nodes: updatedNodes,
          edges: updatedEdges
        });
        
        console.log(`Edge reconnected: ${oldSourceId} -> ${targetId} to ${newSourceId} -> ${targetId}`);
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

      updateNodeExerciseData: (id, exerciseData) =>
        set((state) => ({
          nodes: state.nodes.map((node) => {
            if (node.id !== id) return node;
            const updatedNode = _.cloneDeep(node);
            _.set(updatedNode, "data.exercises", exerciseData);
            return updatedNode;
          }),
        })),

      cutNodesEdges: () =>
        set((state) => {
          const nodesToCut = state.nodes.filter((n) => (n.selected && n.type !== "intervention"));
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
          const nodesToCopy = state.nodes.filter((n) => (n.selected && n.type !== "intervention"));
          const edgesToCopy = state.edges.filter((e) => e.selected);
          return {
            ...state,
            clipboard: {
              nodes: _.cloneDeep(nodesToCopy),
              edges: _.cloneDeep(edgesToCopy),
            },
          };
        }),

      pasteNodesEdges: (position, reactFlowInstance = null) => {
        get().recordState();

        set((state) => {
          const { clipboard } = state;
          
          // Skip paste if clipboard is empty
          if (!clipboard || !clipboard.nodes || clipboard.nodes.length === 0) {
            console.info("Nothing to paste: clipboard is empty or contains no nodes");
            return state;
          }
          
          // Deep copy and assign new IDs
          const { newNodes, newEdges } = remapNodesAndEdgesWithNewIds(
            clearDatesFromNodes(clipboard.nodes),
            clipboard.edges || [] // Handle case where clipboard.edges might be undefined
          );
          
          // Skip if no valid nodes were created
          if (!newNodes || newNodes.length === 0) {
            console.warn("No valid nodes to paste");
            return state;
          }
          
          // Clear ORDER values for pasted nodes since they have no parent connection yet
          const nodesWithoutOrder = newNodes.map(node => {
            // Create a deep copy to avoid mutation
            const nodeClone = _.cloneDeep(node);
            
            // Set order to null for all pasted nodes since they're initially disconnected
            if (nodeClone.data) {
              nodeClone.data.order = null;
            }
            
            return nodeClone;
          });
          
          // Determine paste position
          let pastePosition;
          
          if (position) {
            // Use provided position if available
            pastePosition = position;
          } else if (reactFlowInstance) {
            // Use center of current viewport if ReactFlow instance is provided
            const { x, y, zoom } = reactFlowInstance.getViewport();
            const { width, height } = reactFlowInstance.getContainer().getBoundingClientRect();
            
            // Calculate center of viewport in flow coordinates
            pastePosition = {
              x: (width / 2 - x) / zoom,
              y: (height / 2 - y) / zoom
            };
          } else {
            // Fallback to default position
            pastePosition = { x: 400, y: 400 };
          }
          
          // Offset position
          const { offsetedNodes, offsetedEdges } = offsetNodesEdgesPosition(
            nodesWithoutOrder,
            newEdges,
            pastePosition.x,
            pastePosition.y
          );
          
          // Final validation pass to ensure no null IDs
          let validNodes = offsetedNodes.filter(node => {
            if (!node.id) {
              console.error("Found node with null id after offset, or intervention node selected", node);
              return false;
            }
            node.selected = false; // Clear selection state
            return true;
          });
          
          const validEdges = offsetedEdges.filter(edge => {
            if (!edge.id || !edge.source || !edge.target) {
              console.error("Found edge with null id, source, or target after offset", edge);
              return false;
            }
            edge.selected = false; // Clear selection state
            return true;
          });
          
          return {
            ...state,
            nodes: [...state.nodes, ...validNodes],
            edges: [...state.edges, ...validEdges],
          };
        });
      },
        

      deleteSelectedNodesEdges: () => {
        // Track if actions were performed
        let nodesDeleted = false;
        let edgesDeleted = false;

        // Record state for undo
        get().recordState();

        // Identify all parent nodes that will need resequencing
        // when one of their children is deleted
        const parentIdsToResequence = new Set();
        
        // Get current state
        const { nodes, edges } = get();

        // Find all selected nodes
        const selectedNodes = nodes.filter(n => n.selected);
        
        // Find parent nodes for each selected node by looking at incoming edges
        selectedNodes.forEach(node => {
          // Find edges where this node is the target (incoming edges)
          edges.forEach(edge => {
            if (edge.target === node.id && !selectedNodes.some(n => n.id === edge.source)) {
              // If the parent isn't also selected for deletion, add to resequence list
              parentIdsToResequence.add(edge.source);
            }
          });
        });

        // Remove selected nodes and edges
        set((state) => {
          const initialNodesCount = (state.nodes || []).length;
          const initialEdgesCount = (state.edges || []).length;
          const remainingNodes = (state.nodes || []).filter((n) => !n.selected);
          const remainingEdges = (state.edges || []).filter(
            (edge) => !edge.selected && // Filter out explicitly selected edges
                      !selectedNodes.some(node => node.id === edge.source) && // Filter out edges from deleted nodes
                      !selectedNodes.some(node => node.target === node.id) // Filter out edges to deleted nodes
          );

          nodesDeleted = initialNodesCount !== remainingNodes.length;
          edgesDeleted = initialEdgesCount !== remainingEdges.length;

          // Return updated state with spread of previous state for clarity
          return {
            ...state,
            nodes: remainingNodes,
            edges: remainingEdges,
          };
        });
        
        // Now resequence all affected parent nodes' children
        if (parentIdsToResequence.size > 0) {
          // Get fresh state after the deletion
          const { nodes, edges } = get();
          
          // Resequence the children of each affected parent
          let updatedNodes = _.cloneDeep(nodes);
          
          parentIdsToResequence.forEach(parentId => {
            updatedNodes = resequenceSiblingOrders(parentId, updatedNodes, edges);
          });
          
          // Update nodes with resequenced orders
          set((state) => {
             // Optional: Log orders of children for resequenced parents
             parentIdsToResequence.forEach(parentId => {
                 const children = updatedNodes.filter(node => edges.some(edge => edge.source === parentId && edge.target === node.id));
                 console.log(`deleteSelectedNodesEdges: Orders for children of ${parentId}:`, children.map(c => ({id: c.id, order: c.data?.order})));
             });

            return {
              ...state,
              nodes: updatedNodes
            };
          });
          
        } else {
        }
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
        console.log("Past state:", pastState);

        console.log("Contextual memory:", contextualMemory);
        // Start with the current history array
        let updatedContextualMemory = _.cloneDeep(contextualMemory);
        

        // Append the current state as a past state to contextualMemory
        updatedContextualMemory.push(pastState);
        console.log("Updated contextual memory:", updatedContextualMemory);

        // Limit contextualMemory size by removing oldest state if necessary
        while (updatedContextualMemory.length > MAX_HISTORY_SIZE) {
          updatedContextualMemory.shift();
          console.log("I should not fire!")
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
        set((state) => ({
          ...state,
          contextualMemory: updatedContextualMemory,
          mirroredContextualMemory: [], // Clear redo history on new action
        }));

        console.log("Contextual memory:", get().contextualMemory);
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
            "No past states in contextualMemory - Nothing should happen!"
          );
          return;
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

      // Add hybrid layout function
      hybridLayout: async (direction = "TB") => {
        const { nodes, edges, recordState } = get();
        
        if (!nodes || nodes.length === 0) {
          console.log("No nodes to layout");
          return;
        }
        
        // Record current state for history
        recordState();
        
        try {
          console.log("Applying hybrid layout...");
          
          // Step 1: Separate session nodes from other nodes
          const sessionNodes = nodes.filter(node => node.type === "session");
          const nonSessionNodes = nodes.filter(node => node.type !== "session");
          
          // Step 2: Apply ELK layout to non-session nodes only
          const elkDirection = direction === "TB" ? "DOWN" : 
                               direction === "LR" ? "RIGHT" : direction;
                               
          const options = {
            ...elkOptions,
            "elk.direction": elkDirection,
          };
          
          // Create a copy of edges that only connect non-session nodes
          const nonSessionEdges = edges.filter(edge => {
            const sourceNode = nonSessionNodes.find(node => node.id === edge.source);
            const targetNode = nonSessionNodes.find(node => node.id === edge.target);
            return sourceNode && targetNode;
          });
          
          // Apply ELK layout to non-session nodes
          let layoutedNonSessionNodes = nonSessionNodes;
          if (nonSessionNodes.length > 0) {
            try {
              const elkResult = await getLayoutedElements(nonSessionNodes, nonSessionEdges, options);
              if (elkResult && elkResult.nodes) {
                layoutedNonSessionNodes = elkResult.nodes;
              }
            } catch (error) {
              console.error("Error in ELK layout:", error);
            }
          }
          
          // Step 3: Create a merged node array with both the layouted non-session nodes
          // and the original session nodes (which we'll position separately)
          const mergedNodes = [
            ...layoutedNonSessionNodes,
            ...sessionNodes
          ];
          
          // Step 4: Update the state with these nodes first
          set({ nodes: mergedNodes });
          
          // Step 5: Now stack the session nodes below their parents
          // Find all session nodes and organize by parent
          const parentMap = new Map(); // Maps parent ID to array of child session nodes
          
          // Group session nodes by their parent
          sessionNodes.forEach(node => {
            // Find edges where this node is the target (i.e., incoming edges)
            const parentEdges = edges.filter(edge => edge.target === node.id);
            
            if (parentEdges.length > 0) {
              // Use the first parent found (assuming a node has only one parent)
              const parentId = parentEdges[0].source;
              
              if (!parentMap.has(parentId)) {
                parentMap.set(parentId, []);
              }
              
              parentMap.get(parentId).push(node);
            }
          });
          
          // Create new positions for nodes based on their parent groups
          const updatedNodes = [...mergedNodes]; // Create a copy of nodes to update
          
          // Process each parent group
          parentMap.forEach((childNodes, parentId) => {
            // Find the parent node - it should now have its layouted position
            const parentNode = updatedNodes.find(node => node.id === parentId);
            if (!parentNode) return;
            
            // Calculate starting position below the parent
            const startX = parentNode.position.x; // Same X as parent
            let startY = parentNode.position.y + 150; // Start below parent with some spacing
            
            // Sort nodes by existing X position to maintain relative horizontal order
            const sortedChildren = [...childNodes].sort((a, b) => 
              (a.position?.x || 0) - (b.position?.x || 0)
            );
            
            // Position each child node in a vertical column beneath the parent
            sortedChildren.forEach((node, index) => {
              // Find the node in our updatedNodes array
              const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
              if (nodeIndex !== -1) {
                // Update the position
                updatedNodes[nodeIndex] = {
                  ...updatedNodes[nodeIndex],
                  position: {
                    x: startX,
                    y: startY + (index * 150) // Stack vertically with 150px spacing
                  }
                };
              }
            });
          });
          
          // Step 6: Update the state with the final node positions
          set({ nodes: updatedNodes });
          console.log("Hybrid layout applied successfully");
        } catch (error) {
          console.error("Error in hybrid layout:", error);
        }
      },

      // Update applyLayout to use hybridLayout for TB direction
      applyLayout: (direction = "TB") => {
        const { hybridLayout } = get();
        
        // Use hybrid layout for TB direction, standard ELK for others
        if (direction === "TB") {
          hybridLayout(direction);
          return;
        }
        
        // Original implementation for other directions
        const { nodes, edges } = get();

        if (!nodes || nodes.length === 0) {
          console.log("No nodes to layout");
          return;
        }

        console.log("Applying layout direction:", direction);

        // Map direction to ELK options
        const elkDirection = direction === "TB" ? "DOWN" : 
                             direction === "LR" ? "RIGHT" :
                             direction;

        const options = {
          ...elkOptions,
          "elk.direction": elkDirection,
          // Add a special property to track the original direction for session nodes
          "originalDirection": direction
        };

        // Record current state in history
        get().recordState();

        try {
          // Call getLayoutedElements which returns a Promise
          getLayoutedElements(nodes, edges, options)
            .then((result) => {
              // Safe destructuring - check if result exists first
              if (result && result.nodes) {
                set((state) => ({ 
                  ...state,
                  nodes: result.nodes,
                  edges: result.edges,
                }));
                console.log("Layout applied successfully");
              } else {
                console.error("Layout failed - invalid result", result);
              }
            })
            .catch((error) => {
              console.error("Layout failed with error:", error);
            });
        } catch (error) {
          console.error("Error in applyLayout:", error);
        }
      },

      saveExercise: (exercise) => {
        // The exercise already has a mangled key as its name property
        // Just add a unique ID for the exercise in the store
        const exerciseNewId = {...exercise, id: uuidv4()};

        set((state) => ({
          ...state,
          exercises: [...state.exercises, exerciseNewId],
        }));
      },

      deleteExercise: (mangledKey) => {
        set((state) => ({
          ...state,
          exercises: state.exercises.filter((exercise) => exercise.name !== mangledKey),
        }));
      },

      stackSessionNodes: () => {
        const { nodes, edges, recordState } = get();
        
        if (nodes.length === 0) {
          console.log("No nodes to stack");
          return;
        }
        
        // Record current state for undo
        recordState();
        
        try {
          // Step 1: Find all session nodes and organize by parent
          const sessionNodes = nodes.filter(node => node.type === "session");
          const parentMap = new Map(); // Maps parent ID to array of child session nodes
          
          // Group session nodes by their parent
          sessionNodes.forEach(node => {
            // Find edges where this node is the target (i.e., incoming edges)
            const parentEdges = edges.filter(edge => edge.target === node.id);
            
            if (parentEdges.length > 0) {
              // Use the first parent found (assuming a node has only one parent)
              const parentId = parentEdges[0].source;
              
              if (!parentMap.has(parentId)) {
                parentMap.set(parentId, []);
              }
              
              parentMap.get(parentId).push(node);
            }
          });
          
          // Step 2: Create new positions for nodes based on their parent groups
          const updatedNodes = [...nodes]; // Create a copy of nodes to update
          
          // Process each parent group
          parentMap.forEach((childNodes, parentId) => {
            // Find the parent node
            const parentNode = nodes.find(node => node.id === parentId);
            if (!parentNode) return;
            
            // Calculate starting position below the parent
            const startX = parentNode.position.x; // Same X as parent
            let startY = parentNode.position.y + 150; // Start below parent with some spacing
            
            // Sort nodes by order property if available, otherwise by position
            const sortedChildren = [...childNodes].sort((a, b) => {
              // If both nodes have an order, sort by order
              if (a.data?.order !== null && b.data?.order !== null) {
                return (a.data?.order || 0) - (b.data?.order || 0);
              }
              // Otherwise fall back to X position
              return (a.position?.x || 0) - (b.position?.x || 0);
            });
            
            // Position each child node in a vertical column beneath the parent
            sortedChildren.forEach((node, index) => {
              // Find the node in our updatedNodes array
              const nodeIndex = updatedNodes.findIndex(n => n.id === node.id);
              if (nodeIndex !== -1) {
                // Update the position
                updatedNodes[nodeIndex] = {
                  ...updatedNodes[nodeIndex],
                  position: {
                    x: startX,
                    y: startY + (index * 150) // Stack vertically with 150px spacing
                  }
                };
              }
            });
          });
          
          // Step 3: Update the nodes in the store
          set({ nodes: updatedNodes });
          console.log("Session nodes stacked successfully");
          
        } catch (error) {
          console.error("Error stacking session nodes:", error);
        }
      },

      batchUpdateNodesExerciseData: async (updatesMap) => {
        set((state) => {
            const newNodes = state.nodes.map(node => {
                if (updatesMap[node.id]) {
                    // Deep merge the existing exercises with the updates
                    // This is a simplified merge; a more robust one might be needed depending on complexity
                    const updatedExercises = { ...node.data?.exercises, ...updatesMap[node.id] };
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            exercises: updatedExercises,
                        },
                    };
                } else {
                    return node;
                }
            });
            // Ensure onNodesChange is called to trigger React Flow updates if necessary
            // This might require passing specific change objects if simply setting nodes isn't enough
            console.log("Batch updating nodes:", Object.keys(updatesMap));
            return { nodes: newNodes };
        });
      },

    //This is the end of the store  
    }),
    {
      name: "flow-store",
      partialize: (state) => ({
        patients: state.patients,
        interventions: state.interventions,
        editorStates: state.editorStates,
        profileStates: state.profileStates,
        templates: state.templates,
        exercises: state.exercises,

      }),
    }
  )
);

export default useFlowStore;
