import React, { useState, useRef, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import useFlowStore from "../../../state/flowState";
import {
  createDefaultField,
  createDefaultContainer,
  generateId,
  generateFieldNameFromLabel,
} from "./helpers";
import { InlineEdit } from "./InlineEdit";
import { createValidationSchema } from "./validationSchema";
import Field  from "./Field";
import { FieldTypeButtons } from "./FieldsButtons";
import useTransientStore from "../../../state/transientState";
import CustomAutocompleteSelect from "./CustomAutocompleteSelect";
import { MdOutlineDataSaverOn } from "react-icons/md";
import { v4 as uuidv4 } from 'uuid';
import { getExerciseContainerDisplayName, createMangledContainerKey } from "../../../utils/exerciseUtils";
import { motion, AnimatePresence } from "motion/react";
import MultiListBox from "./MultiListBox";

// --- Accessibility Setup ---
if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

// --- ExerciseModal Component ---
function ExerciseModal({ isOpen, onClose }) {
  const [containers, setContainers] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedContainers, setSelectedContainers] = useState(new Set());
  const [isBulkEditVisible, setIsBulkEditVisible] = useState(false);
  const [bulkEditTargetFields, setBulkEditTargetFields] = useState(null);
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [bulkEditOperation, setBulkEditOperation] = useState('replace'); // 'replace' or 'append'
  
  // New state for node data tag filtering
  const [selectedNodeTags, setSelectedNodeTags] = useState(new Set());
  const [isTagFilterVisible, setIsTagFilterVisible] = useState(false);

  const { nodes, updateNodeExerciseData, exercises, saveExercise, deleteExercise } = useFlowStore();
  const {setToaster} = useTransientStore();
  const nodeSelected = useMemo(
    () => nodes.find((node) => node.selected),
    [nodes]
  );

  // Extract node data tags
  const nodeDataTags = useMemo(() => {
    if (!nodeSelected?.data?.tags) return [];
    
    // Parse node data tags (expecting semicolon-separated format like "#tag1;#tag2;")
    return nodeSelected.data.tags
      .split(';')
      .map(tag => tag.trim())
      .filter(tag => tag && tag.startsWith('#'))
      .map(tag => tag.substring(1)); // Remove # prefix
  }, [nodeSelected?.data?.tags]);

  // Filter exercises based on selected node tags
  const filteredExercises = useMemo(() => {
    if (selectedNodeTags.size === 0) {
      return exercises; // Show all exercises if no tags selected
    }
    
    // For now, this is a placeholder - in a real implementation, you would
    // filter exercises based on some criteria related to the selected tags
    // This could be based on exercise metadata, categories, etc.
    return exercises.filter(exercise => {
      // Placeholder filtering logic - this would need to be implemented
      // based on how exercises relate to node tags in your system
      return true; // For now, show all exercises
    });
  }, [exercises, selectedNodeTags]);

  const defaultModalConfig = {
    width: window.innerWidth, // Set to full width
    height: window.innerHeight, // Set to full height
    x: 0,
    y: 0,
  };

  // --- Effect to Reconstruct or Set Default Structure/Values on Open ---
  useEffect(() => {
    if (isOpen) {
        console.log(
            `--- Effect Start: Modal Open for Node ${nodeSelected?.id} ---`
        );

        // Existing exercise data will now potentially contain the full structure
        const existingExerciseData = nodeSelected?.data?.exercises || {};
        console.log(
            "Existing exercise data fetched:",
            JSON.stringify(existingExerciseData, null, 2)
        );

        let structureToSet = [];
        let valuesToSet = {};

        // Check if saved data exists and is in the expected new structure format
        if (
            existingExerciseData &&
            typeof existingExerciseData === "object" &&
            Object.keys(existingExerciseData).length > 0
        ) {
            console.log(
                "Saved data found. Reconstructing structure and values from it (using full data)."
            );

            Object.keys(existingExerciseData).forEach(mangledKey => {
                // Extract the display name from the mangled key
                const containerName = getExerciseContainerDisplayName(mangledKey);
                
                const savedContainerWrapper = existingExerciseData[mangledKey]; // Expected format: { fields: [...] }
                // Validate the saved container structure
                if (
                    !savedContainerWrapper ||
                    typeof savedContainerWrapper !== "object" ||
                    !Array.isArray(savedContainerWrapper.fields)
                ) {
                    console.warn(
                        `Skipping invalid or old-format data found for container name '${containerName}'`
                    );
                    return; // Skip this container if data is invalid or not in the new format
                }

                const savedFields = savedContainerWrapper.fields;
                // Generate a new container ID for the state structure
                const newContainerId = generateId();
                const reconstructedFields = [];
                const containerValues = {};

                console.log(
                    `  Reconstructing container: Name='${containerName}', Temp ID=${newContainerId}`
                );

                savedFields.forEach(savedField => {
                    // Directly use properties from savedField as they contain the definition
                    if (
                        !savedField ||
                        typeof savedField !== "object" ||
                        !savedField.name ||
                        savedField.value === undefined // Ensure essential properties exist
                    ) {
                         console.warn(`Skipping invalid field data in container '${containerName}':`, savedField);
                         return;
                    }

                    // Generate a new field ID for the state structure for React keys
                    const newFieldId = generateId();
                    const fieldName = savedField.name;
                    const fieldValue = savedField.value; // Use the saved value
                    const fieldType = savedField.type || "text"; // Use saved type, default
                    const fieldLabel = savedField.label || fieldName; // Use saved label, default to name
                    const isRequired = savedField.required ?? false; // Use saved required, default
                    const fieldSubtype = savedField.subtype ?? ""; // Use saved subtype, default

                    console.log(
                        `    -> Reconstructing field: Name='${fieldName}', Temp ID=${newFieldId}, Type='${fieldType}', Label='${fieldLabel}', Required=${isRequired}, Subtype='${fieldSubtype}', Value='${fieldValue}'`
                    );

                    reconstructedFields.push({
                        id: newFieldId, // Use new ID for state structure
                        originalSavedId: savedField.id, // Optionally keep the original saved ID if needed
                        type: fieldType,
                        label: fieldLabel,
                        name: fieldName,
                        required: isRequired,
                        subtype: fieldSubtype,
                    });
                    // Store the value using the field name under the new container ID
                    containerValues[fieldName] = fieldValue;
                });

                // Only add the container if it has valid fields
                if(reconstructedFields.length > 0) {
                    structureToSet.push({
                        id: newContainerId, // Use new ID for state structure
                        name: containerName,
                        fields: reconstructedFields,
                    });
                    valuesToSet[newContainerId] = containerValues; // Map values by the new container ID
                }
            });
             // If after trying to load saved data, no valid structure is found, fall back to default
            if (structureToSet.length === 0) {
                 console.log("No valid saved data structure found after processing. Using default structure.");
                 structureToSet = [createDefaultContainer()]; // Use helper for default
                 structureToSet.forEach((container) => {
                     valuesToSet[container.id] = {};
                     container.fields.forEach((field) => {
                         valuesToSet[container.id][field.name] = "";
                     });
                 });
            }

        } else {
            console.log(
                "No saved data found or data is empty. Using default structure and empty values."
            );
            structureToSet = [createDefaultContainer()]; // Use helper for default
            structureToSet.forEach((container) => {
                valuesToSet[container.id] = {};
                container.fields.forEach((field) => {
                    valuesToSet[container.id][field.name] = "";
                });
            });
        }


        console.log(
            "Setting containers state to:",
            JSON.stringify(structureToSet, null, 2)
        );
        setContainers(structureToSet);

        console.log(
            "Setting formValues state to:",
            JSON.stringify(valuesToSet, null, 2)
        );
        setFormValues(valuesToSet);

        console.log("Resetting errors and submission state.");
        setErrors({});
        setIsSubmitting(false);
        setSuccessMessage("");
        console.log("--- Effect End ---");
    }
}, [isOpen, nodeSelected?.id]);

  // --- Input Change Handler ---
  const handleInputChange = (containerId, fieldName, value) => {
    setFormValues((prev) => {
      const updatedContainerValues = {
        ...(prev[containerId] || {}),
        [fieldName]: value,
      };
      return { ...prev, [containerId]: updatedContainerValues };
    });

    if (errors[containerId]?.[fieldName]) {
      setErrors((prev) => {
        const newContainerErrors = { ...prev[containerId] };
        delete newContainerErrors[fieldName];
        if (Object.keys(newContainerErrors).length === 0) {
          const { [containerId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [containerId]: newContainerErrors };
      });
    }
  };

  // --- Structure Update Functions (Names/Labels) ---
  const updateContainerName = (containerId, newName) => {
    setContainers((currentContainers) =>
      currentContainers.map((c) =>
        c.id === containerId ? { ...c, name: newName } : c
      )
    );
  };

  // UPDATED: Handles Label and Name changes for fields
  const updateFieldProperties = (containerId, fieldId, newLabel) => {
    let oldFieldName = null;
    let newFieldName = null;
    let valueToTransfer = undefined;

    // Update containers state first
    setContainers((currentContainers) =>
      currentContainers.map((container) => {
        if (container.id === containerId) {
          return {
            ...container,
            fields: container.fields.map((field) => {
              if (field.id === fieldId) {
                oldFieldName = field.name;
                newFieldName = generateFieldNameFromLabel(newLabel, field.id); // Use helper
                console.log(
                  `Updating field label & name: ID=${fieldId}, Old Name='${oldFieldName}', New Label='${newLabel}', New Name='${newFieldName}'`
                );
                return { ...field, label: newLabel, name: newFieldName };
              }
              return field;
            }),
          };
        }
        return container;
      })
    );

    // Update formValues state based on the name change
    if (oldFieldName && newFieldName && oldFieldName !== newFieldName) {
      setFormValues((currentValues) => {
        const containerVals = currentValues[containerId] || {};
        valueToTransfer = containerVals[oldFieldName];
        const { [oldFieldName]: _, ...restFields } = containerVals;
        const updatedContainerValues = {
          ...restFields,
          [newFieldName]: valueToTransfer ?? "",
        };
        console.log(
          `Updating formValues: ContainerID=${containerId}, Removing key='${oldFieldName}', Adding key='${newFieldName}', Value='${
            valueToTransfer ?? ""
          }'`
        );
        return { ...currentValues, [containerId]: updatedContainerValues };
      });

      // Update errors state
      setErrors((currentErrors) => {
        const containerErrs = currentErrors[containerId] || {};
        if (containerErrs[oldFieldName]) {
          const { [oldFieldName]: _, ...restErrors } = containerErrs;
          console.log(
            `Updating errors: ContainerID=${containerId}, Removing error for key='${oldFieldName}'`
          );
          if (Object.keys(restErrors).length === 0) {
            const { [containerId]: __, ...restContainerErrors } = currentErrors;
            return restContainerErrors;
          }
          return { ...currentErrors, [containerId]: restErrors };
        }
        return currentErrors;
      });
    } else {
      console.log(
        "Field name did not change or update failed. No formValues/errors update needed for name change."
      );
    }
  };

  // --- Container/Field Actions ---
  const addContainer = () => {
    const newContainer = createDefaultContainer(undefined, containers);
    setContainers((currentContainers) => [...currentContainers, newContainer]);

    const newContainerValues = {};
    newContainer.fields.forEach((field) => {
      newContainerValues[field.name] = "";
    });
    setFormValues((prev) => ({
      ...prev,
      [newContainer.id]: newContainerValues,
    }));

    setErrors((prev) => {
      const { [newContainer.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const removeContainer = (containerIdToRemove) => {

    setContainers((currentContainers) =>
      currentContainers.filter((c) => c.id !== containerIdToRemove)
    );
    setFormValues((prev) => {
      const { [containerIdToRemove]: _, ...rest } = prev;
      return rest;
    });
    setErrors((prev) => {
      const { [containerIdToRemove]: _, ...rest } = prev;
      return rest;
    });
  };

  const addField = (containerId, type, subtype, label) => {
    let newField = null;
    setContainers((currentContainers) =>
      currentContainers.map((container) => {
        if (container.id === containerId) {
          newField = createDefaultField(type, label, subtype); // Use helper
          return { ...container, fields: [...container.fields, newField] };
        }
        return container;
      })
    );

    if (newField) {
      handleInputChange(containerId, newField.name, ""); // Set default value
    }
  };

  const removeField = (containerId, fieldIdToRemove) => {
    let fieldNameToRemove = null;
    setContainers((currentContainers) =>
      currentContainers.map((container) => {
        if (container.id === containerId) {
          const fieldToRemove = container.fields.find(
            (f) => f.id === fieldIdToRemove
          );
          if (fieldToRemove) fieldNameToRemove = fieldToRemove.name;
          return {
            ...container,
            fields: container.fields.filter((f) => f.id !== fieldIdToRemove),
          };
        }
        return container;
      })
    );

    if (fieldNameToRemove) {
      setFormValues((prev) => {
        const containerVals = prev[containerId] || {};
        const { [fieldNameToRemove]: _, ...restFields } = containerVals;
        return { ...prev, [containerId]: restFields };
      });
      setErrors((prev) => {
        const containerErrs = prev[containerId] || {};
        const { [fieldNameToRemove]: _, ...restFieldErrors } = containerErrs;
        if (Object.keys(restFieldErrors).length === 0) {
          const { [containerId]: __, ...restContainerErrors } = prev;
          return restContainerErrors;
        }
        return { ...prev, [containerId]: restFieldErrors };
      });
    }
  };

  const handleSave = (c) => {
    if (c.name && c.name !== null && c.name !== "") {
      // Create a mangled key for saving the exercise template
      const containerId = uuidv4();
      const mangledKey = createMangledContainerKey(c.name, containerId);
      
      // Create a copy of the container with the mangled key
      const containerToSave = {
        ...c,
        originalName: c.name, // Store the original name for display
        name: mangledKey // Use the mangled key as the name for storage
      };
      
      saveExercise(containerToSave);
      setToaster({
        show: true,
        message: "Exercise saved successfully",
        type: "success",
      }) //The container name is saved, not the exercise name. The container name is a broad descriptor of the specific template or variant of the exercise such as a decorator. The actual name of the exercise is contained in the form values
    }
  };

  const handleSelection = (selectedOption) => {
    setContainers((currentContainers) => [...currentContainers, selectedOption]); // Remember to make sure that the id of the container has to be changed
    
    setFormValues((prev) => ({
      ...prev,
      [selectedOption.id]: selectedOption.fields.reduce((acc, field) => {
        acc[field.name] = "";
        return acc;
      }, {})
    }));
  };

  const handleContainerSelect = (containerId, isChecked) => {
    setSelectedContainers(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(containerId);
      } else {
        newSelected.delete(containerId);
      }
      return newSelected;
    });
  };

  // --- Bulk Edit Logic ---
  const handleBulkApply = () => {
    // Only proceed if a target field label is selected
    if (!bulkEditTargetFields) {
      // Optionally show an error or notification
      console.warn("No target field label selected for bulk assignment.");
      return;
    }

    const targetContainerIds = selectedContainers.size > 0
      ? Array.from(selectedContainers)
      : containers.map(c => c.id);

    const updatedFormValues = { ...formValues };

    targetContainerIds.forEach(containerId => {
      const container = containers.find(c => c.id === containerId);
      if (container) {
        container.fields.forEach(field => {
           // Check if the field's label matches the single selected target field
          if (field.label === bulkEditTargetFields) {
            // Ensure the nested object exists before setting the value
            if (!updatedFormValues[containerId]) {
              updatedFormValues[containerId] = {};
            }

            // Apply value based on the selected operation
            if (bulkEditOperation === 'replace') {
              updatedFormValues[containerId][field.name] = bulkEditValue; // Replace
            } else if (bulkEditOperation === 'append') {
              // Append: Convert current value to string and append with a space
              const currentValue = updatedFormValues[containerId][field.name];
              const currentValueString = currentValue !== undefined && currentValue !== null ? String(currentValue) : '';
              const valueToAppend = bulkEditValue !== undefined && bulkEditValue !== null ? String(bulkEditValue) : '';
              // Add a separator if both current value and value to append are non-empty
              const separator = (currentValueString !== '' && valueToAppend !== '') ? ' ' : '';
              updatedFormValues[containerId][field.name] = currentValueString + separator + valueToAppend;
            }

          }
        });
      }
    });

    setFormValues(updatedFormValues);
    // Optionally reset and hide bulk edit after applying
    setBulkEditTargetFields(null); // Reset to null
    setBulkEditValue("");
    setIsBulkEditVisible(false);
  };

  // Calculate unique field labels for the bulk edit dropdown options
  const bulkEditFieldOptions = useMemo(() => {
    const targetContainers = selectedContainers.size > 0
      ? containers.filter(c => selectedContainers.has(c.id))
      : containers;

    const uniqueFieldLabels = new Set();
    targetContainers.forEach(container => {
      container.fields.forEach(field => {
        if (field.label && field.label.trim() !== '') { // Only add non-empty labels
           uniqueFieldLabels.add(field.label);
        }
      });
    });
    return Array.from(uniqueFieldLabels);
  }, [containers, selectedContainers]);

  // --- Submit Handler ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nodeSelected) {
        setErrors({ form: "Error: No node selected to save data for." });
        return;
    }

    // createValidationSchema needs to work with the current `containers` state structure
    const validationSchema = createValidationSchema(containers);
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrors({});

    try {
        // Validate formValues which is { containerId: { fieldName: fieldValue, ... } }
        await validationSchema.validate(formValues, { abortEarly: false });

        // Validation succeeded — build output data in the new structure
        const outputData = {};

        containers.forEach(container => {
            // Generate a unique ID for this container
            const containerId = uuidv4();
            // Create a mangled key that combines the container name with the UUID
            const mangledKey = createMangledContainerKey(container.name, containerId);
            
            // Get the values for this specific container from the formValues state
            const containerValues = formValues[container.id] || {};
            const fieldsToSave = [];

            container.fields.forEach(field => {
                // Get the value for this specific field using its name from containerValues
                const fieldValue = containerValues.hasOwnProperty(field.name) ? containerValues[field.name] : "";

                // Push the full field definition and its value to the array
                fieldsToSave.push({
                    id: field.id, // Save the field's ID from the current state
                    name: field.name,
                    value: fieldValue, // Include the value here
                    type: field.type,
                    label: field.label,
                    required: field.required,
                    subtype: field.subtype,
                });
            });

            // Store the array of fields under the mangled key in the output data
            if (fieldsToSave.length > 0) {
                outputData[mangledKey] = { fields: fieldsToSave };
            }
        });

        console.log("Output data (full structure):", outputData);

        // Assuming updateNodeExerciseData can handle this new structure
        await updateNodeExerciseData(nodeSelected.id, outputData);
        setToaster({
            type: "success",
            message: "Exercise data saved successfully.",
            show: true,
        })
        setIsSubmitting(false);
        onClose();

    } catch (validationErrors) {
        if (validationErrors.inner && validationErrors.inner.length > 0) {
            const formattedErrors = {};
            // The validation errors are likely keyed by containerId.fieldName
            validationErrors.inner.forEach((err) => {
              // The path might look like containerId.fieldName based on the schema
              const [containerId, fieldName] = err.path.split(".");
               if (containerId && fieldName) { // Basic check that path was split as expected
                if (!formattedErrors[containerId]) formattedErrors[containerId] = {};
                formattedErrors[containerId][fieldName] = err.message;
               } else {
                   console.warn("Unexpected validation error path format:", err.path, err.message);
                   // Handle unexpected paths, maybe put them under a general form error
                   formattedErrors.form = formattedErrors.form ? `${formattedErrors.form}\n${err.message}` : err.message;
               }
            });
            console.log("just checking the formatted errors", formattedErrors);
            setErrors(formattedErrors);
        } else {
             // Handle general validation errors not tied to specific fields
            setErrors({ form: validationErrors.message || "Failed to validate form data." });
        }
        setIsSubmitting(false);
    }
};

  // --- Render ---
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      aria={{
        labelledby: "modular-form-title",
        describedby: "modular-form-description",
      }}
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
      contentLabel="Exercise Data Editor"
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={950}
        minHeight={950}
        bounds="window"
        dragHandleClassName="modal-handle"
        className="w-full h-full"
      >
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xl rounded-lg overflow-hidden border border-zinc-800">
          {/* Header */}
          <div className="modal-handle bg-zinc-900 p-1 flex justify-between items-center cursor-move border-b border-zinc-800 flex-shrink-0">
            <h2
              id="modular-form-title"
              className="text-gray-300 text-base font-medium"
            >
              Session editor
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
        {/*Subheader*/}
        <div className="bg-zinc-900 flex flex-row items-center gap-4 p-2">
          <CustomAutocompleteSelect
            label="Select exercise"
            options={filteredExercises}
            onSelect={handleSelection}
            onDelete={deleteExercise}
          />
          
          {/* Node Data Tag Filter */}
          {nodeDataTags.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTagFilterVisible(!isTagFilterVisible)}
                className="px-3 py-1 border border-dashed rounded-md border-neutral-600 text-neutral-400 bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-200 text-sm font-medium transition-all duration-200"
              >
                Filter by Node Tags ({nodeDataTags.length})
              </button>
              
              {isTagFilterVisible && (
                <div className="flex flex-wrap gap-1 max-w-md">
                  {nodeDataTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedNodeTags(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(tag)) {
                            newSet.delete(tag);
                          } else {
                            newSet.add(tag);
                          }
                          return newSet;
                        });
                      }}
                      className={`px-2 py-1 text-xs rounded-md transition-colors duration-200 ${
                        selectedNodeTags.has(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {selectedNodeTags.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedNodeTags(new Set())}
                      className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
           {/* Bulk Edit Toggle Button */}
          <button
            type="button"
            onClick={() => setIsBulkEditVisible(!isBulkEditVisible)}
            className="px-3 py-1 border border-dashed rounded-md border-neutral-900 text-neutral-400 bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-200 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isBulkEditVisible ? 'Hide Bulk Assign' : 'Bulk Assign'}
          </button>

        </div>
          
        {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="p-4 flex-grow overflow-y-auto space-y-4 bg-zinc-900 flex flex-col"
          >
            {/* Bulk Edit Form */}
            <AnimatePresence>
              {isBulkEditVisible && (
                <motion.div
                  key="bulk-edit-form"
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
                     <label id="bulk-edit-fields-label" className="text-sm font-medium text-gray-300">Select Field Labels:</label>
                     <MultiListBox
                       options={bulkEditFieldOptions}
                       value={bulkEditTargetFields}
                       onChange={setBulkEditTargetFields}
                       size={5} // Specify the number of visible options
                     />

                     <label htmlFor="bulk-edit-value" className="text-sm font-medium text-gray-300 mt-2">Value to Assign:</label>
                     <input
                       id="bulk-edit-value"
                       type="text"
                       className="block w-full p-2 text-sm text-gray-300 border border-zinc-600 rounded-lg bg-zinc-700 focus:outline-none"
                       value={bulkEditValue}
                       onChange={(e) => setBulkEditValue(e.target.value)}
                       placeholder="Enter value"
                     />

                     {/* Operation Buttons */}
                     <div className="flex gap-2 mt-2">
                       <button
                         type="button"
                         onClick={() => setBulkEditOperation('replace')}
                         className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                           ${bulkEditOperation === 'replace' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                         `}
                       >
                         Replace
                       </button>
                       <button
                         type="button"
                         onClick={() => setBulkEditOperation('append')}
                         className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200
                           ${bulkEditOperation === 'append' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                         `}
                       >
                         Append
                       </button>
                     </div>

                     <button
                       type="button"
                       onClick={handleBulkApply}
                       disabled={bulkEditTargetFields === null || bulkEditValue === ''}
                       className="mt-3 px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
                     >
                       Apply
                     </button>
                   </div>
                  ) : (
                    <p className="text-sm text-gray-400">No field labels available in the target containers for bulk editing.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-800/50 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-200 rounded-md text-sm">
                {successMessage}
              </div>
            )}
            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-800/50 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm">
                {errors.form}
              </div>
            )}

            <div className="flex-grow space-y-4">
              {" "}
              {/* Scrollable Content Area */}
              
              {/* Containers */}
              <div className="space-y-4">
                {containers.map((container) => (
                  <div
                    key={container.id}
                    className="pb-2 px-2 border border-gray-600 rounded-lg bg-neutral-800 space-y-2 relative group"
                  >
                    {/* Container Header */}
                    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600/50">
                      <input
                        type="checkbox"
                        className="mr-2 leading-tight"
                        checked={selectedContainers.has(container.id)}
                        onChange={(e) => handleContainerSelect(container.id, e.target.checked)}
                      />
                      <div className="flex-grow mr-2">
                        {/* Pass container.name for InlineEdit value */}
                        <InlineEdit
                          value={container.name}
                          onSave={(newName) =>
                            updateContainerName(container.id, newName)
                          }
                          inputClassName="text-md font-semibold w-full"
                          displayClassName="text-md font-semibold text-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <>
                      <button
                        type="button"
                        onClick={() => handleSave(container)}
                        className="p-1.5 opacity-60 hover:opacity-100 transition-opacity text-green-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex-shrink-0"
                        aria-label={`Save container ${container.name}`}
                        title={`Save ${container.name}`}
                      >
                        <MdOutlineDataSaverOn size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeContainer(container.id)}
                        className="p-1.5 opacity-60 hover:opacity-100 transition-opacity text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex-shrink-0"
                        aria-label={`Delete Container ${container.name}`}
                        title={`Delete ${container.name}`}
                      >
                        <FiTrash2 size={16} />
                      </button>
                      </>
                    </div>
                    {/* Fields */}
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
                    </div>{" "}
                    {/* End Fields */}
                    {/* Add Field Buttons */}
                    <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600/50 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium mr-2 text-gray-600 dark:text-gray-400">
                        Add Field:
                      </span>
                      <FieldTypeButtons containerId={container.id} onAddField={addField} />
                    </div>
                  </div> // End Container Div
                ))}
              </div>{" "}
              {/* End Container Management */}
              {/* Add Container Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={addContainer}
                  className="w-full px-4 py-2 border border-dashed rounded-md border-neutral-900 text-neutral-400 bg-neutral-800 hover:bg-neutral-700 hover:text-neutral-200 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span> Add New Exercise
                </button>
              </div>

            </div>{" "}
            {/* End Scrollable Content Area */}
            {/* Form Actions (Fixed Footer Area) */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-2 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !nodeSelected}
                className="px-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded-md  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-white rounded-full"
                      role="status"
                      aria-label="loading"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck size={18} /> Save Data
                  </>
                )}
              </button>
            </div>
          </form>{" "}
          {/* End Form */}
        </div>{" "}
        {/* End Modal Content */}
      </Rnd>
    </Modal>
  );
}

export default ExerciseModal;
