import { Handle, NodeResizer } from "@xyflow/react";

export const ProfileNode = ({ data, selected, type }) => (
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
        overflow: "hidden",
      }}
      className="w-full h-full"
    >
      {/* Profile is input-only */}
      <strong className="text-2xl font-bold font-serif ">{type}</strong>
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
        overflow: "hidden",
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
        
      <strong className="text-2xl font-bold font-serif ">Body functions and structures</strong>
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
        overflow: "hidden",
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
        
      <strong className="text-2xl font-bold font-serif ">Activities</strong>
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
        overflow: "hidden",
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
        
      <strong className="text-2xl font-bold font-serif ">Participations</strong>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);

export const RecordElement = ({ data, selected }) => (
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
        overflow: "hidden",
      }}
      className="w-full h-full"
    >
      <Handle
        type="target"
        position="top"
        style={{ background: selected ? "#6366F1" : "black" }}
      />

      <strong>{data.type || "Define a type"}</strong>
      <ul>
        
        <li>{data.code || "Insert the appropriate code"}</li>
        <li>{data.description || "Description if needed.."}</li>
      </ul>
      <Handle
        type="source"
        position="bottom"
        style={{ background: selected ? "#6366F1" : "black" }}
      />
    </div>
  </>
);