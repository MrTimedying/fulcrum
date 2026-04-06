import React, { useState, useEffect, useMemo } from "react";
import { FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import { useInterventionStore } from "../../state/core/useInterventionStore";
import {
  createDefaultField,
  createDefaultContainer,
  generateId,
  generateFieldNameFromLabel,
} from "./exercise_modal/helpers";
import { InlineEdit } from "./exercise_modal/InlineEdit";
import { createValidationSchema } from "./exercise_modal/validationSchema";
import Field from "./exercise_modal/Field";
import { FieldTypeButtons } from "./exercise_modal/FieldsButtons";
import useUIStore from "../../state/core/useUIStore";
import CustomAutocompleteSelect from "./exercise_modal/CustomAutocompleteSelect";
import { MdOutlineDataSaverOn } from "react-icons/md";
import { v4 as uuidv4 } from 'uuid';
import { getExerciseContainerDisplayName, createMangledContainerKey } from "../../utils/exerciseUtils";
import { motion, AnimatePresence } from "motion/react";
import MultiListBox from "./exercise_modal/MultiListBox";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import DatepickerModal from "../dateModal";
import { getOrderedSessions } from "../../utils/nodeDateCalculator";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import InterventionWorkflowPlaceholder from "../util/InterventionWorkflowPlaceholder";



const SessionEditor = () => {
  const [containers, setContainers] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContainers, setSelectedContainers] = useState(new Set());
  const [isBulkEditVisible, setIsBulkEditVisible] = useState(false);
  const [bulkEditTargetFields, setBulkEditTargetFields] = useState(null);
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [bulkEditOperation, setBulkEditOperation] = useState('replace');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { 
    sessions, 
    selectedSessionId, 
    selectedInterventionId,
    updateSession, 
    exercises, 
    saveExercise, 
    deleteExercise,
    setSelectedSessionId
  } = useInterventionStore();
  const { setToaster } = useUIStore();

  const selectedSession = useMemo(
    () => selectedSessionId ? sessions[selectedSessionId] : null,
    [sessions, selectedSessionId]
  );

  const orderedSessions = useMemo(() => {
    if (selectedInterventionId) {
      return getOrderedSessions(sessions, selectedInterventionId);
    }
    return [];
  }, [sessions, selectedInterventionId]);

  useEffect(() => {
    // Helper to save current local state back to store
    const saveToStore = () => {
      if (!selectedSessionId) return;
      const outputData = {};
      containers.forEach(c => {
        const mid = uuidv4();
        const mkey = createMangledContainerKey(c.name, mid);
        const vals = formValues[c.id] || {};
        outputData[mkey] = {
          fields: c.fields.map(f => ({ ...f, value: vals[f.name] || "" }))
        };
      });
      updateSession(selectedSessionId, { exercises: outputData });
    };

    if (selectedSession) {
      const existingExerciseData = selectedSession.exercises || {};
      let structureToSet = [];
      let valuesToSet = {};

      if (existingExerciseData && typeof existingExerciseData === "object" && Object.keys(existingExerciseData).length > 0) {
        Object.keys(existingExerciseData).forEach(mangledKey => {
          const containerName = getExerciseContainerDisplayName(mangledKey);
          const savedContainerWrapper = existingExerciseData[mangledKey];
          
          if (savedContainerWrapper && Array.isArray(savedContainerWrapper.fields)) {
            const newContainerId = generateId();
            const reconstructedFields = [];
            const containerValues = {};

            savedContainerWrapper.fields.forEach(savedField => {
              if (savedField && savedField.name) {
                const newFieldId = generateId();
                reconstructedFields.push({
                  id: newFieldId,
                  type: savedField.type || "text",
                  label: savedField.label || savedField.name,
                  name: savedField.name,
                  required: savedField.required ?? false,
                  subtype: savedField.subtype ?? "",
                });
                containerValues[savedField.name] = savedField.value ?? "";
              }
            });

            if (reconstructedFields.length > 0) {
              structureToSet.push({
                id: newContainerId,
                name: containerName,
                fields: reconstructedFields,
              });
              valuesToSet[newContainerId] = containerValues;
            }
          }
        });
      }

      if (structureToSet.length === 0) {
        const defaultContainer = createDefaultContainer();
        structureToSet = [defaultContainer];
        structureToSet.forEach((container) => {
          valuesToSet[container.id] = {};
          container.fields.forEach((field) => {
            valuesToSet[container.id][field.name] = "";
          });
        });
      }

      setContainers(structureToSet);
      setFormValues(valuesToSet);
      setErrors({});
      setIsSubmitting(false);
    }

    return () => {
      // Auto-save on switch (optional: only if dirty)
      saveToStore();
    };
  }, [selectedSessionId]);

  const handleInputChange = (containerId, fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [containerId]: { ...(prev[containerId] || {}), [fieldName]: value }
    }));
  };

  const updateContainerName = (containerId, newName) => {
    setContainers(prev => prev.map(c => c.id === containerId ? { ...c, name: newName } : c));
  };

  const updateFieldProperties = (containerId, fieldId, newLabel) => {
    setContainers(prev => prev.map(container => {
      if (container.id !== containerId) return container;
      return {
        ...container,
        fields: container.fields.map(field => {
          if (field.id !== fieldId) return field;
          const newFieldName = generateFieldNameFromLabel(newLabel, field.id);
          
          setFormValues(current => {
            const containerVals = current[containerId] || {};
            const valueToTransfer = containerVals[field.name];
            const { [field.name]: _, ...rest } = containerVals;
            return { ...current, [containerId]: { ...rest, [newFieldName]: valueToTransfer ?? "" } };
          });

          return { ...field, label: newLabel, name: newFieldName };
        })
      };
    }));
  };

  const addContainer = () => {
    const newContainer = createDefaultContainer(undefined, containers);
    setContainers(prev => [...prev, newContainer]);
    setFormValues(prev => ({
      ...prev,
      [newContainer.id]: newContainer.fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {})
    }));
  };

  const removeContainer = (id) => {
    setContainers(prev => prev.filter(c => c.id !== id));
    setFormValues(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const addField = (containerId, type, subtype, label) => {
    const newField = createDefaultField(type, label, subtype);
    setContainers(prev => prev.map(c => 
      c.id === containerId ? { ...c, fields: [...c.fields, newField] } : c
    ));
    handleInputChange(containerId, newField.name, "");
  };

  const removeField = (containerId, fieldId) => {
    let fieldName = "";
    setContainers(prev => prev.map(c => {
      if (c.id !== containerId) return c;
      const f = c.fields.find(f => f.id === fieldId);
      if (f) fieldName = f.name;
      return { ...c, fields: c.fields.filter(f => f.id !== fieldId) };
    }));

    if (fieldName) {
      setFormValues(prev => {
        const { [fieldName]: _, ...rest } = prev[containerId] || {};
        return { ...prev, [containerId]: rest };
      });
    }
  };

  const handleSave = (c) => {
    if (c.name) {
      const containerId = uuidv4();
      const mangledKey = createMangledContainerKey(c.name, containerId);
      saveExercise({ ...c, originalName: c.name, name: mangledKey });
      setToaster({ show: true, message: "Exercise saved successfully", type: "success" });
    }
  };

  const handleSelection = (selectedOption) => {
    const newId = generateId();
    const newContainer = { ...selectedOption, id: newId };
    setContainers(prev => [...prev, newContainer]);
    setFormValues(prev => ({
      ...prev,
      [newId]: newContainer.fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {})
    }));
  };

  const handleContainerSelect = (containerId, isChecked) => {
    setSelectedContainers(prev => {
      const next = new Set(prev);
      if (isChecked) next.add(containerId);
      else next.delete(containerId);
      return next;
    });
  };

  const handleBulkApply = () => {
    if (!bulkEditTargetFields) return;
    const targets = selectedContainers.size > 0 ? Array.from(selectedContainers) : containers.map(c => c.id);
    const updated = { ...formValues };
    
    targets.forEach(cid => {
      const container = containers.find(c => c.id === cid);
      if (container) {
        container.fields.forEach(f => {
          if (f.label === bulkEditTargetFields) {
            if (!updated[cid]) updated[cid] = {};
            if (bulkEditOperation === 'replace') updated[cid][f.name] = bulkEditValue;
            else {
              const current = String(updated[cid][f.name] || "");
              const val = String(bulkEditValue || "");
              updated[cid][f.name] = current + (current && val ? " " : "") + val;
            }
          }
        });
      }
    });
    setFormValues(updated);
    setIsBulkEditVisible(false);
  };

  const bulkEditFieldOptions = useMemo(() => {
    const targets = selectedContainers.size > 0 ? containers.filter(c => selectedContainers.has(c.id)) : containers;
    const labels = new Set();
    targets.forEach(c => c.fields.forEach(f => f.label && labels.add(f.label)));
    return Array.from(labels);
  }, [containers, selectedContainers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;

    const schema = createValidationSchema(containers);
    setIsSubmitting(true);
    try {
      await schema.validate(formValues, { abortEarly: false });
      const outputData = {};
      containers.forEach(c => {
        const mid = uuidv4();
        const mkey = createMangledContainerKey(c.name, mid);
        const vals = formValues[c.id] || {};
        outputData[mkey] = {
          fields: c.fields.map(f => ({ ...f, value: vals[f.name] || "" }))
        };
      });
      
      updateSession(selectedSession.id, { exercises: outputData });
      setToaster({ type: "success", message: "Exercise data saved successfully.", show: true });
    } catch (err) {
      const formatted = {};
      if (err.inner) {
        err.inner.forEach(e => {
          const [cid, fn] = e.path.split(".");
          if (cid && fn) {
            if (!formatted[cid]) formatted[cid] = {};
            formatted[cid][fn] = e.message;
          }
        });
      }
      setErrors(formatted);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { patientId } = useNavigationStore();

  if (!selectedSession) {
    // Determine which workflow step the user is currently blocked on
    const activeStep = !patientId ? 0 : !selectedInterventionId ? 1 : 2;
    return <InterventionWorkflowPlaceholder activeStep={activeStep} />;
  }

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900 text-white overflow-hidden border-l border-zinc-800">
      {/* Header */}
      <div className="bg-zinc-900 p-1 flex justify-between items-center border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center">
          <h2 className="text-gray-300 text-base font-medium ml-2 mr-4">Session editor</h2>
          <div className="flex items-center space-x-4">
            <InlineEdit
              value={selectedSession.name || ""}
              onSave={(newName) => updateSession(selectedSession.id, { name: newName })}
              displayClassName="text-[10px] text-zinc-400 uppercase font-bold tracking-widest hover:text-zinc-300 transition-colors"
              inputClassName="text-[10px] bg-zinc-800 text-white border border-zinc-500 rounded px-1 outline-none"
            />
            <button 
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center space-x-1.5 text-zinc-500 hover:text-zinc-400 transition-colors group"
            >
              <HiOutlineCalendarDays size={14} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono">
                {selectedSession.date ? new Date(selectedSession.date).toLocaleDateString() : "SET DATE"}
              </span>
            </button>
          </div>
        </div>
        <div className="text-[9px] text-zinc-600 mr-2 font-mono">
           ID: {selectedSession.id.slice(0, 8)}...
        </div>
      </div>

      {/* Timeline Integration Removed */}

      {/* Subheader */}
      <div className="bg-zinc-900 flex flex-row items-center gap-4 p-2 border-b border-zinc-800 flex-shrink-0">
        <CustomAutocompleteSelect
          label="Select exercise"
          options={exercises}
          onSelect={handleSelection}
          onDelete={deleteExercise}
        />
        <button
          type="button"
          onClick={() => setIsBulkEditVisible(!isBulkEditVisible)}
          className="px-3 py-1 border border-dashed rounded-md border-neutral-900 text-neutral-400 bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-200 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isBulkEditVisible ? 'Hide Bulk Assign' : 'Bulk Assign'}
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="p-4 flex-grow overflow-y-auto space-y-4 bg-zinc-900 flex flex-col relative">
        {/* Bulk Edit Panel */}
        <AnimatePresence>
          {isBulkEditVisible && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 border border-zinc-600 rounded-lg bg-neutral-800 space-y-3 mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-100">Bulk Assign Values</h3>
              <p className="text-sm text-gray-400">
                Applying to: {selectedContainers.size === 0 ? 'All Containers' : `${selectedContainers.size} Selected Container(s)`}
              </p>
              {bulkEditFieldOptions.length > 0 ? (
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-gray-300">Select Field Labels:</label>
                  <MultiListBox
                    options={bulkEditFieldOptions}
                    value={bulkEditTargetFields}
                    onChange={setBulkEditTargetFields}
                    size={5}
                  />
                  <label className="text-sm font-medium text-gray-300 mt-2">Value to Assign:</label>
                  <input
                    type="text"
                    className="block w-full p-2 text-sm text-gray-300 border border-zinc-600 rounded-lg bg-zinc-700 focus:outline-none"
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    placeholder="Enter value"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setBulkEditOperation('replace')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${bulkEditOperation === 'replace' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >Replace</button>
                    <button
                      type="button"
                      onClick={() => setBulkEditOperation('append')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${bulkEditOperation === 'append' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >Append</button>
                  </div>
                  <button
                    type="button"
                    onClick={handleBulkApply}
                    disabled={!bulkEditTargetFields || bulkEditValue === ''}
                    className="mt-3 px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                  >Apply</button>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No field labels available in the target containers for bulk editing.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-800/50 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm">
            {errors.form}
          </div>
        )}

        <div className="flex-grow space-y-4">
          {containers.map((container) => (
            <div
              key={container.id}
              className="pb-2 px-2 border border-gray-600 rounded-lg bg-neutral-800 space-y-2 relative group"
            >
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600/50">
                <input
                  type="checkbox"
                  className="mr-2 leading-tight"
                  checked={selectedContainers.has(container.id)}
                  onChange={(e) => handleContainerSelect(container.id, e.target.checked)}
                />
                <div className="flex-grow mr-2">
                  <InlineEdit
                    value={container.name}
                    onSave={(newName) => updateContainerName(container.id, newName)}
                    inputClassName="text-md font-semibold w-full"
                    displayClassName="text-md font-semibold text-gray-800 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleSave(container)}
                    className="p-1.5 opacity-60 hover:opacity-100 transition-opacity text-green-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex-shrink-0"
                    title={`Save ${container.name}`}
                  >
                    <MdOutlineDataSaverOn size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeContainer(container.id)}
                    className="p-1.5 opacity-60 hover:opacity-100 transition-opacity text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex-shrink-0"
                    title={`Delete ${container.name}`}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-x-3 flex flex-row">
                {container.fields.map((field) => (
                  <Field
                    key={field.id}
                    containerId={container.id}
                    field={field}
                    value={formValues[container.id]?.[field.name] ?? ""}
                    error={errors[container.id]?.[field.name]}
                    onChange={handleInputChange}
                    onLabelSave={updateFieldProperties}
                    onRemove={removeField}
                  />
                ))}
              </div>

              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600/50 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium mr-2 text-gray-600 dark:text-gray-400">
                  Add Field:
                </span>
                <FieldTypeButtons containerId={container.id} onAddField={addField} />
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={addContainer}
              className="w-full px-4 py-2 border border-dashed rounded-md border-neutral-900 text-neutral-400 bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-200 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Add New Exercise
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 flex-shrink-0 mt-auto sticky bottom-0 bg-zinc-900">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded-md border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-white rounded-full"></span>
                Saving...
              </>
            ) : (
              <>
                <FiCheck size={18} /> Save Data
              </>
            )}
          </button>
        </div>
      </form>

      <DatepickerModal 
        isOpen={isDatePickerOpen} 
        onClose={() => setIsDatePickerOpen(false)} 
      />
    </div>
  );
};

export default SessionEditor;

