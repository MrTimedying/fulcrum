import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { FiCheck } from "react-icons/fi";
import { useInterventionStore } from "../../state/core/useInterventionStore";
import {
  createDefaultField,
  createDefaultContainer,
  generateId,
  generateFieldNameFromLabel,
} from "./exercise_modal/helpers";
import { InlineEdit } from "./exercise_modal/InlineEdit";
import useUIStore from "../../state/core/useUIStore";
import { v4 as uuidv4 } from 'uuid';
import { getExerciseContainerDisplayName, createMangledContainerKey, getExerciseContainerId } from "../../utils/exerciseUtils";
import { AnimatePresence } from "motion/react";
import { HiOutlineCalendarDays } from "react-icons/hi2";
import DatepickerModal from "../dateModal";
import { getOrderedSessions } from "../../utils/nodeDateCalculator";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import InterventionWorkflowPlaceholder from "../util/InterventionWorkflowPlaceholder";
import { debounce } from "lodash";
import ExerciseOverviewList from "./session_editor/ExerciseOverviewList";
import ExerciseDetailsEditor from "./session_editor/ExerciseDetailsEditor";
import BulkAssignPanel from "./session_editor/BulkAssignPanel";
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';

const SessionEditor = () => {
  const [containers, setContainers] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [selectedContainers, setSelectedContainers] = useState(new Set());
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [isBulkEditVisible, setIsBulkEditVisible] = useState(false);
  const [bulkEditTargetFields, setBulkEditTargetFields] = useState(null);
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [bulkEditOperation, setBulkEditOperation] = useState('replace');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [sizes, setSizes] = useState(['50%', '50%']);

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

  // Ref to store current state for the debounced function
  const currentDataRef = useRef({ containers, formValues });

  useEffect(() => {
    currentDataRef.current = { containers, formValues };
  }, [containers, formValues]);

  const debouncedSave = useCallback(
    debounce((sessionId, data) => {
      if (!sessionId) return;

      const { containers: currentContainers, formValues: currentFormValues } = data;
      const outputData = {};

      currentContainers.forEach(c => {
        // Use existing mangledKey or generate a new one
        const mkey = c.mangledKey || createMangledContainerKey(c.name, uuidv4());
        const vals = currentFormValues[c.id] || {};
        outputData[mkey] = {
          fields: c.fields.map(f => ({ ...f, value: vals[f.name] || "" }))
        };
      });

      updateSession(sessionId, { exercises: outputData });
      setIsSaved(true);
    }, 1000),
    [updateSession]
  );

  const triggerSave = useCallback(() => {
    setIsSaved(false);
    debouncedSave(selectedSessionId, currentDataRef.current);
  }, [selectedSessionId, debouncedSave]);

  useEffect(() => {
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
                mangledKey: mangledKey // Store the mangled key
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
      
      if (structureToSet.length > 0 && (!selectedExerciseId || !structureToSet.find(c => c.id === selectedExerciseId))) {
        setSelectedExerciseId(structureToSet[0].id);
      } else if (structureToSet.length === 0) {
        setSelectedExerciseId(null);
      }

      setErrors({});
      setIsSubmitting(false);
      setIsSaved(true);
    }
  }, [selectedSessionId]);

  const handleInputChange = (containerId, fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [containerId]: { ...(prev[containerId] || {}), [fieldName]: value }
    }));
    triggerSave();
  };

  const handleForceSave = () => {
    debouncedSave.flush();
    setToaster({ show: true, message: "Manual save triggered", type: "success" });
  };

  const updateContainerName = (containerId, newName) => {
    setContainers(prev => prev.map(c => {
      if (c.id !== containerId) return c;
      const existingId = c.mangledKey ? getExerciseContainerId(c.mangledKey) : uuidv4();
      return {
        ...c,
        name: newName,
        mangledKey: createMangledContainerKey(newName, existingId)
      };
    }));
    triggerSave();
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
    triggerSave();
  };

  const addContainer = () => {
    const newContainer = createDefaultContainer(undefined, containers);
    // Initialize mangledKey immediately to ensure stability
    newContainer.mangledKey = createMangledContainerKey(newContainer.name, uuidv4());
    setContainers(prev => {
      const next = [...prev, newContainer];
      setSelectedExerciseId(newContainer.id);
      return next;
    });
    setFormValues(prev => ({
      ...prev,
      [newContainer.id]: newContainer.fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {})
    }));
    triggerSave();
  };

  const removeContainer = (id) => {
    setContainers(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (selectedExerciseId === id) {
        setSelectedExerciseId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
    setFormValues(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    triggerSave();
  };

  const addField = (containerId, type, subtype, label) => {
    const newField = createDefaultField(type, label, subtype);
    setContainers(prev => prev.map(c =>
      c.id === containerId ? { ...c, fields: [...c.fields, newField] } : c
    ));
    setFormValues((prev) => ({
      ...prev,
      [containerId]: { ...(prev[containerId] || {}), [newField.name]: "" }
    }));
    triggerSave();
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
    triggerSave();
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
    // Ensure mangledKey is present if not already in the template
    const newContainer = {
      ...selectedOption,
      id: newId,
      mangledKey: selectedOption.mangledKey || createMangledContainerKey(selectedOption.name, uuidv4())
    };
    setContainers(prev => [...prev, newContainer]);
    setFormValues(prev => ({
      ...prev,
      [newId]: newContainer.fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {})
    }));
    triggerSave();
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
    triggerSave();
  };

  const bulkEditFieldOptions = useMemo(() => {
    const targets = selectedContainers.size > 0 ? containers.filter(c => selectedContainers.has(c.id)) : containers;
    const labels = new Set();
    targets.forEach(c => c.fields.forEach(f => f.label && labels.add(f.label)));
    return Array.from(labels);
  }, [containers, selectedContainers]);

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
        
        <div className="flex items-center gap-4 mr-2">
          <div className="flex items-center gap-2 px-3 py-1 text-[10px] text-zinc-500 font-mono border border-zinc-800 rounded bg-zinc-900/50">
            {isSaved ? (
              <>
                <FiCheck className="text-green-500" />
                <span className="text-zinc-400">SAVED</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-zinc-400">SAVING...</span>
              </>
            )}
          </div>
          <div className="text-[9px] text-zinc-600 font-mono">
            ID: {selectedSession.id.slice(0, 8)}...
          </div>
        </div>
      </div>

      {/* Bulk Edit Panel */}
      <AnimatePresence>
        {isBulkEditVisible && (
          <BulkAssignPanel
            isVisible={isBulkEditVisible}
            onClose={() => setIsBulkEditVisible(false)}
            containers={containers}
            selectedContainers={selectedContainers}
            onApplyBulk={handleBulkApply}
            bulkEditFieldOptions={bulkEditFieldOptions}
            bulkEditTargetFields={bulkEditTargetFields}
            setBulkEditTargetFields={setBulkEditTargetFields}
            bulkEditValue={bulkEditValue}
            setBulkEditValue={setBulkEditValue}
            bulkEditOperation={bulkEditOperation}
            setBulkEditOperation={setBulkEditOperation}
          />
        )}
      </AnimatePresence>

      {/* Main Body: Split Pane */}
      <div className="flex-grow flex overflow-hidden bg-zinc-900">
        <SplitPane
          split='vertical'
          sizes={sizes}
          onChange={setSizes}
        >
          <Pane minSize='200px'>
            <ExerciseOverviewList
              containers={containers}
              selectedExerciseId={selectedExerciseId}
              onSelect={setSelectedExerciseId}
              onAdd={addContainer}
              onRemove={removeContainer}
              onSaveTemplate={handleSave}
              selectedContainers={selectedContainers}
              onToggleSelection={handleContainerSelect}
              onUpdateName={updateContainerName}
              exercises={exercises}
              onExerciseSelect={handleSelection}
              onExerciseDelete={deleteExercise}
              formValues={formValues}
              isBulkEditActive={isBulkEditVisible}
            />
          </Pane>
          <Pane minSize='400px'>
            <ExerciseDetailsEditor
              container={containers.find(c => c.id === selectedExerciseId)}
              formValues={formValues}
              errors={errors}
              onInputChange={handleInputChange}
              onUpdateName={updateContainerName}
              onUpdateField={updateFieldProperties}
              onAddField={addField}
              onRemoveField={removeField}
              onForceSave={handleForceSave}
              onAddExercise={addContainer}
              onToggleBulkAssign={() => setIsBulkEditVisible(!isBulkEditVisible)}
              isBulkAssignOpen={isBulkEditVisible}
            />
          </Pane>
        </SplitPane>
      </div>

      <DatepickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
      />
    </div>
  );
};

export default SessionEditor;
