import React from "react";
import { useShallow } from "zustand/react/shallow";
import useFlowStore from "../../state/flowState";
import KanbanBoard from "../kanban/KanbanBoard";

const selector = (state) => ({
  patientId: state.patientId,
});

function Profile() {
  const { patientId } = useFlowStore(useShallow(selector));

  return (
    <div
      id="wrapper"
      className="flex flex-col h-full overflow-hidden bg-zinc-950"
    >
      <header className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-thin text-white tracking-tight">Patient Profile</h1>
          <p className="text-xs text-zinc-500 font-mono">ICF Dimensions Overview</p>
        </div>
      </header>
      
      <main className="flex-grow overflow-hidden">
        <KanbanBoard patientId={patientId} />
      </main>
    </div>
  );
}

export default React.memo(Profile);
