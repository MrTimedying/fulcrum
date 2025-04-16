import { Handle, NodeResizer } from "@xyflow/react";

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
        backgroundColor: selected ? "rgba(28, 28, 28, 1)" : "rgba(28, 28, 28, 1)",
        transition: "all 0.2s ease",
      }}
      className="w-full h-full"
    >
      <strong>{data.label}</strong>
      <ul>
        <li>Intervention Name: {data.name || "Not defined yet"}</li>
        <li>Intervention Type: {data.type || "Not defined yet"}</li>
        <li>Intervention Description: {data.description || "Not defined yet"}</li>
      </ul>
      <Handle type="source" position="bottom" style={{ background: selected ? "#6366F1" : "black" }} />
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
        backgroundColor: selected ? "rgba(28, 28, 28, 1)" : "rgba(28, 28, 28, 1)",
        transition: "all 0.2s ease",
      }}
      className="w-full h-full"
    >
      <Handle type="target" position="top" style={{ background: selected ? "#6366F1" : "black" }} />
      <strong>{data.label}</strong>
      <ul>
        <li>Phase Name: {data.name || "Not defined yet"}</li>
        <li>Phase Scope: {data.scope || "Not defined yet"}</li>
        <li>Phase Description: {data.description || "Not defined yet"}</li>
      </ul>
      <Handle type="source" position="bottom" style={{ background: selected ? "#6366F1" : "black" }} />
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
        backgroundColor: selected ? "rgba(28, 28, 28, 1)" : "rgba(28, 28, 28, 1)",
        transition: "all 0.2s ease",
      }}
      className="w-full h-full"
    >
      <Handle type="target" position="top" style={{ background: selected ? "#6366F1" : "black" }} />
      <strong>{data.label}</strong>
      <ul>
        <li>Micro Name: {data.name || "Not defined yet"}</li>
        <li>Micro Scope: {data.scope || "Not defined yet"}</li>
      </ul>
      <Handle type="source" position="bottom" style={{ background: selected ? "#6366F1" : "black" }} />
    </div>
  </>
);

export const SessionNode = ({ data, selected }) => (
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
        backgroundColor: selected ? "rgba(28, 28, 28, 1)" : "rgba(28, 28, 28, 1)",
        transition: "all 0.2s ease",
      }}
      className="w-full h-full"
    >
      <Handle type="target" position="top" style={{ background: selected ? "#6366F1" : "black" }} />
      <strong>{data.label}</strong>
      <ul>
        <li>Session Name: {data.name || "Not defined yet"}</li>
        <li>Session Scope: {data.scope || "Not defined yet"}</li>
        <li>Date: {data.date || "Not defined yet"}</li>
        <li>
          Exercises:
          {Array.isArray(data.exercises) && data.exercises.length > 0 ? ( // Check if exercises is a valid array with items
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
  </>
);
