import React, { useState, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { FiX, FiCheck } from "react-icons/fi";
import { useInterventionStore } from "../state/core/useInterventionStore";
import useUIStore from "../state/core/useUIStore";
import { getExerciseContainerDisplayName } from "../utils/exerciseUtils"; // Assuming these helpers exist or will be created
import { v4 as uuidv4 } from 'uuid';

// Accessibility Setup
if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

// Helper function to check if values are mixed
const areValuesMixed = (values) => {
  if (!values || values.length === 0) return false; // Or maybe true if inconsistent presence counts as mixed?
  const firstValue = values[0];
  return values.some(value => value !== firstValue);
};

// Helper to determine the predominant type of a field label across sessions
const getPredominantFieldType = (fieldInstances) => {
    if (!fieldInstances || fieldInstances.length === 0) return 'text'; // Default to text
    // Simple approach: take the type of the first instance found
    // A more robust approach would count types and pick the most frequent
    return fieldInstances[0].type || 'text';
};

function BulkExerciseEditModal({ isOpen, onClose, targetSessions }) {
  const [aggregatedData, setAggregatedData] = useState({
    uniqueContainerNames: [],
    commonFieldLabels: [], // { label: "Field Label", type: "text", currentValue: "Mixed" | "Value", instances: [{ sessionId, containerMangledKey, fieldName, value, type }] }
    containerSelection: new Set(), // Set of container names currently selected for bulk edit
  });
  const [pendingChanges, setPendingChanges] = useState({}); // { fieldLabel: { value: "new value", operation: "replace" } }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateMultipleSessions } = useInterventionStore(); 
  const { setToaster } = useUIStore();

  // --- Effect to Aggregate Data from targetSessions ---
  useEffect(() => {
    if (!isOpen || !targetSessions || targetSessions.length === 0) {
        setAggregatedData({
            uniqueContainerNames: [],
            commonFieldLabels: [],
            containerSelection: new Set(),
        });
        setPendingChanges({});
        return;
    }

    console.log("Aggregating data for bulk edit...", targetSessions);

    const containerNameMap = new Map(); // Map<originalName, Set<mangledKey>>
    const fieldLabelMap = new Map(); // Map<label, Array<{ sessionId, containerMangledKey, fieldName, value, type }>>

    targetSessions.forEach(session => {
        const exercises = session.exercises || {};
        Object.keys(exercises).forEach(mangledKey => {
            const containerName = getExerciseContainerDisplayName(mangledKey); // Helper to get original name
            const containerData = exercises[mangledKey];

            if (containerName) {
                 if (!containerNameMap.has(containerName)) {
                     containerNameMap.set(containerName, new Set());
                 }
                 containerNameMap.get(containerName).add(mangledKey);

                // Aggregate fields within this container
                if (containerData && Array.isArray(containerData.fields)) {
                    containerData.fields.forEach(field => {
                        if (field.label) { // Only process fields with a label
                            if (!fieldLabelMap.has(field.label)) {
                                fieldLabelMap.set(field.label, []);
                            }
                             fieldLabelMap.get(field.label).push({
                                sessionId: session.id,
                                containerMangledKey: mangledKey,
                                fieldName: field.name, // Use field.name for internal lookup
                                value: field.value, // Store the actual value
                                type: field.type, // Store the field type
                                // Note: We are using field.label as the key for aggregation
                             });
                        }
                    });
                }
            }
        });
    });

    const uniqueContainerNames = Array.from(containerNameMap.keys()).sort();
    const commonFieldLabels = Array.from(fieldLabelMap.entries())
        .map(([label, instances]) => {
            // Determine the predominant type for this label
            const type = getPredominantFieldType(instances);
            // Determine the current value status
            const values = instances.map(inst => inst.value);
            const currentValue = areValuesMixed(values) ? "Mixed Values" : (values.length > 0 ? values[0] : "");

            return { label, type, currentValue, instances };
        })
        .sort((a, b) => a.label.localeCompare(b.label)); // Sort fields alphabetically

    console.log("Aggregated Containers:", uniqueContainerNames);
    console.log("Aggregated Fields:", commonFieldLabels);

    setAggregatedData({
        uniqueContainerNames,
        commonFieldLabels,
        containerSelection: new Set(uniqueContainerNames), // Default to all containers selected
    });
    setPendingChanges({}); // Reset pending changes on data load

  }, [isOpen, targetSessions]); // Re-run when modal opens or target sessions change

  // --- Handle Input Change for Pending Changes ---
  const handlePendingChange = (fieldLabel, value, operation = 'replace') => {
      setPendingChanges(prev => ({
          ...prev,
          [fieldLabel]: { value, operation }
      }));
  };

  // --- Handle Container Selection Change ---
  const handleContainerSelectionChange = (containerName, isChecked) => {
      setAggregatedData(prev => {
          const newSelection = new Set(prev.containerSelection);
          if (isChecked) {
              newSelection.add(containerName);
          } else {
              newSelection.delete(containerName);
          }
          return { ...prev, containerSelection: newSelection };
      });
       // TODO: Re-aggregate commonFieldLabels based on new containerSelection? Or handle filtering on apply?
       // Filtering on apply might be simpler initially.
  };

  // --- Handle Apply Changes ---
  const handleApplyChanges = async () => {
      if (!targetSessions || targetSessions.length === 0 || Object.keys(pendingChanges).length === 0) {
          setToaster({
              type: "info",
              message: "No sessions selected or no changes to apply.",
              show: true,
          });
          return;
      }

      setIsSubmitting(true);

      const updatesMap = {}; // { sessionId: { exercises: updatedExerciseData } }

      targetSessions.forEach(session => {
          // Deep copy the session's current exercise data to avoid direct mutation
          const sessionExerciseDataCopy = JSON.parse(JSON.stringify(session.exercises || {}));

          // Iterate through each pending change from the modal UI
          Object.keys(pendingChanges).forEach(fieldLabelToChange => {
              const { value: newValue, operation } = pendingChanges[fieldLabelToChange];

              // Find all instances of this field label within the current session's copied data
              Object.keys(sessionExerciseDataCopy).forEach(mangledKey => {
                  // Get the original container name to check if it's selected for bulk edit
                  const originalContainerName = getExerciseContainerDisplayName(mangledKey);
                  if (!aggregatedData.containerSelection.has(originalContainerName)) {
                      return; // Skip this container if it's not selected
                  }

                  const containerData = sessionExerciseDataCopy[mangledKey];
                  if (containerData && Array.isArray(containerData.fields)) {
                      containerData.fields.forEach(field => {
                          // Check if this field matches the label we are changing
                          if (field.label === fieldLabelToChange) {
                              // Apply the change based on operation and field type
                              try {
                                 let updatedValue = field.value;

                                 if (operation === 'replace') {
                                     updatedValue = newValue; // Simple replacement
                                 } else if (operation === 'append' && field.type !== 'number') {
                                      // Append (for text/arrays)
                                      const currentValueString = updatedValue !== undefined && updatedValue !== null ? String(updatedValue) : '';
                                      const valueToAppendString = newValue !== undefined && newValue !== null ? String(newValue) : '';
                                      updatedValue = currentValueString + valueToAppendString;

                                      // Basic Array Handling: if the original field seemed like an array string, try to keep it that way
                                       // This is a simplistic approach; a more robust solution might need a dedicated "array" type or more complex parsing.
                                      if (typeof field.value === 'string' && field.value.includes(',')) {
                                           // Assuming comma-separated string arrays for now
                                            // Need to decide how appending works for these - append to the string or parse and append to array?
                                            // Let's append to the string for simplicity initially.
                                           // No change needed to updatedValue after string concatenation above.
                                      } else if (Array.isArray(field.value)) {
                                          // If the value was already an array, how to append? Append element or merge arrays?
                                          // For now, only support simple string append to text/non-number types.
                                          // More complex array handling needs specification.
                                      }

                                 } else if (field.type === 'number') {
                                      const currentNum = typeof updatedValue === 'number' ? updatedValue : parseFloat(updatedValue || '0');
                                      const amount = parseFloat(newValue || '0');

                                      if (!isNaN(currentNum) && !isNaN(amount)) {
                                          if (operation === 'add') {
                                              updatedValue = currentNum + amount;
                                          } else if (operation === 'subtract') {
                                              updatedValue = currentNum - amount;
                                          } else if (operation === 'replace') {
                                               // Number replacement case handled by the initial 'replace' block
                                               updatedValue = amount;
                                          }
                                      } else {
                                           console.warn(`Skipping numerical operation for field "${field.label}" due to non-numeric value or amount. Session ID: ${session.id}`);
                                           // Optionally notify user or log
                                      }
                                  }

                                 // Update the value in the copied data
                                 field.value = updatedValue;

                              } catch (e) {
                                  console.error(`Error applying bulk edit to field "${field.label}" in session ${session.id}:`, e);
                                  setToaster({
                                      type: "error",
                                      message: `Failed to apply change to field "${field.label}" in a session.`,
                                      show: true,
                                  });
                              }
                          }
                      });
                  }
              });
          });

           // Add the modified exercise data to the updates map
          updatesMap[session.id] = { exercises: sessionExerciseDataCopy };
      });

      console.log("Applying batch updates:", updatesMap);

      try {
          // Call the new store action
          await updateMultipleSessions(updatesMap);
          setToaster({
              type: "success",
              message: "Bulk exercise data updated successfully.",
              show: true,
          });
          onClose(); // Close modal on success
      } catch (error) {
           console.error("Error during batch update:", error);
           setToaster({
               type: "error",
               message: "Failed to save bulk exercise data.",
               show: true,
           });
      } finally {
          setIsSubmitting(false);
      }
  };

  // Default modal position (centered)
  const defaultModalConfig = useMemo(() => ({
    width: 950, // Adjusted width
    height: 950, // Adjusted height
    x: window.innerWidth / 2 - 475, // Center calculation
    y: window.innerHeight / 2 - 475,
  }), []);


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      aria={{ labelledby: "bulk-edit-title" }}
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 },
        content: {
          background: "transparent",
          border: "none",
          padding: 0,
          inset: 0,
          overflow: "hidden",
        },
      }}
      contentLabel="Bulk Exercise Data Editor"
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={600}
        minHeight={400}
        bounds="window"
        dragHandleClassName="modal-handle"
        className="w-full h-full"
      >
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xl rounded-lg overflow-hidden border border-zinc-800">
          {/* Header */}
          <div className="modal-handle bg-zinc-900 p-1 flex justify-between items-center cursor-move border-b border-zinc-800 flex-shrink-0">
            <h2 id="bulk-edit-title" className="text-gray-300 text-base font-medium">
               Bulk Edit Exercise Data
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition duration-150 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              aria-label="Close modal"
              title="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 flex-grow overflow-y-auto space-y-4 bg-zinc-900 flex flex-col">

             {/* Scope Display */}
             <div className="text-sm text-gray-400">
                 Applying to: {targetSessions?.length || 0} Session(s)
             </div>

             {/* Container Filtering (Basic Checkbox List) */}
             {aggregatedData.uniqueContainerNames.length > 0 && (
                 <div className="border border-zinc-600 rounded-lg p-3">
                     <h3 className="text-sm font-semibold text-gray-300 mb-2">Select Exercise Types</h3>
                     <div className="max-h-40 overflow-y-auto space-y-1">
                         {aggregatedData.uniqueContainerNames.map(containerName => (
                             <label key={containerName} className="flex items-center text-gray-400 text-sm">
                                 <input
                                     type="checkbox"
                                     className="mr-2 leading-tight"
                                     checked={aggregatedData.containerSelection.has(containerName)}
                                     onChange={(e) => handleContainerSelectionChange(containerName, e.target.checked)}
                                 />
                                 <span>{containerName}</span>
                             </label>
                         ))}
                     </div>
                 </div>
             )}

             {/* Common Field Labels List */}
             <div className="flex-grow space-y-3">
                 {aggregatedData.commonFieldLabels.length > 0 ? (
                     aggregatedData.commonFieldLabels.map(fieldInfo => (
                         <div key={fieldInfo.label} className="border border-zinc-600 rounded-lg p-3 bg-neutral-800">
                             <div className="font-medium text-gray-100 text-sm mb-2 flex justify-between items-center">
                                 <span>{fieldInfo.label} <span className="text-xs text-gray-400">({fieldInfo.type})</span></span>
                                  {/* Optional: Display Total Count/Sum for numbers/arrays */}
                                 {fieldInfo.type === 'number' && fieldInfo.currentValue !== "Mixed Values" && fieldInfo.instances.length > 0 && (
                                     <span className="text-xs text-gray-400">Sum: {fieldInfo.instances.reduce((sum, inst) => sum + (typeof inst.value === 'number' ? inst.value : parseFloat(inst.value || '0')), 0)}</span>
                                 )}
                                 {fieldInfo.type === 'number' && fieldInfo.currentValue === "Mixed Values" && fieldInfo.instances.length > 0 && (
                                     <span className="text-xs text-gray-400">Sum: {fieldInfo.instances.reduce((sum, inst) => sum + (typeof inst.value === 'number' ? inst.value : parseFloat(inst.value || '0')), 0)}</span>
                                 )}
                                  {/* Array count could be added here */} {/* Example: count elements in arrays */}
                                  {(typeof fieldInfo.instances[0]?.value === 'string' && fieldInfo.instances[0]?.value.includes(',')) && (
                                       <span className="text-xs text-gray-400">Total Elements: {fieldInfo.instances.reduce((total, inst) => total + (typeof inst.value === 'string' ? inst.value.split(',').length : 0), 0)}</span>
                                  )}

                             </div>
                             <div className="text-gray-400 text-xs mb-2">
                                 Current Value: {String(fieldInfo.currentValue)}
                             </div>
                             <div className="flex items-center gap-2">
                                 <input
                                     type={fieldInfo.type === 'number' ? 'number' : 'text'}
                                     className="flex-grow p-1 text-sm text-gray-300 border border-zinc-600 rounded-md bg-zinc-700 focus:outline-none"
                                     value={pendingChanges[fieldInfo.label]?.value || ''}
                                     onChange={(e) => handlePendingChange(fieldInfo.label, e.target.value, pendingChanges[fieldInfo.label]?.operation || 'replace')}
                                     placeholder={fieldInfo.currentValue === "Mixed Values" ? "Enter value" : String(fieldInfo.currentValue)}
                                 />
                                  {/* Operation Select */}
                                 <select
                                      className="p-1 text-sm bg-zinc-700 text-gray-300 border border-zinc-600 rounded-md focus:outline-none"
                                      value={pendingChanges[fieldInfo.label]?.operation || 'replace'}
                                      onChange={(e) => handlePendingChange(fieldInfo.label, pendingChanges[fieldInfo.label]?.value || '', e.target.value)}
                                 >
                                      <option value="replace">Replace</option>
                                      {fieldInfo.type === 'number' && (
                                          <>
                                             <option value="add">Add (+)</option>
                                             <option value="subtract">Subtract (-)</option>
                                          </>
                                      )}
                                       {fieldInfo.type !== 'number' && (
                                          <option value="append">Append</option>
                                      )}
                                 </select>
                             </div>
                         </div>
                     ))
                 ) : (
                     <div className="text-center text-gray-400 p-8">
                         No common exercise fields found in the selected Session nodes. Select a node with Session node descendants that have exercises.
                     </div>
                 )}
             </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 bg-zinc-900 p-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={isSubmitting || !targetSessions || targetSessions.length === 0 || Object.keys(pendingChanges).length === 0}
              className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
            >
              {isSubmitting ? (
                <>Applying...</>
              ) : (
                <>Apply Changes</>
              )}
               <FiCheck size={14} />
            </button>
          </div>
        </div>
      </Rnd>
    </Modal>
  );
}

export default BulkExerciseEditModal; 