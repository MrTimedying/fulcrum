import React, {
  useRef,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import { useShallow } from "zustand/react/shallow";
import { debounce } from "../utils";
import {
  useReactFlow,
  ReactFlow,
  Controls,
  Background,
  reconnectEdge,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeMenu from "../editor/nodeMenu";
import PaneMenu from "./PaneMenu"; // Specific Node Context Menu
import { v4 as uuidv4 } from "uuid";
import useFlowStore from "../../state/flowState";
import useTransientStore from "../../state/transientState";
import {
  ProfileNode,
  BodyStructureNode,
  ActivitiesNode,
  ParticipationNode,
  RecordElement,
} from "./nodes";
import { getProfileComposerTemplates } from "../variables";
import Inspector from "../data_analysis/Inspector";
import SelectionMenu from "../selectionMenu";
import useKeyboardShortcuts from "../util/KeyboardShortcuts";




// Updated dataTemplates
const dataTemplates = {
  profile: () => ({
    id: uuidv4(),
    name: "New Profile",
    color: "rgba(28, 28, 28, 1)",
  }),
  bodyStructure: () => ({
    id: uuidv4(),
    name: "New Body Structure",
    color: "rgba(28, 28, 28, 1)",
  }),
  activities: () => ({
    id: uuidv4(),
    name: "New Activity",
    color: "rgba(28, 28, 28, 1)",
  }),
  participation: () => ({
    id: uuidv4(),
    name: "New Participation",
    color: "rgba(28, 28, 28, 1)",
  }),
  record: () => ({
    id: uuidv4(),
    name: "New Record Element",
    color: "rgba(28, 28, 28, 1)",
  }),
};

// Updated nodeTemplates
const nodeTemplates = {
  profile: {
    type: "profile",
  },
  bodyStructure: {
    type: "bodyStructure",
  },
  activities: {
    type: "activities",
  },
  participation: {
    type: "participation",
  },
  record: {
    type: "record",
  },
  
};

const selector = (state) => ({
  patientId: state.patientId,
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
  patients: state.patients,
});

function Profile({ isInspectorOpen, setIsInspectorOpen, handleEditPatient }) {
  // STATE MANAGEMENT
  const { setToaster } = useTransientStore();

  const {
    patientId,
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
    patients,
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

  const columnTemplates = getProfileComposerTemplates(updateNodeData);

  const selectedNode = nodes.find((node) => node.selected);
  const multipleNodesSelected =
    nodes.filter((node) => node.selected).length > 1;

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
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true; // Reconnection successful
    setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
  }, []);
  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id)); // Remove edge
    }
    edgeReconnectSuccessful.current = true; // Reset
  }, []);

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
        profile: ["bodyStructure", "activities", "participation"],
        bodyStructure: ["record"],
        activities: ["record"],
        participation: ["record"],
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
  const reactFlowWrapper = useRef(null);

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
      (type === "profile" ||
        type === "bodyStructure" ||
        type === "activities" ||
        type === "participation") &&
      nodes.some((n) => n.type === type)
    ) {
      return false;
    }

    return true;
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

      // Validate node addition for certain types
      if (!validateNodeAddition(type, nodes)) {
        setToaster({
          type: "error",
          message: `A ${type} node is already present because a profile has been already initialized!`,
          show: true,
        });
        return;
      }

      // Create child nodes for "profile" type or add a simple node
      if (type === "profile") {
        createProfileWithChildren(canvasPosition);
      } else {
        addSingleNode(canvasPosition, type);
      }

      closeMenus();
    }
  };

  // Helper function to create "profile" and child nodes
  const createProfileWithChildren = (canvasPosition) => {
    const spacingX = 200; // Constant spacing for child nodes
    const childTypes = ["bodyStructure", "activities", "participation"];
    const currentPatientDetails = patients[patientId];

    console.log(currentPatientDetails);

    const profileNode = {
      id: uuidv4(),
      position: canvasPosition,
      type: "profile",
      data: dataTemplates["profile"]?.() || {},
    };

    // Store the PatientId in the node data to link it to the patient in the store
    const mergedProfileNode = { 
      ...profileNode, 
      data: {
        ...profileNode.data, 
        ...currentPatientDetails, 
        PatientId: patientId
      } 
    };

    console.log(mergedProfileNode);

    const childNodes = childTypes.map((childType, index) => ({
      id: uuidv4(),
      position: {
        x: canvasPosition.x + spacingX * (index + 1),
        y: canvasPosition.y,
      },
      type: childType,
      data: dataTemplates[childType]?.() || {},
    }));

    setNodes((nds) => [...nds, mergedProfileNode, ...childNodes]);
  };

  // Helper function to add a generic single node
  const addSingleNode = (canvasPosition, type) => {
    const newNode = {
      id: uuidv4(),
      position: canvasPosition,
      type,
      data: dataTemplates[type]?.() || {},
      ...(nodeTemplates[type] || { type, data: {} }),
    };

    setNodes((nds) => [...nds, newNode]);
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

  useKeyboardShortcuts({
    cutNodesEdges,
    copyNodesEdges,
    pasteNodesEdges: (position) => pasteNodesEdges(position, reactFlowInstance),
    deleteSelectedNodesEdges,
    undoNodesEdges,
    redoNodesEdges,
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
          onPaneClick={handlePaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          onSelectionContextMenu={onSelectionContextMenu} // Enable Node Context Menu
          nodeTypes={{
            profile: ProfileNode,
            bodyStructure: BodyStructureNode,
            activities: ActivitiesNode,
            participation: ParticipationNode,
            record: RecordElement,
          }}
          fitView
          maxZoom={5}
          minZoom={0.3}
        >
          <Background variant="dots" />
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
            handleEditPatient
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
      </div>
    </div>
  );
}

export default React.memo(Profile);
