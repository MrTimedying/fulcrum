import React, {
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useReactFlow,
  ReactFlow,
  Controls,
  Background,
  reconnectEdge,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeMenu from "./nodeMenu";
import PaneMenu from "./PaneMenu"; // Specific Node Context Menu
import { v4 as uuidv4 } from "uuid";
import useFlowStore from "../../state/flowState";
import useTransientStore from "../../state/transientState";
import { InterventionNode, PhaseNode, MicroNode, SessionNode } from "./nodes";
import { getEditorComposerTemplates } from "../variables";
import Inspector from "../data_analysis/Inspector";
import SelectionMenu from "../selectionMenu";
import useKeyboardShortcuts from "../util/KeyboardShortcuts";
import ExerciseModal from "./exercise_modal/ExerciseModal";


const dataTemplates = {
  intervention: () => ({
    id: uuidv4(),
    name: "",
    type: "",
    description: "",
    color: "rgba(28, 28, 28, 1)",
    global: "",
    service: "",
    order: 1, // Always 1 for intervention node (there can be only one)
  }),
  phase: () => ({
    id: uuidv4(),
    scope: "Phase Scope",
    color: "rgba(28, 28, 28, 1)",
    tags: "",
    order: null, // Will be assigned when connected to a parent
  }),
  micro: () => ({
    id: uuidv4(),
    scope: "Micro Scope",
    color: "rgba(28, 28, 28, 1)",
    tags: "",
    order: null, // Will be assigned when connected to a parent
  }),
  session: () => ({
    id: uuidv4(),
    scope: "Session Scope",
    color: "rgba(28, 28, 28, 1)",
    tags: "",
    exercises: [],
    tests: [],
    order: null, // Will be assigned when connected to a parent
  }),
};

const nodeTemplates = {
  intervention: {
    type: "intervention",
  },
  phase: {
    type: "phase",
  },
  micro: {
    type: "micro",
  },
  session: {
    type: "session",
  },
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  setColumnsLayout: state.setColumnsLayout,
  clipboard: state.clipboard,
  dumpClipboard: state.dumpClipboard,
  updateNodeData: state.updateNodeData,
  applyLayout: state.applyLayout,
  stackSessionNodes: state.stackSessionNodes,
  onConnect: state.onConnect,
  onReconnect: state.onReconnect,
});

// Helper: Gather descendants and their edges given a parent nodeId (Copied from templateModal.jsx)
function getAllDescendants(parentNodeId, nodes, edges) {
  if (!parentNodeId) return { nodes: [], edges: [] };
  const descendants = new Set();
  const connectingEdges = new Set();
  const queue = [parentNodeId];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const edge of edges) {
      if (edge.source === current && !descendants.has(edge.target)) {
        descendants.add(edge.target);
        connectingEdges.add(edge.id);
        queue.push(edge.target);
      }
    }
  }
  // Include parent node in results
  const nodeSet = new Set([parentNodeId, ...descendants]);
  return {
    nodes: nodes.filter(n => nodeSet.has(n.id)),
    edges: edges.filter(e =>
      nodeSet.has(e.source) &&
      nodeSet.has(e.target)
    ),
  };
}

function Editor({ isInspectorOpen, setIsInspectorOpen, onOpenBulkEditRequest, onSingleNodeSelectedChange }) {
  // STATE MANAGEMENT
  const { setToaster } = useTransientStore();
  const reactFlowWrapper = useRef(null);

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    setColumnsLayout,
    clipboard,
    dumpClipboard,
    updateNodeData,
    applyLayout,
    stackSessionNodes,
    onConnect,
    onReconnect,
  } = useFlowStore(useShallow(selector));

  const {
    cutNodesEdges,
    copyNodesEdges,
    pasteNodesEdges,
    deleteSelectedNodesEdges,
    undoNodesEdges,
    redoNodesEdges,
  } = useFlowStore(
    useShallow((state) => ({
      cutNodesEdges: state.cutNodesEdges,
      copyNodesEdges: state.copyNodesEdges,
      pasteNodesEdges: state.pasteNodesEdges,
      deleteSelectedNodesEdges: state.deleteSelectedNodesEdges,
      undoNodesEdges: state.undoNodesEdges,
      redoNodesEdges: state.redoNodesEdges,
    }))
  );

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  const columnTemplates = getEditorComposerTemplates(updateNodeData);

  const selectedNode = nodes.find((node) => node.selected);
  const multipleNodesSelected =
    nodes.filter((node) => node.selected).length > 1;
  const singleNodeSelected = selectedNode && !multipleNodesSelected; // Helper for enabling/disabling button

  // Report single node selection status to parent (mainbody.jsx)
  useEffect(() => {
      onSingleNodeSelectedChange(singleNodeSelected);
  }, [singleNodeSelected, onSingleNodeSelectedChange]);

  const handleNodeClick = useCallback(
    (event, node) => {
      event.stopPropagation();
      if (node.selected) {
        onNodesChange([
          {
            id: node.id,
            type: "select",
            selected: false,
          },
        ]);
        setColumnsLayout([]);
      } else {
        // First deselect all nodes (optional, only if you want single selection)
        const deselectChanges = nodes
          .filter((n) => n.selected)
          .map((n) => ({
            id: n.id,
            type: "select",
            selected: false,
          }));

        // Then select the clicked node
        const selectChange = {
          id: node.id,
          type: "select",
          selected: true,
        };

        setColumnsLayout(columnTemplates[node.type] || []);
        onNodesChange([...deselectChanges, selectChange]);
      }
    },
    [nodes, onNodesChange]
  );

  const handleNodeDragStart = useCallback(
    (event, node) => {
      // If the node isn't already selected, select it when drag starts
      if (!node.selected) {
        const deselectChanges = nodes
          .filter((n) => n.selected)
          .map((n) => ({
            id: n.id,
            type: "select",
            selected: false,
          }));
        const selectChange = {
          id: node.id,
          type: "select",
          selected: true,
        };
        setColumnsLayout(columnTemplates[node.type] || []);
        onNodesChange([...deselectChanges, selectChange]);
      }
    },
    [nodes, onNodesChange, setColumnsLayout]
  );

  const handlePaneClick = useCallback(
    (event) => {
      const isPaneClick =
        event.target.classList.contains("react-flow__pane") ||
        event.target.classList.contains("react-flow__background");
      if (isPaneClick) {
        console.log("Genuine pane click detected");
        const deselectChanges = nodes
          .filter((n) => n.selected)
          .map((n) => ({
            id: n.id,
            type: "select",
            selected: false,
          }));
        onNodesChange(deselectChanges);
        setColumnsLayout([]);
      } else {
        console.log(
          "Click was on another element, not processing as pane click"
        );
      }
    },
    [nodes, onNodesChange, setColumnsLayout]
  );

  const [nodeMenu, setNodeMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetNode: null,
  });

  const [paneMenu, setPaneMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  const [selectionMenu, setSelectionMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  const closeMenus = useCallback(() => {
    setNodeMenu({ isOpen: false, position: { x: 0, y: 0 }, targetNode: null });
    setPaneMenu({ isOpen: false, position: { x: 0, y: 0 } });
    setSelectionMenu({ isOpen: false, position: { x: 0, y: 0 } });
  }, []);

  // EDGE MANAGEMENT
  const edgeReconnectSuccessful = useRef(false);
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      onEdgesChange([{ id: edge.id, type: 'remove' }]);
    }
    edgeReconnectSuccessful.current = true; // Reset
  }, [onEdgesChange]);

  const isValidConnection = useCallback(
    (connection) => {
      // Find the source and target nodes in the nodes state array
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      // Rule 1: Do not allow self connections
      if (connection.source === connection.target) {
        return false;
      }

      // Rule 2: Ensure hierarchical structure
      const validConnections = {
        intervention: ["phase"], // Intervention can only connect to Phase
        phase: ["micro"], // Phase can only connect to Micro
        micro: ["session"], // Micro can only connect to Session
      };

      // Get the type of source and target nodes
      const allowedTargetTypes = validConnections[sourceNode?.type] || [];
      if (!allowedTargetTypes.includes(targetNode?.type)) {
        return false; // Not a valid connection type
      }

      return true; // The connection is valid
    },
    [nodes] // Ensure this function recomputes when nodes change
  );

  // NODE CONTEXT MENU HANDLING
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    // Get the ReactFlow container's position
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setNodeMenu({
        isOpen: true,
        // Adjust coordinates relative to the ReactFlow container
        position: { x: event.clientX - rect.left, y: event.clientY - rect.top },
        targetNode: node,
      });
      setPaneMenu({ isOpen: false });
      setSelectionMenu({ isOpen: false });
    }
  }, []);

  // PANE CONTEXT MENU HANDLING
  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    // Get the ReactFlow container's position
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setPaneMenu({
        isOpen: true,
        // Adjust coordinates relative to the ReactFlow container
        position: { x: event.clientX - rect.left, y: event.clientY - rect.top },
      });
      setNodeMenu({ isOpen: false });
      setSelectionMenu({ isOpen: false });
    }
  }, []);

  const onSelectionContextMenu = useCallback((event) => {
    event.preventDefault();
    // Get the ReactFlow container's position
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setSelectionMenu({
        isOpen: true,
        // Adjust coordinates relative to the ReactFlow container
        position: { x: event.clientX - rect.left, y: event.clientY - rect.top },
      });
      setPaneMenu({ isOpen: false }); // Close PaneMenu
      setNodeMenu({ isOpen: false }); // Close NodeMenu
    }
  }, []);

  // ACTION HANDLERS FOR MENUS
  const reactFlowInstance = useReactFlow();

  const validateNodeAddition = (type, nodes) => {
    if (
      type === "intervention" &&
      nodes.some((n) => n.type === "intervention")
    ) {
      return false; // Prevent adding multiple "intervention" nodes
    }
    return true; // Other node types can be added without restriction
  };

  const addNode = (position, type) => {
    // Convert the position back to screen coordinates by adding the container's offset
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      const screenPosition = {
        x: position.x + rect.left,
        y: position.y + rect.top
      };
      // Now convert screen position to flow position
      const canvasPosition = reactFlowInstance.screenToFlowPosition(screenPosition);

      // Validate node addition for types like "intervention"
      if (!validateNodeAddition(type, nodes)) {
        setToaster({
          type: "error",
          message: "Only one intervention node is allowed",
          show: true,
        });
        return;
      }

      // Dynamically create node based on type
      const id = uuidv4();
      const newNode = {
        id,
        position: canvasPosition,
        data: dataTemplates[type]?.() || {}, // Generate node data dynamically
        ...(nodeTemplates[type] || { type, data: {} }), // Use template or fallback
      };

      // Add the new node to the flow
      setNodes((nds) => [...nds, newNode]);
      closeMenus(); // Close any open context menus
    }
  };

  const zoomToFit = () => {
    console.log("Zooming to fit graph...");
    closeMenus();
  };

  const editNode = (node) => {
    const newLabel = prompt("Edit node label:", node.data.label);
    if (newLabel) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n
        )
      );
    }
    closeMenus();
  };

  const deleteNode = (node) => {
    setNodes((nds) => nds.filter((n) => n.id !== node.id)); // Remove node
    setEdges((eds) =>
      eds.filter((e) => e.source !== node.id && e.target !== node.id)
    ); // Remove edges
    closeMenus();
  };

  const nodeTypes = useMemo(() => {
    return {
      intervention: InterventionNode,
      phase: PhaseNode,
      micro: MicroNode,
      session: SessionNode,
    };
  });

  useKeyboardShortcuts({
    cutNodesEdges,
    copyNodesEdges,
    pasteNodesEdges: (position) => pasteNodesEdges(position, reactFlowInstance),
    deleteSelectedNodesEdges,
    undoNodesEdges,
    redoNodesEdges,
    // Add key shortcut for bulk edit? TBD.
  });

  return (
    <div
      id="wrapper"
      className="flex flex-row h-full overflow-y-auto"
      onClick={closeMenus} // Close the context menu on a click outside
    >
      <div
        id="left-block"
        className="flex flex-col h-full w-full overflow-y-auto"
        ref={reactFlowWrapper}
      >
        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnectStart={onReconnectStart}
          onReconnect={onReconnect}
          onReconnectEnd={onReconnectEnd}
          isValidConnection={isValidConnection}
          onNodeClick={handleNodeClick}
          onNodeDragStart={handleNodeDragStart}
          selectNodesOnDrag={true}
          onPaneClick={handlePaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          onSelectionContextMenu={onSelectionContextMenu}
          nodeTypes={nodeTypes}
          // fitView
          maxZoom={5}
          minZoom={0.3}
        >
          <div className="relative top-4 left-4 z-10 space-x-2">
             {/* Pass handleOpenBulkEditModal and singleNodeSelected prop to FlowControls */}
             {/* Assuming FlowControls will be rendered here or passed needed props */}
          </div>
          <Background variant="dots" />
          {/* FlowControls Component - Moved or ensure props are passed */}
        </ReactFlow>
        {/* Node Context Menu */}
        <NodeMenu
          isOpen={nodeMenu.isOpen && nodeMenu.targetNode}
          position={nodeMenu.position}
          targetNode={nodeMenu.targetNode}
          setIsInspectorOpen={setIsInspectorOpen}
          actions={{
            cutNodesEdges,
            copyNodesEdges,
            deleteSelectedNodesEdges,
            editNode,
            deleteNode,
            setIsExerciseModalOpen,
          }}
          onClose={closeMenus}
        />
        <PaneMenu
          isOpen={paneMenu.isOpen}
          position={paneMenu.position}
          clipboard={clipboard}
          actions={{ addNode, zoomToFit, pasteNodesEdges, dumpClipboard }}
          onClose={closeMenus}
        />
        <SelectionMenu
          isOpen={selectionMenu.isOpen && multipleNodesSelected}
          position={selectionMenu.position}
          onClose={closeMenus}
          actions={{
            cutNodesEdges,
            copyNodesEdges,
            deleteSelectedNodesEdges,
          }}
        />
        <Inspector
          isOpen={isInspectorOpen}
          node={selectedNode}
          onClose={() => setIsInspectorOpen(false)}
          multiple={multipleNodesSelected}
        />
        <ExerciseModal
          isOpen={isExerciseModalOpen}
          onClose={() => setIsExerciseModalOpen(false)}
          multiple={multipleNodesSelected}
          />

      </div>
    </div>
  );
}

export default React.memo(Editor);
