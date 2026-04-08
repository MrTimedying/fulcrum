import React from "react";
import { 
  HiUsers, 
  HiMagnifyingGlass,
  HiOutlineCircleStack,
  HiOutlineCog6Tooth,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiOutlineArrowUpTray,
  HiOutlineBeaker,
  HiOutlinePresentationChartLine
} from "react-icons/hi2";
import { usePatientStore } from "../state/core/usePatientStore";
import { useInterventionStore } from "../state/core/useInterventionStore";
import { useNavigationStore } from "../state/core/useNavigationStore";
import { exportIntervention, importIntervention } from "../utils/interventionExchange";
import { generateDummyIntervention } from "../utils/dummyGenerator";

const IconBar = ({ activeContext, onContextChange, isSidebarCollapsed, onSettingsClick }) => {
  const clearPatients = usePatientStore(state => state.clearPatients);
  const clearInterventions = useInterventionStore(state => state.clearInterventions);
  const setPatientId = useNavigationStore(state => state.setPatientId);
  const patientId = useNavigationStore(state => state.patientId);
  const selectedInterventionId = useInterventionStore(state => state.selectedInterventionId);

  const isDevelopment = process.env.NODE_ENV === 'development';

  const handlePurge = () => {
    if (window.confirm("ARE YOU SURE? This will PURGE ALL PATIENTS and ALL INTERVENTIONS. This cannot be undone.")) {
      clearPatients();
      clearInterventions();
      setPatientId("");
      window.location.reload(); // Reload to ensure all components reset
    }
  };

  const handleExport = () => {
    if (selectedInterventionId) {
      exportIntervention(selectedInterventionId);
    } else {
      alert("Please select an intervention first.");
    }
  };

  const handleImport = () => {
    importIntervention(patientId);
  };

  const handleGenerate = () => {
    if (patientId) {
      generateDummyIntervention(patientId);
    } else {
      alert("Please select a patient first.");
    }
  };

  const iconGroups = [
    { id: 'patients', icon: HiUsers, label: 'Patients' },
    { id: 'interventions', icon: HiOutlineCircleStack, label: 'Interventions' },
    { id: 'analysis', icon: HiOutlinePresentationChartLine, label: 'Data Analysis' },
    { id: 'search', icon: HiMagnifyingGlass, label: 'Search' },
  ];

  return (
    <div className="w-10 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 space-y-4 z-20 flex-shrink-0 select-none">
      {/* Top Icons */}
      <div className="flex-1 flex flex-col items-center space-y-4 w-full">
        {iconGroups.map(({ id, icon: Icon, label }) => {
          const isActive = activeContext === id && !isSidebarCollapsed;
          return (
            <div
              key={id}
              onClick={() => onContextChange(id)}
              className={`relative flex items-center justify-center w-full py-3 cursor-pointer group transition-all`}
              title={label}
            >
              {/* Active Indicator Line */}
              <div className={`absolute left-0 w-0.5 h-7 bg-zinc-500 transition-all duration-200 ${isActive ? 'scale-y-100' : 'scale-y-0'}`} />
              
              <Icon 
                size={24} 
                className={`transition-colors duration-200 ${
                  isActive 
                    ? 'text-zinc-100' 
                    : 'text-zinc-500 group-hover:text-zinc-300'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className="w-full flex flex-col items-center pb-2">
        {isDevelopment && (
          <>
            <div
              onClick={handleExport}
              className="relative flex items-center justify-center w-full py-3 cursor-pointer group transition-all"
              title="Export Intervention (JSON)"
            >
              <HiOutlineArrowUpTray 
                size={24} 
                className="text-blue-500/50 group-hover:text-blue-500 transition-colors duration-200"
              />
            </div>
            <div
              onClick={handleImport}
              className="relative flex items-center justify-center w-full py-3 cursor-pointer group transition-all"
              title="Import Intervention (JSON)"
            >
              <HiOutlineArrowDownTray 
                size={24} 
                className="text-green-500/50 group-hover:text-green-500 transition-colors duration-200"
              />
            </div>
            <div
              onClick={handleGenerate}
              className="relative flex items-center justify-center w-full py-3 cursor-pointer group transition-all"
              title="Generate Dummy Data"
            >
              <HiOutlineBeaker 
                size={24} 
                className="text-amber-500/50 group-hover:text-amber-500 transition-colors duration-200"
              />
            </div>
            <div
              onClick={handlePurge}
              className="relative flex items-center justify-center w-full py-3 cursor-pointer group transition-all"
              title="PURGE ALL DATA (DEV ONLY)"
            >
              <HiOutlineTrash 
                size={24} 
                className="text-red-500/50 group-hover:text-red-500 transition-colors duration-200"
              />
            </div>
          </>
        )}
        <div
          onClick={onSettingsClick}
          className={`relative flex items-center justify-center w-full py-3 cursor-pointer group transition-all`}
          title="Settings"
        >
          <HiOutlineCog6Tooth 
            size={24} 
            className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default IconBar;
