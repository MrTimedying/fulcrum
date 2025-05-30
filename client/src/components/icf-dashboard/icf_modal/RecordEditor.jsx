import React from "react";
import Field from "./Field";
import { InlineEdit } from "./InlineEdit";
import { FiTrash2 } from "react-icons/fi";

// Component for editing a single ICF record node
const RecordEditor = ({
  record,
  formValues,
  errors,
  onInputChange,
  onFieldDelete,
  onRecordDelete,
  onUpdateRecordLabel,
  selected,
  onSelect,
  isSelected,
  onToggleSelect,
}) => {
  // Get values specific to this record
  const recordValues = formValues[record.id] || {};
  const recordErrors = errors[record.id] || {};

  return (
    <div 
      className={`p-4 rounded-lg border ${
        isSelected 
          ? "border-blue-500 bg-zinc-800" 
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
      } mb-4 transition-all duration-200`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          {/* Selection checkbox moved inside */}
          <div onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              id={`select-${record.id}`}
              checked={isSelected}
              onChange={() => onToggleSelect(record.id)}
              className="w-4 h-4 rounded border-zinc-700 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="text-lg font-medium text-white">
            <InlineEdit
              value={record.code || ""}
              placeholder="Enter descriptor name"
              onSave={(value) => onUpdateRecordLabel(record.id, "code", value)}
              className="font-bold"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRecordDelete(record.id);
          }}
          className="text-zinc-400 hover:text-red-500 transition-colors duration-200"
          title="Delete record"
        >
          <FiTrash2 size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {record.fields.map((field) => (
          <Field
            key={field.id}
            field={field}
            value={recordValues[field.name]}
            recordId={record.id}
            onChange={onInputChange}
            onDelete={onFieldDelete}
            error={recordErrors[field.name]}
          />
        ))}
      </div>

      {/* Field buttons removed as they are now in the parent component */}
    </div>
  );
};

export default RecordEditor;
