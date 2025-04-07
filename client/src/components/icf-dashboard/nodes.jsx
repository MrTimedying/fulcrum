import { Handle, NodeResizer } from "@xyflow/react";

export const ProfileNode = ({ data, selected }) => (
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
      {/* Profile is input-only */}
      <label htmlFor="profile-input">Profile</label>
      <ul>
        <li>Name: {data.name || "Insert name"}</li>
        <li>Surname: {data.surname || "Insert surname"}</li>
        <li>Age: {data.age || "Insert age"}</li>
        <li>Gender: {data.gender || "Insert gender"}</li>
        <li>Height: {data.height || "Insert height"}</li>
        <li>Weight: {data.weight || "Insert weight"}</li>

      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const BodyStructureNode = ({ data, selected }) => (
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
      <Handle
        type="target"
        position="top"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
      <strong>{data.label}</strong>
      <ul>
        
        <li>Body Functions and Structures</li>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const ActivitiesNode = ({ data, selected }) => (
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
      <Handle
        type="target"
        position="top"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
      <strong>{data.label}</strong>
      <ul>
        
        <li>Activities</li>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const ParticipationNode = ({ data, selected }) => (
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
      <Handle
        type="target"
        position="top"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
      <strong>{data.label}</strong>
      <ul>
        
        <li>Participations</li>
      </ul>
    </div>
  </>
);
