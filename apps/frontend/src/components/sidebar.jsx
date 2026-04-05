import React from "react";
import PatientsSidebar from "./sidebar/PatientsSidebar";
import InterventionsSidebar from "./sidebar/InterventionsSidebar";

const Sidebar = ({ context, handleEditPatient }) => {
  switch (context) {
    case 'patients':
      return <PatientsSidebar handleEditPatient={handleEditPatient} />;
    case 'interventions':
      return <InterventionsSidebar />;
    case 'search':
      return (
        <div className="h-full w-full bg-zinc-900 py-4 px-4 text-zinc-500 text-sm italic">
          Search functionality coming soon...
        </div>
      );
    case 'settings':
      return (
        <div className="h-full w-full bg-zinc-900 py-4 px-4 text-zinc-500 text-sm italic text-center">
          Quick Settings Sidebar
        </div>
      );
    default:
      return (
        <div className="h-full w-full bg-zinc-900 py-4 px-4 text-zinc-500 text-sm italic">
          Unknown context
        </div>
      );
  }
};

export default Sidebar;
