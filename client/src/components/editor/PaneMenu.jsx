import React, { useEffect, useState } from "react";
import ContextMenu from "./ContextMenu";
import { BsMenuButtonFill } from "react-icons/bs";
import { CiTrash } from "react-icons/ci";

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
      <p
        style={{ fontWeight: "bold", marginBottom: "8px" }}
        className=" flex items-center gap-2 mb-0 text-sm text-slate-300 rounded-md p-1"
      >
        <BsMenuButtonFill />
        Pane Menu
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-lg p-1">
          <button onClick={handleNodeCreation("intervention")}>
            New intervention
          </button>
        </li>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-lg p-1">
          <button onClick={handleNodeCreation("phase")}>New phase</button>
        </li>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-lg p-1">
          <button onClick={handleNodeCreation("micro")}>New microcycle</button>
        </li>
        <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-lg p-1">
          <button onClick={handleNodeCreation("session")}>New session</button>
        </li>
        {(clipboard.nodes.length > 0 || clipboard.edges.length > 0) && (
          <>
          <hr className="my-1 border-solid border-zinc-700"></hr>
          <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
            <button
              onClick={() => {
                actions.pasteNodesEdges();
                onClose();
              }}
            >
              Paste
            </button>
          </li>
          <li className="mb-0 text-sm text-slate-300 hover:bg-zinc-900 rounded-sm p-1">
            <button
              onClick={() => {
                actions.dumpClipboard();
                onClose();
              }
              }
            >
              Dump selection
            </button>
          </li>
          </>
        )}
      </ul>
    </ContextMenu>
  );
};

export default PaneMenu;
