import React, { useRef, useCallback, useState, useMemo, useEffect } from "react";
import { debounce } from "../utils";
import {
  useReactFlow,
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  reconnectEdge,
  addEdge,
  Handle,
  applyEdgeChanges,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeMenu from "./nodeMenu";
import PaneMenu from "./paneMenu"; // Specific Node Context Menu
import { v4 as uuidv4 } from "uuid";
import useFlowStore from "../../state/flowState";
import useTransientStore from "../../state/transientState";


// Nodes
const InterventionNode = ({ data, selected }) => (
  <div 
    style={{ 
      padding: 10, 
      border: `1px solid ${selected ? '#32a852' : 'white'}`,
      borderRadius: 5,
      boxShadow: selected ? '0 0 10px #32a852' : 'none',
      backgroundColor: selected ? 'rgba(127, 94, 163, 0.5)' : 'rgba(127, 94, 163, 0.5)',
      transition: 'all 0.2s ease'
    }}
  >
    <strong>{data.label}</strong>
    <Handle type="source" position="bottom" style={{ background: selected ? '#6366F1' : 'black' }} />
  </div>
);

const PhaseNode = ({ data, selected }) => (
  <div 
    style={{ 
      padding: 10, 
      border: `1px solid ${selected ? '#32a852' : 'white'}`,
      borderRadius: 5,
      boxShadow: selected ? '0 0 10px #32a852' : 'none',
      backgroundColor: selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      transition: 'all 0.2s ease'
    }}
  >
    <Handle type="target" position="top" style={{ background: selected ? '#6366F1' : 'black' }} />
    <strong>{data.label}</strong>
    <Handle type="source" position="bottom" style={{ background: selected ? '#6366F1' : 'black' }} />
  </div>
);

const MicroNode = ({ data, selected }) => (
  <div 
    style={{ 
      padding: 10, 
      border: `1px solid ${selected ? '#32a852' : 'white'}`,
      borderRadius: 5,
      boxShadow: selected ? '0 0 10px #32a852' : 'none',
      backgroundColor: selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      transition: 'all 0.2s ease'
    }}
  >
    <Handle type="target" position="top" style={{ background: selected ? '#6366F1' : 'black' }} />
    <strong>{data.label}</strong>
    <Handle type="source" position="bottom" style={{ background: selected ? '#6366F1' : 'black' }} />
  </div>
);

const SessionNode = ({ data, selected }) => (
  <div 
    style={{ 
      padding: 10, 
      border: `1px solid ${selected ? '#32a852' : 'white'}`,
      borderRadius: 5,
      boxShadow: selected ? '0 0 10px #32a852' : 'none',
      backgroundColor: selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      transition: 'all 0.2s ease'
    }}
  >
    <Handle type="target" position="top" style={{ background: selected ? '#6366F1' : 'black' }} />
    <strong>{data.label}</strong>
  </div>
);

// COLUMNS FOR THE COMPOSER

const columnTemplates = {
  intervention: [
    { title: "ID", field: "id", width: 100 },
    { title: "Name", field: "name", width: 150 },
    { title: "Description", field: "description", width: 200 },
    { title: "Global", field: "global", width: 100 },
    { title: "Service", field: "service", width: 100 },
  ],
  phase: [
    { title: "ID", field: "id", width: 100 },
    { title: "Scope", field: "scope", width: 150 },
  ],
  micro: [
    { title: "ID", field: "id", width: 100 },
    { title: "Scope", field: "scope", width: 150 },
  ],
  session: [
    { title: "ID", field: "id", width: 100 },
    { title: "Scope", field: "scope", width: 150 },
  ],
};

function Editor() {
  // STATE MANAGEMENT
  const { getFlowState, saveFlowState, selectedNodeId, setSelectedNodeId, columnsLayout, setColumnsLayout } = useFlowStore();
  const { patientId } = useTransientStore();
  const initialFlowState = getFlowState(patientId);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlowState.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlowState.edges);

  const debouncedSave = useMemo(
    () => debounce((n, e) => saveFlowState(patientId, n, e), 1000),
    [patientId]
  );

  const handleNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    if (selectedNodeId === node.id && node.selected) {
      // Deselect the node by manually triggering onNodesChange
      onNodesChange([
        {
          id: node.id,
          type: 'select',
          selected: false
        }
      ]);
      setColumnsLayout([]);
      setSelectedNodeId(null);
    } else {
      // First deselect all nodes (optional, only if you want single selection)
      const deselectChanges = nodes
        .filter(n => n.selected)
        .map(n => ({
          id: n.id,
          type: 'select',
          selected: false
        }));
      
      // Then select the clicked node
      const selectChange = {
        id: node.id,
        type: 'select',
        selected: true
      };

      setColumnsLayout((columnTemplates[node.type] || []));
      
      
      // Apply all changes
      onNodesChange([...deselectChanges, selectChange]);
      setSelectedNodeId(node.id);
    }
  }, [selectedNodeId, nodes, onNodesChange]);

  


  const handlePaneClick = useCallback((event) => {
    const isPaneClick = event.target.classList.contains('react-flow__pane') || 
                       event.target.classList.contains('react-flow__background');
    
    if (isPaneClick) {
      console.log("Genuine pane click detected");
      setSelectedNodeId(null);
      setColumnsLayout([]);
    } else {
      console.log("Click was on another element, not processing as pane click");
    }
  }, [setSelectedNodeId, setColumnsLayout]);
  
  useEffect(() =>{
    console.log("Columns Layout previously was:", columnsLayout);
  },[columnsLayout]);


  const [nodeMenu, setNodeMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    targetNode: null,
  });

  const [paneMenu, setPaneMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  const closeMenus = useCallback(() => {
    setNodeMenu({ isOpen: false, position: { x: 0, y: 0 }, targetNode: null });
    setPaneMenu({ isOpen: false, position: { x: 0, y: 0 } });
  }, []);

  // EDGE MANAGEMENT
  const edgeReconnectSuccessful = useRef(false);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true; // Reconnection successful
    setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
  }, []);
  const onReconnectEnd = useCallback(
    (_, edge) => {
      if (!edgeReconnectSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id)); // Remove edge
      }
      edgeReconnectSuccessful.current = true; // Reset
    },
    []
  );

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
        phase: ["micro"],        // Phase can only connect to Micro
        micro: ["session"],      // Micro can only connect to Session
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
    setNodeMenu({ isOpen: true, position: { x: event.clientX, y: event.clientY }, targetNode: node });
    setPaneMenu({ isOpen: false }); // Close PaneMenu
  }, []);

  // PANE CONTEXT MENU HANDLING
  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    setPaneMenu({ isOpen: true, position: { x: event.clientX, y: event.clientY } });
    setNodeMenu({ isOpen: false }); // Close NodeMenu
  }, []);

  // ACTION HANDLERS FOR MENUS
  const reactFlowInstance = useReactFlow();

  const addNode = (position, type) => {
    const canvasPosition = reactFlowInstance.screenToFlowPosition(position);

    const id = uuidv4();
    const newNode = {
      id,
      position: canvasPosition,
      data: { label: `Node ${type}` },
      type: type,
    };
    setNodes((nds) => [...nds, newNode]);
    closeMenus();
  };

  const zoomToFit = () => {
    console.log("Zooming to fit graph...");
    closeMenus();
  };

  const editNode = (node) => {
    const newLabel = prompt("Edit node label:", node.data.label);
    if (newLabel) {
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n))
      );
    }
    closeMenus();
  };

  const deleteNode = (node) => {
    setNodes((nds) => nds.filter((n) => n.id !== node.id)); // Remove node
    setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id)); // Remove edges
    closeMenus();
  };

  return (
    <div
      id="wrapper"
      className="flex flex-row h-full overflow-y-auto"
      onClick={closeMenus} // Close the context menu on a click outside
    >
      <div id="left-block" className="bg-zinc-900 flex flex-col mt-5 h-full w-full overflow-y-auto">
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
          onPaneClick={handlePaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={onPaneContextMenu} // Enable Node Context Menu
          nodeTypes={{
            intervention: InterventionNode,
            phase: PhaseNode,
            micro: MicroNode,
            session: SessionNode,
          }}
          fitView
        >
          <Background variant="dots" />
          <Controls />
        </ReactFlow>

        {/* Node Context Menu */}
        <NodeMenu
          isOpen={nodeMenu.isOpen && nodeMenu.targetNode}
          position={nodeMenu.position}
          targetNode={nodeMenu.targetNode}
          actions={{ editNode, deleteNode }}
          onClose={closeMenus}
        />
        <PaneMenu
          isOpen={paneMenu.isOpen}
          position={paneMenu.position}
          actions={{ addNode, zoomToFit }}
          onClose={closeMenus}
        />
      </div>
    </div>
  );
}

export default React.memo(Editor);
