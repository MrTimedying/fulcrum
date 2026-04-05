import React from "react";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import KanbanBoard from "../kanban/KanbanBoard";

function Profile() {
  const { patientId } = useNavigationStore();

  return (
    <div
      id="wrapper"
      className="flex flex-col h-full overflow-hidden bg-zinc-900"
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
