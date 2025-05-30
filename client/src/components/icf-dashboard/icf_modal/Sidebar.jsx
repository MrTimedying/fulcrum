import React from "react";

// Sidebar component for the ICFSetsModal
const Sidebar = ({ activeView, setActiveView, isEditorView }) => {
  const navigationItems = [
    { id: "nodeEditor", label: "Single Node Editor" },
    { id: "templater", label: "ICF Sets Templater", disabled: isEditorView },
  ];

  return (
    <div className="w-48 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      <div className="p-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-white">ICF Manager</h3>
      </div>
      <nav className="flex-grow">
        <ul className="py-2">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => !item.disabled && setActiveView(item.id)}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm ${
                  activeView === item.id
                    ? "bg-zinc-800 text-white font-medium"
                    : item.disabled
                    ? "text-zinc-600 cursor-not-allowed"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                } transition-colors duration-200`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 text-xs text-zinc-500 border-t border-zinc-800">
        <p>Select nodes to modify or create new ICF sets</p>
      </div>
    </div>
  );
};

export default Sidebar;
