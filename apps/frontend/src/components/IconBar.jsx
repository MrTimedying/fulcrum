import React from "react";
import { 
  HiUsers, 
  HiMagnifyingGlass,
  HiOutlineCircleStack,
  HiOutlineCog6Tooth
} from "react-icons/hi2";

const IconBar = ({ activeContext, onContextChange, isSidebarCollapsed, onSettingsClick }) => {
  const iconGroups = [
    { id: 'patients', icon: HiUsers, label: 'Patients' },
    { id: 'interventions', icon: HiOutlineCircleStack, label: 'Interventions' },
    { id: 'search', icon: HiMagnifyingGlass, label: 'Search' },
  ];

  return (
    <div className="w-14 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 space-y-4 z-20 flex-shrink-0 select-none">
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
              <div className={`absolute left-0 w-0.5 h-7 bg-indigo-500 transition-all duration-200 ${isActive ? 'scale-y-100' : 'scale-y-0'}`} />
              
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
