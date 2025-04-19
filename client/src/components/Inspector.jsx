import React from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { IoClose } from "react-icons/io5";
import useFlowStore from "../state/flowState";

function Inspector({ isOpen, onClose }) {
  const { nodes, setNodes } = useFlowStore();
  const selectedNodes = Array.isArray(nodes) ? nodes.filter(node => node.selected) : [];

  const defaultModalConfig = {
    width: 400,
    height: 300,
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight / 2 - 150,
  };

  const handleClose = () => {
    setNodes(nodes.map(node => ({ ...node, selected: false })));
    onClose();
  };

    // Properties to exclude from display
    const excludedKeys = ["selected", "position", "measured"];

    // Utility to render nested objects
    const renderValue = (value, depth = 0) => {
      if (value === null || value === undefined) {
        return "N/A";
      }
      if (typeof value === "object") {
        return (
          <div className="ml-4 space-y-1">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-400 capitalize">
                  {key}:
                </span>
                <span className="text-gray-200">
                  {renderValue(val, depth + 1)}
                </span>
              </div>
            ))}
          </div>
        );
      }
      return String(value);
    };
  

  return (
    <Modal
      isOpen={isOpen}
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
        <div className="bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
          <div className="bg-gray-900 p-4 flex justify-between items-center modal-handle cursor-move">
            <h2 className="text-xl font-semibold">Inspector</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition duration-150"
            >
              <IoClose size={20} />
            </button>
          </div>
          
          <div className="p-6 flex-1 overflow-auto">
            {selectedNodes.length > 0 ? (
              <div className="space-y-6">
                {selectedNodes.map((node, index) => (
                  <div key={node.id || index} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <h3 className="text-lg font-medium mb-2">{node.label || `Node ${index + 1}`}</h3>
                    <div className="space-y-2">
                      {Object.entries(node)
                        .filter(([key]) => !excludedKeys.includes(key))
                        .map(([key, value]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <span className="text-sm text-gray-400 capitalize">
                              {key}
                            </span>
                            <span className="text-gray-200">
                              {renderValue(value)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No node selected.</p>
              </div>
            )}
          </div>
        </div>
      </Rnd>
    </Modal>
  );
}

export default Inspector;
