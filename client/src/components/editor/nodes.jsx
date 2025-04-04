import {
    Handle,
  } from "@xyflow/react";
export const InterventionNode = ({ data, selected }) => (
  <div 
    style={{ 
      padding: 10, 
      border: `1px solid ${selected ? '#32a852' : 'white'}`,
      borderRadius: 5,
      boxShadow: selected ? '0 0 10px #32a852' : 'none',
      backgroundColor: selected ? 'rgba(127, 94, 163, 0.5)' : 'rgba(127, 94, 163, 0.5)',
      transition: 'all 0.2s ease'
    }}
  >
    <strong>{data.label}</strong>   
    <ul>
      <li>Intervention ID: {data.id || "Not defined yet"}</li>
      <li>Intervention Name: {data.name || "Not defined yet"}</li>
      <li>Intervention Type: {data.type || "Not defined yet"}</li>
      <li>Intervention Description: {data.description || "Not defined yet"}</li>
    </ul>
    
    <Handle type="source" position="bottom" style={{ background: selected ? '#6366F1' : 'black' }} />
  </div>
);

export const PhaseNode = ({ data, selected }) => (
  <div 
    style={{ 
      padding: 10, 
      border: `1px solid ${selected ? '#32a852' : 'white'}`,
      borderRadius: 5,
      boxShadow: selected ? '0 0 10px #32a852' : 'none',
      backgroundColor: selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      transition: 'all 0.2s ease'
    }}
  >
    <Handle type="target" position="top" style={{ background: selected ? '#6366F1' : 'black' }} />
    <strong>{data.label}</strong>
    <Handle type="source" position="bottom" style={{ background: selected ? '#6366F1' : 'black' }} />
  </div>
);

export const MicroNode = ({ data, selected }) => (
  <div 
    style={{ 
      padding: 10, 
      border: `1px solid ${selected ? '#32a852' : 'white'}`,
      borderRadius: 5,
      boxShadow: selected ? '0 0 10px #32a852' : 'none',
      backgroundColor: selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
      transition: 'all 0.2s ease'
    }}
  >
    <Handle type="target" position="top" style={{ background: selected ? '#6366F1' : 'black' }} />
    <strong>{data.label}</strong>
    <Handle type="source" position="bottom" style={{ background: selected ? '#6366F1' : 'black' }} />
  </div>
);

export const SessionNode = ({ data, selected }) => (
    <div 
      style={{ 
        padding: 10, 
        border: `1px solid ${selected ? '#32a852' : 'white'}`,
        borderRadius: 5,
        boxShadow: selected ? '0 0 10px #32a852' : 'none',
        backgroundColor: selected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
        transition: 'all 0.2s ease'
      }}
    >
      <Handle type="target" position="top" style={{ background: selected ? '#6366F1' : 'black' }} />
      <strong>{data.label}</strong>
    </div>
  );