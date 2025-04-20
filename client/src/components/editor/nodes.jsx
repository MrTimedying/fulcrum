import React, { useState } from "react";
import { Handle, Position, NodeToolbar, NodeResizer } from "@xyflow/react";
import { IoSwapVertical, IoSwapHorizontal } from "react-icons/io5";
import useFlowStore from "../../state/flowState";

export const InterventionNode = ({ data, selected }) => (
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
        backgroundColor: selected
          ? "rgba(28, 28, 28, 1)"
          : "rgba(28, 28, 28, 1)",
        transition: "all 0.2s ease",
      }}
      className="w-full h-full"
    >
      <strong>{data.label}</strong>
      <ul>
        <li>Intervention Name: {data.name || "Not defined yet"}</li>
        <li>Intervention Type: {data.type || "Not defined yet"}</li>
        <li>
          Intervention Description: {data.description || "Not defined yet"}
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

export const PhaseNode = ({ data, selected }) => (
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
        backgroundColor: selected
          ? "rgba(28, 28, 28, 1)"
          : "rgba(28, 28, 28, 1)",
        transition: "all 0.2s ease",
      }}
      className="w-full h-full"
    >
      <Handle
        type="target"
        position="top"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
      <strong>{data.label}</strong>
      <ul>
        <li>Phase Name: {data.name || "Not defined yet"}</li>
        <li>Phase Scope: {data.scope || "Not defined yet"}</li>
        <li>Phase Description: {data.description || "Not defined yet"}</li>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const MicroNode = ({ data, selected }) => (
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
        backgroundColor: selected
          ? "rgba(28, 28, 28, 1)"
          : "rgba(28, 28, 28, 1)",
        transition: "all 0.2s ease",
      }}
      className="w-full h-full"
    >
      <Handle
        type="target"
        position="top"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
      <strong>{data.label}</strong>
      <ul>
        <li>Micro Name: {data.name || "Not defined yet"}</li>
        <li>Micro Scope: {data.scope || "Not defined yet"}</li>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const SessionNode = ({ id, data, selected }) => {
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
          backgroundColor: "rgba(28, 28, 28, 1)",
          transition: "all 0.2s ease",
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

        {/* If you need a source handle always on right, you can add it here */}
        {/* <Handle type="source" id="source-handle" position={Position.Right} style={{ background: selected ? "#32a852" : "black" }} /> */}

        <strong>{data.label}</strong>
        <ul>
          <li>Session Name: {data.name || "Not defined yet"}</li>
          <li>Session Scope: {data.scope || "Not defined yet"}</li>
          <li>Date: {data.date || "Not defined yet"}</li>
          <li>
            Exercises:
            {Array.isArray(data.exercises) && data.exercises.length > 0 ? (
              <ul>
                {data.exercises.map((exercise, index) => (
                  <li key={index}>
                    {exercise.name || "Unnamed Exercise"} -{" "}
                    {exercise.reps || "No reps"} reps -{" "}
                    {exercise.duration || "No duration"} duration
                  </li>
                ))}
              </ul>
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
