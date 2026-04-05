import React from "react";
import useFlowStore from "../../state/flowState.js";

const InterventionsSidebar = () => {
  const { nodes, patientId } = useFlowStore();
  const sessionNodes = nodes.filter(n => n.type === 'session');

  return (
    <div className="h-full w-full bg-zinc-900 py-4 flex flex-col">
      <div className="px-4 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Interventions</h2>
      </div>

      <div className="px-4 flex-1">
        {!patientId ? (
          <p className="text-zinc-500 text-xs italic">Select a patient to see interventions</p>
        ) : sessionNodes.length === 0 ? (
          <p className="text-zinc-500 text-xs italic">No sessions found for this patient</p>
        ) : (
          <div className="space-y-2">
            <p className="text-zinc-400 text-xs">Sessions ({sessionNodes.length}):</p>
            <ul className="space-y-1">
              {sessionNodes.map(node => (
                <li key={node.id} className="text-zinc-500 text-xs truncate py-1 px-2 bg-zinc-800/30 rounded border border-zinc-800">
                  {node.data?.label || node.data?.scope || "Unnamed Session"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterventionsSidebar;
