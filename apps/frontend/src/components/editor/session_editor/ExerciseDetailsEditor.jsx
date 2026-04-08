import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiGrid, FiChevronDown, FiPlusCircle, FiInfo, FiChevronUp } from 'react-icons/fi';
import Field from '../exercise_modal/Field';
import { InlineEdit } from '../exercise_modal/InlineEdit';

const FIELD_GUIDE_DATA = {
  name: {
    title: "Name Input",
    description: "The name of the exercise or activity.",
    syntax: "Any text string.",
    important: "Keep it descriptive but concise."
  },
  sets: {
    title: "Sets Number",
    description: "Total number of sets for this exercise.",
    syntax: "A positive whole number (e.g., 3, 4, 5).",
    important: "Leave blank if not applicable. Controls the required number of entries in variant schemas."
  },
  reps_constant: {
    title: "Repetitions",
    description: "Number of repetitions performed per set.",
    syntax: "A positive whole number (e.g., 8, 10, 12).",
    important: "Use 'Repetitions schema' if the reps vary between sets."
  },
  reps_variant: {
    title: "Repetitions Schema",
    description: "Schema for varying repetitions across multiple sets.",
    syntax: "Numbers separated by semicolons (e.g., '12;10;8;').",
    important: "Each entry must end with a semicolon. The number of entries must exactly match the 'Sets Number'."
  },
  duration_constant: {
    title: "Duration",
    description: "A fixed duration for the exercise or per set.",
    syntax: "HH:MM:SS format (e.g., '0:05:30', '00:45', '45').",
    important: "Minutes and seconds must be between 00 and 59."
  },
  duration_variant: {
    title: "Duration Schema",
    description: "Schema for varying durations across sets.",
    syntax: "HH:MM:SS; format separated by semicolons (e.g., '0:05:30;0:04:00;').",
    important: "Each entry must end with a semicolon. The number of entries must exactly match the 'Sets Number'."
  },
  intensity_type: {
    title: "Intensity Type",
    description: "The metric used to measure intensity (e.g., RPE, %1RM, kg, lbs).",
    syntax: "Any text string (e.g., 'RPE', '%1RM', 'kg').",
    important: "Provides context for how the Intensity number or schema is interpreted."
  },
  intensity_string: {
    title: "Intensity Schema",
    description: "Schema for varying intensity across sets.",
    syntax: "Exactly 2 digits separated by semicolons (e.g., '75;80;85;').",
    important: "Each entry must end with a semicolon. The number of entries must exactly match the 'Sets Number'."
  },
  intensity_number: {
    title: "Intensity",
    description: "A single, constant intensity value.",
    syntax: "A positive number (e.g., 8 for RPE 8, or 75 for 75%).",
    important: "Relies on the 'Intensity Type' field for unit context."
  },
  tags: {
    title: "Tags",
    description: "Tags for categorizing or filtering the exercise.",
    syntax: "Hashtag followed by a word and a semicolon (e.g., '#hypertrophy;#chest;').",
    important: "Must start with '#' and end with ';'. No spaces allowed inside tags."
  }
};

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
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  // Auto-open guide when focusing
  useEffect(() => {
    if (focusedField) {
      setIsGuideOpen(true);
    }
  }, [focusedField]);

  const activeField = focusedField || hoveredField;
  const activeGuideInfo = activeField ? FIELD_GUIDE_DATA[activeField.subtype] : null;

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
    <div className="flex flex-col h-full bg-zinc-900 relative">
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
      <div className="flex-grow overflow-y-auto p-4 pb-40">
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
                  onFocus={setFocusedField}
                  onBlur={() => setFocusedField(null)}
                  onMouseEnter={setHoveredField}
                  onMouseLeave={() => setHoveredField(null)}
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

      {/* Guide Container */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex flex-col z-10 transition-all duration-300">
        <button
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="flex items-center justify-between w-full px-4 py-2 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-zinc-400">
            <FiInfo size={14} className={activeGuideInfo ? "text-blue-400" : ""} />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Field Guide {activeGuideInfo ? `- ${activeGuideInfo.title}` : ''}
            </span>
          </div>
          <div className="text-zinc-500">
            {isGuideOpen ? <FiChevronDown size={14} /> : <FiChevronUp size={14} />}
          </div>
        </button>
        
        {isGuideOpen && (
          <div className="px-4 pb-4 pt-1">
            {activeGuideInfo ? (
              <div className="space-y-3">
                <div>
                  <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Description</h4>
                  <p className="text-[12px] text-zinc-300">{activeGuideInfo.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Syntax</h4>
                    <p className="text-[12px] text-blue-300 font-mono bg-blue-500/10 px-2 py-1 rounded inline-block">
                      {activeGuideInfo.syntax}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Important</h4>
                    <p className="text-[12px] text-amber-300/80 bg-amber-500/10 px-2 py-1 rounded">
                      {activeGuideInfo.important}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-[11px] text-zinc-500">Select or hover over an input field to see its guide.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseDetailsEditor;
