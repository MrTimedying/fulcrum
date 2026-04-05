import React from "react";
import { FiTrash2 } from "react-icons/fi";
import { ICF_CATEGORIES, ICF_QUALIFIERS } from "./helpers";

// Field component to render different types of fields based on their type
const Field = ({
  field,
  value,
  recordId,
  onChange,
  onDelete,
  onLabelChange,
  error,
}) => {
  const handleChange = (e) => {
    onChange(recordId, field.name, e.target.value);
  };

  const renderFieldInput = () => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            id={`${recordId}_${field.id}`}
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            placeholder={field.label}
            className="px-2 text-[10px] py-1 w-full rounded bg-zinc-800 border text-white focus:outline-none caret-white border-r-2 border-zinc-900"
          />
        );
      case "textarea":
        return (
          <textarea
            id={`${recordId}_${field.id}`}
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            placeholder={field.label}
            rows="3"
            className="px-2 text-[10px] py-1 w-full rounded bg-zinc-800 border text-white focus:outline-none caret-white border-r-2 border-zinc-900 resize-none"
          />
        );
      case "number":
        return (
          <input
            type="number"
            id={`${recordId}_${field.id}`}
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            placeholder={field.label}
            className="px-2 text-[10px] py-1 w-full rounded bg-zinc-800 border text-white focus:outline-none caret-white border-r-2 border-zinc-900"
          />
        );
      case "select":
        const options = field.subtype === "category"
          ? ICF_CATEGORIES
          : field.subtype === "qualifier"
          ? ICF_QUALIFIERS
          : [];
        
        return (
          <select
            id={`${recordId}_${field.id}`}
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            className="px-2 text-[10px] py-1 w-full rounded bg-zinc-800 border text-white focus:outline-none caret-white border-r-2 border-zinc-900"
          >
            <option value="">Select {field.label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            id={`${recordId}_${field.id}`}
            name={field.name}
            value={value || ""}
            onChange={handleChange}
            placeholder={field.label}
            className="px-2 text-[10px] py-1 w-full rounded bg-zinc-800 border text-white focus:outline-none caret-white border-r-2 border-zinc-900"
          />
        );
    }
  };

  return (
    <div className="mb-1 relative group">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={`${recordId}_${field.id}`}
          className="text-[10px] text-white block"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={() => onDelete(recordId, field.id)}
          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity duration-200"
          title="Delete field"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
      {renderFieldInput()}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Field;
