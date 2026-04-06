import React from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { IoClose } from "react-icons/io5";
import { useInterventionStore } from "../../state/core/useInterventionStore";
import SessionNodeInspector from "./SessionNodeInspector";
import MicroNodeInspector from "./MicroNodeInspector";
import PhaseNodeInspector from "./PhaseNodeInspector";
import InterventionNodeInspector from "./InterventionNodeInspector";
import NoDateWarning from "./NoDateWarning";

function Inspector({ isOpen, onClose, multiple }) {
  const { 
    selectedSessionId, 
    selectedStructuralNodeId, 
    selectedStructuralNodeType,
    sessions,
    phases,
    microcycles,
    interventions,
    setSelectedNode
  } = useInterventionStore();

  const defaultModalConfig = {
    width: window.innerWidth, // Set to full width
    height: window.innerHeight, // Set to full height
    x: 0,
    y: 0,
  };

  const handleClose = () => {
    setSelectedNode(null, null);
    onClose();
  };

  // Determine which inspector to show based on selected state in the store
  const renderInspectorContent = () => {
    if (selectedSessionId) {
      const session = sessions[selectedSessionId];
      if (!session) {
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Session not found.</p>
          </div>
        );
      }
      // For session nodes, we need to check if there's a date
      if (!session.date) {
        return <NoDateWarning nodeType="session" />;
      }
      return <SessionNodeInspector node={session} />;
    }

    if (selectedStructuralNodeId) {
      switch (selectedStructuralNodeType) {
        case 'Micro':
          const micro = microcycles[selectedStructuralNodeId];
          if (!micro) break;
          return <MicroNodeInspector node={micro} />;
        case 'Phase':
          const phase = phases[selectedStructuralNodeId];
          if (!phase) break;
          return <PhaseNodeInspector node={phase} />;
        case 'Intervention':
          const intervention = interventions[selectedStructuralNodeId];
          if (!intervention) break;
          return <InterventionNodeInspector node={intervention} />;
      }
    }

    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No node selected.</p>
      </div>
    );
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
