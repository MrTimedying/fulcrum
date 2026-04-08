import React from "react";
import { FiX } from "react-icons/fi";

function Field({
  containerId,
  field,
  value,
  error,
  onChange,
  onRemove,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave
}) {
  const fieldIdPath = `${containerId}-${field.id}`;
  const inputClasses =
    "w-full px-2 py-1 rounded bg-zinc-800/50 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all text-[11px]";
  const errorClasses =
    "border-red-500/50 focus:ring-red-500/30";

  return (
    <div 
      className="relative group/field space-y-1"
      onMouseEnter={() => onMouseEnter && onMouseEnter(field)}
      onMouseLeave={() => onMouseLeave && onMouseLeave()}
    >
      {/* Field Header */}
      <div className="flex justify-between items-center px-0.5">
        <label htmlFor={fieldIdPath} className="text-[11px] text-zinc-300 font-bold tracking-tight">
          {field.label}
        </label>
        <button
          type="button"
          onClick={() => onRemove(containerId, field.id)}
          className="p-1 opacity-0 group-hover/field:opacity-100 transition-opacity text-zinc-600 hover:text-red-400 rounded"
          aria-label={`Delete Field ${field.label}`}
        >
          <FiX size={12} />
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
          onFocus={() => onFocus && onFocus(field)}
          onBlur={() => onBlur && onBlur()}
          placeholder={`Enter ${field.label}...`}
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
          onFocus={() => onFocus && onFocus(field)}
          onBlur={() => onBlur && onBlur()}
          placeholder={`0`}
          className={`${inputClasses} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${error ? errorClasses : ""}`}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          id={fieldIdPath}
          name={field.name}
          value={value}
          onChange={(e) => onChange(containerId, field.name, e.target.value)}
          onFocus={() => onFocus && onFocus(field)}
          onBlur={() => onBlur && onBlur()}
          placeholder={`Enter ${field.label}...`}
          className={`${inputClasses} min-h-[40px] resize-none ${error ? errorClasses : ""}`}
        />
      )}

      {/* Error Message */}
      {error && <div className="text-red-500 text-[10px] px-1">{error}</div>}
    </div>
  );
}

export default Field;
