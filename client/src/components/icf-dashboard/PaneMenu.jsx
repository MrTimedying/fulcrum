import React, {useEffect, useState} from "react";
import ContextMenu from "../editor/ContextMenu";
import { BsMenuButtonFill } from "react-icons/bs";

const PaneMenu = ({ isOpen, position, onClose, actions, clipboard }) => {
  if (!isOpen) return null;

  const handleNodeCreation = (type) => {
    return () => {
      actions.addNode(position, type);
      onClose();
    };
  };

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <p style={{ fontWeight: "bold", marginBottom: "8px" }} className="flex items-center gap-2 mb-0 text-sm text-slate-300 rounded-sm p-1"><BsMenuButtonFill/>Pane Menu</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <button onClick={handleNodeCreation('profile')}>
            New Profile
          </button>
        </li>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
          <button onClick={handleNodeCreation('test')}>
            New Test Result
          </button>
        </li>
                {(clipboard.nodes || clipboard.edges) && (
                  <>
                  <hr className="my-1 border-solid border-zinc-700"></hr>
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
                  </>
                )}
      </ul>
    </ContextMenu>
  );
};

export default PaneMenu;
