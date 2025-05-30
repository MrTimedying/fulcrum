import React from 'react';
import Modal from 'react-modal';
import { Rnd } from 'react-rnd';
import { Close } from '@mui/icons-material';
import ICFSetsModalContent from './icf_modal/ICFSetsModalContent';
import { ReactFlowProvider } from '@xyflow/react';

// Set app element for react-modal (important for accessibility)
if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

/**
 * ICFSetsModal component for managing ICF records and set templates
 * 
 * Completely refactored to follow a modular structure similar to ExerciseModal
 * with state persistence and improved UX according to the GRAPHICAL_LAYOUT_SPECS
 */
const ICFSetsModal = ({ isOpen, onClose }) => {
  // Default modal configuration for Rnd
  const defaultModalConfig = {
    width: 900, // Wider to accommodate sidebar layout
    height: 700,
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 450 : 100, // Center horizontally
    y: typeof window !== "undefined" ? window.innerHeight / 2 - 350 : 100, // Center vertically
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="ICF Sets and Templates Modal"
      style={{
        content: {
          background: 'transparent',
          border: 'none',
          padding: 0,
          inset: 0,
          overflow: 'hidden',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1000,
        },
      }}
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={700}
        minHeight={500}
        bounds="window"
        dragHandleClassName="modal-handle"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Modal Content Wrapper */}
        <div className="bg-zinc-900 text-white shadow-lg overflow-hidden flex flex-col h-full rounded-lg border border-zinc-600">
          {/* Header - Use modal-handle for dragging */}
          <div className="bg-zinc-800 px-2 flex justify-between items-center modal-handle cursor-move rounded-t-lg">
            <h2 className="text-xs font-thin">ICF Sets Manager</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-lg font-medium transition duration-150"
              aria-label="Close modal"
              title="Close"
            >
              x
            </button>
          </div>

          {/* Main content area */}
          <div className="flex-grow flex overflow-hidden">
            <ReactFlowProvider>
              <ICFSetsModalContent onClose={onClose} />
            </ReactFlowProvider>
          </div>

          {/* No footer needed since we moved controls to content component */}
        </div>
      </Rnd>
    </Modal>
  );
};

export default ICFSetsModal;