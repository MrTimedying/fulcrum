// helpers.js

// Function to generate a unique ID for fields and containers
export const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

// Function to create a default field object with initial values based on the specified type
export const createDefaultField = (type = "text", label = "", subtype = "") => {
  const newId = generateId();
  const name = `${type}_${newId.substring(3, 7)}`;

  return {
    id: newId,
    type,
    label,
    name,
    required: type === "text",
    subtype,
  };
};

// Function to create a default container object
export const createDefaultContainer = (name = "Exercise", existingContainers = []) => {
  const newContainerId = generateId();
  const potentialName =
    name === "Exercise" && existingContainers.length > 0
      ? `Exercise ${existingContainers.length + 1}`
      : name;

  return {
    id: newContainerId,
    name: potentialName,
    fields: [createDefaultField("text","Name input","name"), createDefaultField("number","Sets Number","sets")],
  };
};

// Function to generate a field name from a label, appending the field ID for uniqueness
export const generateFieldNameFromLabel = (label, fieldId) => {
  const baseName = label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

  const idPart = fieldId.substring(fieldId.length - 4);
  const finalName = baseName
    ? `${baseName}_${idPart}`.replace(/^_+|_+$/g, "") // Ensure no trailing or leading underscores
    : `field_${idPart}`;

  return finalName || `unnamed_field_${idPart}`;
};

