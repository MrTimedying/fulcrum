import React, {useEffect, useState} from "react";
import ContextMenu from "./ContextMenu";
import useTransientStore from "../../state/transientState";

const PaneMenu = ({ isOpen, position, onClose, actions }) => {
  if (!isOpen) return null;

  const handleNodeCreation = (type) => {
    return () => {
      actions.addNode(position, type);
      onClose();
    };
  };

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-lg p-1">
          <button onClick={handleNodeCreation('intervention')}>
            New intervention
          </button>
        </li>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-lg p-1">
          <button onClick={handleNodeCreation('phase')}>
            New phase
          </button>
        </li>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-lg p-1">
          <button onClick={handleNodeCreation('micro')}>
            New microcycle
          </button>
        </li>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-lg p-1">
          <button onClick={handleNodeCreation('session')}>
            New session
          </button>
        </li>
      </ul>
    </ContextMenu>
  );
};

export default PaneMenu;
