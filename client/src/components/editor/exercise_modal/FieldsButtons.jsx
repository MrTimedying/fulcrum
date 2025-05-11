import React from 'react';

export function FieldTypeButtons({ containerId, onAddField }) {
  const subtypes = [
    { type: "text", subtype: "name", label: "Name Input", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "number", subtype: "sets", label: "Sets Number", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "numer", subtype: "reps_constant", label: "Repetitions", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "textarea", subtype: "reps_variant", label: "Repetitions schema", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "number", subtype: "duration_constant", label: "Duration", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "textarea", subtype: "duration_variant", label: "Duration schema", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "text", subtype: "intensity_type", label: "Intensity Type", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "textarea", subtype: "intensity_string", label: "Intensity Schema", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "number", subtype: "intensity_number", label: "Intensity", classStyle: "bg-zinc-800 border-2 border-zinc-600 text-white" },
    { type: "textarea", subtype: "tags", label: "Tags", classStyle: "bg-zinc-800 border-2 border-purple-600 text-white" },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
      {subtypes.map((item) => (
        <button
          key={`${item.type}-${item.subtype}`} // More robust key
          type="button"
          onClick={() => onAddField(containerId, item.type, item.subtype, item.label)}
          className={`px-2 py-1 rounded-md text-[9px] font-medium transition-colors duration-200 ease-in-out ${item.classStyle}`} // Use item.classStyle
        >
          + {item.label} {/* Using a label property for clearer button text */}
        </button>
      ))}
    </div>
  );
}

// export default FieldTypeButtons; // Export as default if used directly
