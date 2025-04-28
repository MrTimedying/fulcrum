import React from "react";


const ContextMenu = ({ isOpen, position, onClose, children }) => {
  if (!isOpen) return null; // Don't render if the menu is closed

  return (
    <div
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
      className="bg-neutral-800 rounded-md p-2 w-64" // Prevent clicks from propagating and closing the menu
    >
      {children}
      <div style={{ marginTop: "8px", textAlign: "right" }}>
      </div>
    </div>
  );
};

export default ContextMenu;
