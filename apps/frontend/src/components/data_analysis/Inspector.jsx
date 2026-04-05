import React from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { IoClose } from "react-icons/io5";
import useFlowStore from "../../state/flowState";
import SessionNodeInspector from "./SessionNodeInspector";
import MicroNodeInspector from "./MicroNodeInspector";
import PhaseNodeInspector from "./PhaseNodeInspector";
import InterventionNodeInspector from "./InterventionNodeInspector";
import NoDateWarning from "./NoDateWarning";

function Inspector({ isOpen, onClose, multiple }) {
  const { nodes, setNodes } = useFlowStore();
  const selectedNodes = Array.isArray(nodes) ? nodes.filter(node => node.selected) : [];
  const selectedNode = selectedNodes[0]; // We'll focus on the first selected node

  const defaultModalConfig = {
    width: window.innerWidth, // Set to full width
    height: window.innerHeight, // Set to full height
    x: 0,
    y: 0,
  };

  const handleClose = () => {
    setNodes(nodes.map(node => ({ ...node, selected: false })));
    onClose();
  };

  // Determine which inspector to show based on node type
  const renderInspectorContent = () => {
    // Check if a node is selected
    if (!selectedNode) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No node selected.</p>
        </div>
      );
    }

    // Return the appropriate inspector based on node type
    switch (selectedNode.type) {
      case 'session':
        // For session nodes, we need to check if there's a date
        if (!selectedNode?.data?.date) {
          return <NoDateWarning nodeType={selectedNode.type} />;
        }
        return <SessionNodeInspector node={selectedNode} />;
      case 'micro':
        // No date required for micro nodes
        return <MicroNodeInspector node={selectedNode} />;
      case 'phase':
        // No date required for phase nodes
        return <PhaseNodeInspector node={selectedNode} />;
      case 'intervention':
        // No date required for intervention nodes
        return <InterventionNodeInspector node={selectedNode} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No visualization available for this node type: {selectedNode.type}</p>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={!multiple && isOpen}
      onRequestClose={handleClose}
      aria={{
        labelledby: "inspector-title",
        describedby: "inspector-description",
      }}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 1000,
        },
        content: {
          background: "transparent",
          border: "none",
          padding: 0,
          inset: 0,
          overflow: "hidden",
        },
      }}
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={300}
        minHeight={200}
        bounds="window"
        dragHandleClassName="modal-handle"
      >
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xl rounded-lg overflow-hidden border border-zinc-800">
          <div className="modal-handle bg-zinc-900 p-1 flex justify-between items-center cursor-move border-b border-zinc-800 flex-shrink-0">
            <h2 className="text-xl font-semibold">Data analysis</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition duration-150"
            >
              <IoClose size={20} />
            </button>
          </div>
          
          <div className="p-4 flex-grow overflow-y-auto space-y-4 bg-zinc-900 flex flex-col">
            {renderInspectorContent()}
          </div>
        </div>
      </Rnd>
    </Modal>
  );
}

export default Inspector;
