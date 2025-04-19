import React from "react";
import ContextMenu from "./ContextMenu.jsx";
import { BsMenuButtonFill } from "react-icons/bs";


const NodeMenu = ({ isOpen, position, onClose, targetNode, actions, setIsInspectorOpen }) => {
  if (!isOpen || !targetNode) return null;
  

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <p style={{ fontWeight: "bold", marginBottom: "8px" }} className="flex items-center gap-2 mb-0 text-sm text-slate-300 rounded-sm p-1"><BsMenuButtonFill/> Node Actions</p>

      <ul style={{ marginTop: "10px" }}>
      <li style={{ marginBottom: "8px" }} className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <button
            onClick={() => {
              setIsInspectorOpen(true);
              onClose();
            }}
          >
            Inspect Node
          </button>
        </li>
        <li style={{ marginBottom: "8px" }} className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <button
            onClick={() => {
              actions?.deleteNode(targetNode);
              onClose();
            }}
          >
            Delete Node
          </button>
        </li>
      </ul>
    </ContextMenu>
  );
};

export default NodeMenu;
