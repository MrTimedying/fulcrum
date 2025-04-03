import React from "react";
import ContextMenu from "./ContextMenu.jsx";
import useTransientStore from "../../state/transientState.js"; 





const NodeMenu = ({ isOpen, position, onClose, targetNode, actions }) => {
  if (!isOpen || !targetNode) return null;
  const {setData, setColumns} = useTransientStore();

  // Helper functions to load data into the composer through Zustand state depending on the node type

const loadDataIntoComposer = (nodeData) => {
  switch (nodeData.type) {
    case "Intervention": {
      setData({
        id: nodeData.id,
        name: nodeData.name,
        type: nodeData.type,
        global: nodeData.global,
        service: nodeData.service,
        description: nodeData.description,        
      })
    };
    case "Phase" : {
      setData({
        id: nodeData.id,
        type: nodeData.type,
        scope: nodeData.scope,
      })
    }
    case "Micro": {
      setData({
        id: nodeData.id,
        type: nodeData.type,
        scope: nodeData.scope,
      })
    }
    case "Session" : {
      setData({
        id: nodeData.id,
        type: nodeData.type,
        scope: nodeData.scope,
      })
    }
  }
}

  

  return (
    <ContextMenu isOpen={isOpen} position={position} onClose={onClose}>
      <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Node Actions</p>

      <ul style={{ marginTop: "10px" }}>
        <li style={{ marginBottom: "8px" }}>
          <button
            id="createPhase"
            className="bg-zinc-900 hover:bg-black/30 text-slate-300 w-16 font-mono m-2 px-1 rounded-md cursor-pointer text-sm"
            onClick={() => {
              window.electronAPI.component.open({
                component: "composer",
              });
            }}
          >
            Edit Node
          </button>
        </li>
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
