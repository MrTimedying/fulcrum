import React from "react";
import { BsMenuButtonFill } from "react-icons/bs";
import ContextMenu from "./editor/ContextMenu";

const SelectionMenu = ({ isOpen, position, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      {/* Header */}
      <p
        style={{ fontWeight: "bold", marginBottom: "8px" }}
        className="flex items-center gap-2 mb-0 text-sm text-slate-300 p-1"
      >
        <BsMenuButtonFill />
        Selection Actions
      </p>

      {/* Actions */}
      <ul style={{ marginTop: "10px" }}>
        {/* Cut */}
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <button
            onClick={() => {
              actions.cutNodesEdges();
              onClose();
            }}
          >
            Cut
          </button>
        </li>

        {/* Copy */}
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <button
            onClick={() => {
              actions.copyNodesEdges();
              onClose();
            }}
          >
            Copy
          </button>
        </li>

        {/* Paste */}
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <button
            onClick={() => {
              const pastePosition = {
                x: position?.x || 100,
                y: position?.y || 100,
              };
              actions.pasteNodesEdges(pastePosition);
              onClose();
            }}
          >
            Paste
          </button>
        </li>

        {/* Delete */}
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <button
            onClick={() => {
              actions.deleteSelectedNodesEdges();
              onClose();
            }}
          >
            Delete
          </button>
        </li>
      </ul>
    </ContextMenu>
  );
};

export default SelectionMenu;
