import React, { useState } from 'react';
import { FiSave, FiPlus, FiGrid, FiChevronDown, FiPlusCircle } from 'react-icons/fi';
import Field from '../exercise_modal/Field';
import { InlineEdit } from '../exercise_modal/InlineEdit';

const ExerciseDetailsEditor = ({
  container,
  formValues,
  errors,
  onInputChange,
  onUpdateName,
  onUpdateField,
  onAddField,
  onRemoveField,
  onForceSave,
  onAddExercise,
  onToggleBulkAssign,
  isBulkAssignOpen
}) => {
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);

  const fieldSubtypes = [
    { type: "text", subtype: "name", label: "Name Input" },
    { type: "number", subtype: "sets", label: "Sets Number" },
    { type: "number", subtype: "reps_constant", label: "Repetitions" },
    { type: "textarea", subtype: "reps_variant", label: "Repetitions schema" },
    { type: "text", subtype: "duration_constant", label: "Duration" },
    { type: "textarea", subtype: "duration_variant", label: "Duration schema" },
    { type: "text", subtype: "intensity_type", label: "Intensity Type" },
    { type: "textarea", subtype: "intensity_string", label: "Intensity Schema" },
    { type: "number", subtype: "intensity_number", label: "Intensity" },
    { type: "textarea", subtype: "tags", label: "Tags" },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Exercise Detail Header - Minimalistic, synced with left search */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-900 min-h-[53px]">
        {container ? (
          <>
            <div className="flex items-center px-2">
              <InlineEdit
                value={container.name}
                onSave={(newName) => onUpdateName(container.id, newName)}
                displayClassName="text-[11px] font-bold text-zinc-100 tracking-tight"
                inputClassName="text-[11px] font-bold bg-zinc-800 text-white border border-zinc-700 rounded px-2 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-1">
              {/* Add Field Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setIsAddFieldOpen(!isAddFieldOpen)}
                  className={`p-1.5 rounded transition-all ${
                    isAddFieldOpen 
                      ? 'text-blue-400 bg-blue-400/10' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                  }`}
                  title="Add Field"
                >
                  <FiPlusCircle size={16} />
                </button>

                {isAddFieldOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl py-1 z-50 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-zinc-800 mb-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Available Fields</span>
                    </div>
                    {fieldSubtypes.map((item) => (
                      <button
                        key={item.subtype}
                        onClick={() => {
                          onAddField(container.id, item.type, item.subtype, item.label);
                          setIsAddFieldOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-[10px] font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onForceSave}
                className="p-1.5 text-zinc-500 hover:text-green-500 hover:bg-zinc-800 rounded transition-all"
                title="Force Save"
              >
                <FiSave size={16} />
              </button>
              <button
                onClick={onAddExercise}
                className="p-1.5 text-zinc-500 hover:text-blue-500 hover:bg-zinc-800 rounded transition-all"
                title="Add Exercise"
              >
                <FiPlus size={16} />
              </button>
              <button
                onClick={onToggleBulkAssign}
                className={`p-1.5 rounded transition-all ${
                  isBulkAssignOpen 
                    ? 'text-blue-400 bg-blue-400/10' 
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                }`}
                title="Bulk Assign"
              >
                <FiGrid size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center px-4">
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              No exercise selected
            </span>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-grow overflow-y-auto p-4">
        {container ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {errors.form && (
              <div className="p-2 bg-red-900/20 border border-red-500/50 text-red-400 rounded text-xs">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {container.fields.map((field) => (
                <Field
                  key={field.id}
                  containerId={container.id}
                  field={field}
                  value={formValues[container.id]?.[field.name] ?? ""}
                  error={errors[container.id]?.[field.name]}
                  onChange={onInputChange}
                  onLabelSave={onUpdateField}
                  onRemove={onRemoveField}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-800">
            <FiGrid size={32} className="mb-4 opacity-10" />
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">Select an exercise to edit details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseDetailsEditor;
