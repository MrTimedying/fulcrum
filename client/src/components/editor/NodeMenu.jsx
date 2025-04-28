import React from "react";
import ContextMenu from "./ContextMenu.jsx";
import { BsMenuButtonFill } from "react-icons/bs";
import { ThreeDButton } from "../util/UserInterfaceElements.jsx";

const NodeMenu = ({
  isOpen,
  position,
  onClose,
  targetNode,
  actions,
  setIsInspectorOpen,
}) => {
  if (!isOpen || !targetNode) return null;

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <p
        style={{ fontWeight: "bold", marginBottom: "8px" }}
        className="flex items-center gap-2 mb-0 text-sm text-slate-300 rounded-sm p-1"
      >
        <BsMenuButtonFill /> Node Actions
      </p>

      <ul style={{ marginTop: "10px" }}>
        <li
          style={{ marginBottom: "8px" }}
          className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
        >
          <button
            onClick={() => {
              setIsInspectorOpen(true);
              onClose();
            }}
          >
            Inspect Node
          </button>
        </li>
        {targetNode.type === "session" && (
          <li
            style={{ marginBottom: "8px" }}
            className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
          >
            <button
              onClick={() => {
                actions?.setIsTestModalOpen(true);
                onClose();
              }}
            >
              Schedule testing
            </button>
          </li>
        )}
        <hr className="border-zinc-500"></hr>
        <li
          style={{ marginBottom: "8px" }}
          className="flex justify-between mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
        >
          <button
            onClick={() => {
              actions?.cutNodesEdges(targetNode);
              onClose();
            }}
          >
            Cut 
          </button>
          <span>
            CTRL + X
          </span>
        </li>
        <li
          style={{ marginBottom: "8px" }}
          className="flex justify-between mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
        >
          <button
            onClick={() => {
              actions?.copyNodesEdges(targetNode);
              onClose();
            }}
          >
            Copy
          </button>
          <span>
            CTRL + C
          </span>
        </li>
        <li
          style={{ marginBottom: "8px" }}
          className="flex justify-between mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1"
        >
          <button
            onClick={() => {
              actions?.deleteSelectedNodesEdges(targetNode);
              onClose();
            }}
          >
            Delete
          </button>
          <span>
            Del (Canc)
          </span>
        </li>
      </ul>
    </ContextMenu>
  );
};

export default NodeMenu;
