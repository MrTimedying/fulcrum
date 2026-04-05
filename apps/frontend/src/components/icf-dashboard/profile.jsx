import React from "react";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import KanbanBoard from "../kanban/KanbanBoard";
import PatientDetails from "./PatientDetails";

function Profile() {
  const { patientId } = useNavigationStore();

  return (
    <div
      id="wrapper"
      className="flex flex-col h-full overflow-hidden bg-zinc-900"
    >
      <header className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-thin text-white tracking-tight">Patient Profile</h1>
          <p className="text-xs text-zinc-500 font-mono">ICF Dimensions & Personal Data</p>
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <PatientDetails patientId={patientId} />
        <div className="p-1">
          <KanbanBoard patientId={patientId} />
        </div>
      </main>
    </div>
  );
}

export default React.memo(Profile);
