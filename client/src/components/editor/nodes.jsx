import React, { useState } from "react";
import { Handle, Position, NodeToolbar, NodeResizer } from "@xyflow/react";
import { IoSwapVertical, IoSwapHorizontal } from "react-icons/io5";
import useFlowStore from "../../state/flowState";

export const InterventionNode = ({ data, selected, type }) => (
  <>
    <NodeResizer isVisible={selected} minWidth={100} minHeight={30} />
    <div
      style={{
        padding: 10,
        border: `1px solid ${selected ? "#32a852" : "white"}`,
        fontFamily: "Arial",
        fontSize: "11px",
        color: "white",
        fontWeight: "initial",
        borderRadius: 5,
        boxShadow: selected ? "0 0 10px #32a852" : "none",
        backgroundColor: data.color,
        transition: "all 0.2s ease",
        overflow: "hidden",
      }}
      className="w-full h-full"
    >
      <strong className="text-2xl font-bold font-serif">{type}</strong>
      {data.order && (
        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
          #{data.order}
        </span>
      )}
      <ul>
        <li className="text-stone-300">
          <a className="text-white font-bold">Name:</a>{" "}
          {data.name || "Not defined yet"}
        </li>
        <li className="text-stone-300">
          <a className="text-white font-bold">Type:</a>{" "}
          {data.type || "Not defined yet"}
        </li>
        <li className="text-stone-300">
          <a className="text-white font-bold">Description:</a>{" "}
          {data.description || "Not defined yet"}
        </li>
        <li className="text-stone-300">
          <a className="text-white font-bold">Global goal:</a>{" "}
          {data.global || "Not defined yet"}
        </li>
        <li className="text-stone-300">
          <a className="text-white font-bold">Service goal:</a>{" "}
          {data.service || "Not defined yet"}
        </li>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const PhaseNode = ({ data, selected, type }) => (
  <>
    <NodeResizer isVisible={selected} minWidth={100} minHeight={30} />
    <div
      style={{
        padding: 10,
        border: `1px solid ${selected ? "#32a852" : "white"}`,
        fontFamily: "Arial",
        fontSize: "11px",
        color: "white",
        fontWeight: "initial",
        borderRadius: 5,
        boxShadow: selected ? "0 0 10px #32a852" : "none",
        backgroundColor: data.color,
        transition: "all 0.2s ease",
        overflow: "hidden",
      }}
      className="w-full h-full"
    >
      <Handle
        type="target"
        position="top"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
      <strong className="text-2xl font-bold font-serif ">{type}</strong>
      {data.order !== null && (
        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
          #{data.order}
        </span>
      )}
      <ul>
        <li className="text-stone-300">
          <a className="text-white font-bold">Scope:</a>{" "}
          {data.scope || "Not defined yet"}
        </li>
        <li className="text-stone-300">
          <a className="text-white font-bold">Description:</a>{" "}
          {data.description || "Not defined yet"}
        </li>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const MicroNode = ({ data, selected, type }) => (
  <>
    <NodeResizer isVisible={selected} minWidth={100} minHeight={30} />
    <div
      style={{
        padding: 10,
        border: `1px solid ${selected ? "#32a852" : "white"}`,
        fontFamily: "Arial",
        fontSize: "11px",
        color: "white",
        fontWeight: "initial",
        borderRadius: 5,
        boxShadow: selected ? "0 0 10px #32a852" : "none",
        backgroundColor: data.color,
        transition: "all 0.2s ease",
        overflow: "hidden",
      }}
      className="w-full h-full"
    >
      <Handle
        type="target"
        position="top"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
      <strong className="text-2xl font-bold font-serif ">{type}</strong>
      {data.order !== null && (
        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
          #{data.order}
        </span>
      )}
      <ul>
        <li>Micro Scope: {data.scope || "Not defined yet"}</li>
        <li>Micro Description: {data.description || "Not defined yet"}</li>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const SessionNode = ({ id, data, selected, type }) => {
  const { setNodes, setEdges } = useFlowStore();

  // Default target handle position to 'left' if not set in data
  const [currentHandlePosition, setCurrentHandlePosition] = useState(
    data.targetHandlePosition || "left"
  );

  // Function to toggle target handle position between 'left' and 'top'
  const toggleHandlePosition = () => {
    const newPosition = currentHandlePosition === "left" ? "top" : "left";
    const newHandleId = `target-handle-${newPosition}`;
    setCurrentHandlePosition(newPosition);

    // Update the node's data in the store
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                targetHandlePosition: newPosition,
                targetHandleId: newHandleId, // Optional for UI
              },
            }
          : node
      )
    );

    // Update edges connected to this node's target handle to ensure they attach to the correct position
    setEdges((edgs) =>
      edgs.map((edge) => {
        if (edge.target === id) {
          return { ...edge, targetHandle: newHandleId };
        }
        return edge;
      })
    );
  };

  // Set handle positions (source always on right, targets on left/top, visually only one is active)
  const targetPosition =
    currentHandlePosition === "left" ? Position.Left : Position.Top;

  return (
    <>
      <NodeResizer isVisible={selected} minWidth={100} minHeight={30} />

      <div
        style={{
          padding: 10,
          border: `1px solid ${selected ? "#32a852" : "white"}`,
          fontFamily: "Arial",
          fontSize: "11px",
          color: "white",
          fontWeight: "initial",
          borderRadius: 5,
          boxShadow: selected ? "0 0 10px #32a852" : "none",
          backgroundColor: data.color,
          transition: "all 0.2s ease",
          overflow: "hidden",
        }}
        className="w-full h-full"
      >
        {/* --- Both handles are always rendered, only one is visible at a time --- */}
        <Handle
          type="target"
          id="target-handle-left"
          position={Position.Left}
          style={{
            background: selected ? "#6366F1" : "black",
            opacity: currentHandlePosition === "left" ? 1 : 0,
            pointerEvents: currentHandlePosition === "left" ? "auto" : "none",
            // No display:none!
          }}
        />
        <Handle
          type="target"
          id="target-handle-top"
          position={Position.Top}
          style={{
            background: selected ? "#6366F1" : "black",
            opacity: currentHandlePosition === "top" ? 1 : 0,
            pointerEvents: currentHandlePosition === "top" ? "auto" : "none",
          }}
        />

        <strong className="text-2xl font-bold font-serif ">{type}</strong>
        {data.order !== null && (
          <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
            #{data.order}
          </span>
        )}
        <ul>
          <li>Session Scope: {data.scope || "Not defined yet"}</li>
          <li>Date: {data.date || "Not defined yet"}</li>
          <li>
            <h3 className="mt-2 font-semibold text-[14px]">Activities</h3>
            {/* Check if data.exercises exists, is an object, and has keys */}
            {data.exercises &&
            typeof data.exercises === "object" &&
            Object.keys(data.exercises).length > 0 ? (
              <div>
                {" "}
                {Object.values(data.exercises).map(
                  (container, containerIndex) =>
                    container &&
                    typeof container === "object" &&
                    Array.isArray(container.fields) ? (
                      <div
                        key={`container-${containerIndex}`}
                        className="my-1"
                      >
                        <h4 className="font-medium text-[12px]">
                          {container.name || `Exercise ${containerIndex + 1}`}
                        </h4>
                        <ul>
                          {container.fields.map((field, fieldIndex) => (
                            <li key={`${containerIndex}-${fieldIndex}`}>
                              {field?.label || field?.name || "Unnamed Field"}:{" "}
                              {field?.value ?? "N/A"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null // Render nothing if a container is invalid
                )}
              </div>
            ) : (
              <span> No exercises defined</span>
            )}
          </li>
        </ul>
      </div>

      {/* Toolbar with button positioned on the top-right of the node */}
      <NodeToolbar
        position={Position.Top}
        offset={10}
        isVisible={selected}
        style={{
          left: 80, // (toolbarWidth - nodeWidth)/2 if needed
        }}
      >
        <button
          onClick={toggleHandlePosition}
          className="p-1 text-gray-300 hover:text-green-400 transition-colors rounded-full hover:bg-gray-700 bg-gray-800 border border-gray-600 shadow-sm"
          aria-label="Toggle target handle position"
          title={`Target handle on: ${currentHandlePosition}`}
        >
          {currentHandlePosition === "left" ? (
            <IoSwapHorizontal size={14} />
          ) : (
            <IoSwapVertical size={14} />
          )}
        </button>
      </NodeToolbar>
    </>
  );
};

export default SessionNode;
