import React from "react";
import { BsMenuButtonFill } from "react-icons/bs";
import ContextMenu from "./editor/ContextMenu";
import { IoMdCut } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
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
        <li className="flex flex-row items-center gap-2 mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <IoMdCut /><button
            onClick={() => {
              actions.cutNodesEdges();
              onClose();
            }}
          >
            Cut
          </button>
        </li>

        {/* Copy */}
        <li className="flex flex-row items-center gap-2 mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <FaRegCopy/><button
            onClick={() => {
              actions.copyNodesEdges();
              onClose();
            }}
          >
            Copy
          </button>
        </li>

        {/* Delete */}
        <li className="flex flex-row items-center gap-2 mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <MdDeleteForever/><button
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
