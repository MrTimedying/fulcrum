import React, { useState, useRef, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { FiEdit3, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import useFlowStore from "../../state/flowState";

// --- Accessibility Setup ---
if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

// --- Helpers & Constants ---
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultField = (type = "text", existingFields = []) => {
  const newId = generateId();
  const fieldCountOfType = existingFields.filter((f) => f.type === type).length;
  const label = `New ${type.charAt(0).toUpperCase() + type.slice(1)} ${
    fieldCountOfType + 1
  }`;
  const name = `${type}_${newId.substring(3, 7)}`;
  return {
    id: newId,
    type,
    label,
    name,
    required: type === "text",
    ...(type === "select" ? { options: ["Option 1", "Option 2"] } : {}),
  };
};

const createDefaultContainer = (
  name = "Test Container 1",
  existingContainers = []
) => {
  const newContainerId = generateId();
  const potentialName =
    name === "Test Container 1" && existingContainers.length > 0
      ? `Test Container ${existingContainers.length + 1}`
      : name;

  return {
    id: newContainerId,
    name: potentialName,
    fields: [createDefaultField("text"), createDefaultField("number")],
  };
};

// Helper to generate a field name from a label (newly added)
const generateFieldNameFromLabel = (label, fieldId) => {
  const baseName = label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  const idPart = fieldId.substring(fieldId.length - 4);
  const finalName = baseName
    ? `${baseName}_${idPart}`.replace(/^_+|_+$/g, "")
    : `field_${idPart}`;
  return finalName || `unnamed_field_${idPart}`;
};

// --- InlineEdit Component (Unchanged) ---
function InlineEdit({ value, onSave, inputClassName, displayClassName }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSave = () => {
    if (currentValue.trim() === "") {
      setCurrentValue(value);
      setIsEditing(false);
    } else if (currentValue !== value) {
      onSave(currentValue);
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleSave();
    else if (event.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleSave} // Save on blur
          onKeyDown={handleKeyDown}
          className={`p-1 border border-blue-400 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputClassName}`}
        />
      </div>
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded inline-flex items-center gap-1 group ${displayClassName}`}
      title="Click to edit"
    >
      {value}
      <FiEdit3
        size={12}
        className="opacity-0 group-hover:opacity-50 transition-opacity"
      />
    </span>
  );
}

// --- TestModal Component ---
function TestModal({ isOpen, onClose }) {
  const [containers, setContainers] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { nodes, updateNodeTestData } = useFlowStore();
  const nodeSelected = useMemo(
    () => nodes.find((node) => node.selected),
    [nodes]
  );

  const defaultModalConfig = {
    width: 750,
    height: 650,
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 375 : 80,
    y: typeof window !== "undefined" ? window.innerHeight / 2 - 325 : 40,
  };

  // --- Effect to Reconstruct or Set Default Structure/Values on Open ---
  useEffect(() => {
    if (isOpen) {
      console.log(
        `--- Effect Start: Modal Open for Node ${nodeSelected?.id} ---`
      );

      const existingTestData = nodeSelected?.data?.tests || {};
      console.log(
        "Existing test data fetched:",
        JSON.stringify(existingTestData, null, 2)
      );

      let structureToSet = [];
      let valuesToSet = {};

      if (
        existingTestData &&
        typeof existingTestData === "object" &&
        Object.keys(existingTestData).length > 0
      ) {
        console.log(
          "Saved data found. Reconstructing structure and values from it."
        );

        Object.keys(existingTestData).forEach((containerName) => {
          const savedContainerData = existingTestData[containerName];
          if (!savedContainerData || typeof savedContainerData !== "object") {
            console.warn(
              `Skipping invalid data found for container name '${containerName}'`
            );
            return;
          }

          const newContainerId = generateId();
          const reconstructedFields = [];
          const containerValues = {};

          console.log(
            `  Reconstructing container: Name='${containerName}', Temp ID=${newContainerId}`
          );

          Object.keys(savedContainerData).forEach((fieldName) => {
            const savedValue = savedContainerData[fieldName];
            const newFieldId = generateId();

            let fieldType = "text";
            if (fieldName.startsWith("number_")) fieldType = "number";
            else if (fieldName.startsWith("textarea_")) fieldType = "textarea";
            else if (fieldName.startsWith("select_")) fieldType = "select";
            // Try to infer from saved name if label isn't stored
            else if (/^\d+(\.\d+)?$/.test(String(savedValue)))
              fieldType = "number"; // Infer number type if value looks like a number

            let fieldLabel = fieldName
              .replace(/_([a-z0-9]+)$/i, "")
              .replace(/_/g, " ");
            fieldLabel =
              fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1);

            const isRequired = false; // Defaulting required to false
            const options =
              fieldType === "select" ? ["Option 1", "Option 2"] : undefined;

            console.log(
              `    -> Reconstructing field: Name='${fieldName}', Temp ID=${newFieldId}, Inferred Type='${fieldType}', Label='${fieldLabel}', Value='${savedValue}'`
            );

            reconstructedFields.push({
              id: newFieldId,
              type: fieldType,
              label: fieldLabel,
              name: fieldName,
              required: isRequired,
              ...(options ? { options } : {}),
            });
            containerValues[fieldName] = savedValue ?? "";
          });

          structureToSet.push({
            id: newContainerId,
            name: containerName,
            fields: reconstructedFields,
          });
          valuesToSet[newContainerId] = containerValues;
        });
      } else {
        console.log(
          "No saved data found. Using default structure and empty values."
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
  }, [isOpen, nodeSelected?.id]); // Dependencies

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

  // --- Validation Logic ---
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    containers.forEach((container) => {
      const containerValues = formValues[container.id] || {};
      const containerErrors = {};

      container.fields.forEach((field) => {
        const value = containerValues[field.name];
        const stringValue = String(value ?? "").trim();

        if (field.required && stringValue === "") {
          containerErrors[field.name] = `${field.label} is required.`;
          isValid = false;
        } else if (
          field.type === "number" &&
          stringValue !== "" &&
          isNaN(Number(value))
        ) {
          containerErrors[field.name] = `${field.label} must be a number.`;
          isValid = false;
        }
      });

      if (Object.keys(containerErrors).length > 0) {
        newErrors[container.id] = containerErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
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
    const containerToRemove = containers.find(
      (c) => c.id === containerIdToRemove
    );
    if (
      containerToRemove &&
      !window.confirm(
        `Are you sure you want to delete the container "${containerToRemove.name}"? This cannot be undone.`
      )
    ) {
      return;
    }
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

  const addField = (containerId, type) => {
    let newField = null;
    setContainers((currentContainers) =>
      currentContainers.map((container) => {
        if (container.id === containerId) {
          newField = createDefaultField(type, container.fields); // Use helper
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

  // --- Submit Handler ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nodeSelected) {
      console.error("No node selected.");
      setErrors({ form: "Error: No node selected to save data for." });
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      console.log("Form validation failed:", errors);
      setErrors((prev) => ({
        ...prev,
        form: "Please fix the errors before saving.",
      }));
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrors((prev) => {
      delete prev.form;
      return prev;
    }); 

    const outputData = {};
    containers.forEach((container) => {
      const containerName = container.name;
      const containerValues = formValues[container.id] || {};
      const valuesToSave = {};
      container.fields.forEach((field) => {
        if (containerValues.hasOwnProperty(field.name)) {
          valuesToSave[field.name] = containerValues[field.name];
        }
      });

      if (Object.keys(valuesToSave).length > 0) {
        outputData[containerName] = valuesToSave;
      } else {
        console.log(
          `Skipping container '${containerName}' from output as it has no values.`
        );
      }
    });

    console.log("Submitting Data:", JSON.stringify(outputData, null, 2));

    try {
      await updateNodeTestData(nodeSelected.id, outputData);
      setSuccessMessage("Test data saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Failed to save test data:", error);
      setErrors({ form: "Failed to save data. Please try again." });
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
      contentLabel="Test Data Editor"
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={550}
        minHeight={450}
        bounds="window"
        dragHandleClassName="modal-handle"
        className="flex"
      >
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="modal-handle bg-gray-100 dark:bg-gray-700 p-3 flex justify-between items-center cursor-move border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
            <h2 id="modular-form-title" className="text-lg font-semibold">
              {nodeSelected
                ? `Edit Test Data for ${nodeSelected.data.label || "Node"}`
                : "Test Data Editor"}
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
          <form
            onSubmit={handleSubmit}
            className="p-4 flex-grow overflow-y-auto space-y-4 flex flex-col"
          >
            <div className="flex-grow space-y-4">
              {" "}
              {/* Scrollable Content Area */}
              <p
                id="modular-form-description"
                className="text-sm text-gray-600 dark:text-gray-300 mb-4"
              >
                Manage test data containers and their fields. Click names/labels
                to edit.
              </p>
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
              {/* Containers */}
              <div className="space-y-4">
                {containers.map((container) => (
                  <div
                    key={container.id}
                    className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-4 relative group"
                  >
                    {/* Container Header */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-600/50">
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
                      <button
                        type="button"
                        onClick={() => removeContainer(container.id)}
                        className="p-1.5 opacity-60 hover:opacity-100 transition-opacity text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex-shrink-0"
                        aria-label={`Delete Container ${container.name}`}
                        title={`Delete ${container.name}`}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    {/* Fields */}
                    <div className="space-y-3">
                      {container.fields.map((field) => {
                        const fieldIdPath = `${container.id}-${field.id}`; // Unique ID for label htmlFor
                        // Use field.name to access value and error
                        const fieldValue =
                          formValues[container.id]?.[field.name] ?? "";
                        const fieldError = errors[container.id]?.[field.name];
                        const inputClasses =
                          "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm";
                        const errorClasses =
                          " border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400";

                        return (
                          <div
                            key={field.id}
                            className="p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 relative group/field space-y-2"
                          >
                            {/* Field Header */}
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-grow flex items-center gap-2">
                                <label
                                  htmlFor={fieldIdPath}
                                  className="flex items-center gap-1"
                                >
                                  {/* InlineEdit for Label - calls updateFieldProperties */}
                                  <InlineEdit
                                    value={field.label}
                                    onSave={(newLabel) =>
                                      updateFieldProperties(
                                        container.id,
                                        field.id,
                                        newLabel
                                      )
                                    }
                                    inputClassName="text-sm font-medium"
                                    displayClassName="text-sm font-medium text-gray-900 dark:text-white"
                                  />
                                  {field.required && (
                                    <span
                                      className="text-red-500 text-xs flex-shrink-0"
                                      title="Required"
                                    >
                                      *
                                    </span>
                                  )}
                                </label>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  removeField(container.id, field.id)
                                }
                                className="p-1 opacity-50 group-hover/field:opacity-100 transition-opacity text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full flex-shrink-0"
                                aria-label={`Delete Field ${field.label}`}
                                title={`Delete ${field.label}`}
                              >
                                <FiX size={14} />
                              </button>
                            </div>

                            {/* Field Input - Use field.name for name attribute and value lookup */}
                            {field.type === "text" && (
                              <input
                                id={fieldIdPath}
                                name={field.name}
                                type="text"
                                value={fieldValue}
                                onChange={(e) =>
                                  handleInputChange(
                                    container.id,
                                    field.name,
                                    e.target.value
                                  )
                                }
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                className={`${inputClasses} ${
                                  fieldError ? errorClasses : ""
                                }`}
                              />
                            )}
                            {field.type === "number" && (
                              <input
                                id={fieldIdPath}
                                name={field.name}
                                type="number"
                                value={fieldValue}
                                onChange={(e) =>
                                  handleInputChange(
                                    container.id,
                                    field.name,
                                    e.target.value
                                  )
                                }
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                className={`${inputClasses} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                  fieldError ? errorClasses : ""
                                }`}
                              />
                            )}
                            {field.type === "textarea" && (
                              <textarea
                                id={fieldIdPath}
                                name={field.name}
                                value={fieldValue}
                                onChange={(e) =>
                                  handleInputChange(
                                    container.id,
                                    field.name,
                                    e.target.value
                                  )
                                }
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                className={`${inputClasses} min-h-[60px] ${
                                  fieldError ? errorClasses : ""
                                }`}
                              />
                            )}
                            {field.type === "select" && (
                              <select
                                id={fieldIdPath}
                                name={field.name}
                                value={fieldValue}
                                onChange={(e) =>
                                  handleInputChange(
                                    container.id,
                                    field.name,
                                    e.target.value
                                  )
                                }
                                className={`${inputClasses} ${
                                  fieldError ? errorClasses : ""
                                }`}
                              >
                                <option
                                  value=""
                                  disabled
                                >{`Select ${field.label.toLowerCase()}...`}</option>
                                {Array.isArray(field.options) &&
                                  field.options.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                                  ))}
                              </select>
                            )}

                            {/* Error Message */}
                            {fieldError && (
                              <div className="text-red-500 text-xs mt-1">
                                {fieldError}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>{" "}
                    {/* End Fields */}
                    {/* Add Field Buttons */}
                    <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600/50 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium mr-2 text-gray-600 dark:text-gray-400">
                        Add Field:
                      </span>
                      {["text", "number", "textarea", "select"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => addField(container.id, type)}
                          className="px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-xs transition-all duration-200"
                        >
                          {" "}
                          + {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                        </button>
                      ))}
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
                  className="w-full px-4 py-2 border border-dashed border-blue-400 dark:border-blue-600 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span> Add New Container
                </button>
              </div>
            </div>{" "}
            {/* End Scrollable Content Area */}
            {/* Form Actions (Fixed Footer Area) */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !nodeSelected}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
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

export default TestModal;
