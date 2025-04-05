import React from "react";
import ContextMenu from "./ContextMenu.jsx";






const NodeMenu = ({ isOpen, position, onClose, targetNode, actions }) => {
  if (!isOpen || !targetNode) return null; 

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Node Actions</p>

      <ul style={{ marginTop: "10px" }}>

        <li style={{ marginBottom: "8px" }}>
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
