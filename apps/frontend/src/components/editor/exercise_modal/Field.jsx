import React from "react";
import { FiX } from "react-icons/fi";

function Field({
  containerId,
  field,
  value,
  error,
  onChange,
  onRemove,
}) {
  const fieldIdPath = `${containerId}-${field.id}`;
  const inputClasses =
    "w-full px-1  rounded-md text-neutral-300 bg-neutral-700 focus:outline-none focus:ring-1 focus:ring-red-500 dark:focus:ring-passion-500 text-sm";
  const errorClasses =
    "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400";

  return (
    <div className="px-1 mb-1 border text-xs shadow-sm shadow-neutral-950 rounded-md border-neutral-950 bg-neutral-900 relative group/field space-y-2">
      {/* Field Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-grow flex items-center gap-2">
          <label htmlFor={fieldIdPath} className="flex items-center gap-1">
          {field.label}
          </label>
        </div>
        <button
          type="button"
          onClick={() => onRemove(containerId, field.id)}
          className="px-1 opacity-50 group-hover/field:opacity-100 transition-opacity text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full flex-shrink-0"
          aria-label={`Delete Field ${field.label}`}
          title={`Delete ${field.label}`}
        >
          <FiX size={14} />
        </button>
      </div>

      {/* Field Input */}
      {field.type === "text" && (
        <input
          id={fieldIdPath}
          name={field.name}
          type="text"
          value={value}
          onChange={(e) => onChange(containerId, field.name, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={`${inputClasses} ${error ? errorClasses : ""}`}
        />
      )}

      {field.type === "number" && (
        <input
          id={fieldIdPath}
          name={field.name}
          type="number"
          value={value}
          onChange={(e) => onChange(containerId, field.name, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={`${inputClasses} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${error ? errorClasses : ""}`}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          id={fieldIdPath}
          name={field.name}
          value={value}
          onChange={(e) => onChange(containerId, field.name, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={`${inputClasses} min-h-[60px] ${error ? errorClasses : ""}`}
        />
      )}

      {/* Error Message */}
      {error && <div className="text-red-500 text-xs my-1">{error}</div>}
    </div>
  );
}

export default Field;
