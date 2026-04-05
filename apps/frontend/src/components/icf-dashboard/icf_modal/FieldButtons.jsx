import React from "react";
import { FiType, FiAlignLeft, FiHash, FiList } from "react-icons/fi";

// Component for rendering a set of buttons to add different field types
export const FieldButtons = ({ onAddField }) => {
  const fieldTypes = [
    { type: "text", label: "Text", icon: <FiType /> },
    { type: "textarea", label: "Long Text", icon: <FiAlignLeft /> },
    { type: "number", label: "Number", icon: <FiHash /> },
    { type: "select", label: "Select", icon: <FiList /> },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {fieldTypes.map((field) => (
        <button
          key={field.type}
          type="button"
          onClick={() => onAddField(recordId, field.type)}
          className="inline-flex items-center justify-center gap-1 px-3 py-1 
                     text-xs font-medium rounded bg-zinc-700 text-white 
                     hover:bg-zinc-600 transition-colors duration-200"
        >
          {field.icon}
          <span>{field.label}</span>
        </button>
      ))}
    </div>
  );
};

export default FieldButtons;
