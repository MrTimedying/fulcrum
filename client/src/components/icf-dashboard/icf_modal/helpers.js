// helpers.js for ICFSetsModal

// Generate a unique ID for elements
export const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

// Create a default record field based on its type
export const createDefaultField = (type = "text", label = "", subtype = "") => {
  const newId = generateId();
  const name = `field_${newId.substring(3, 7)}`;

  return {
    id: newId,
    type,
    label: label || name,
    name,
    required: type === "text",
    subtype,
  };
};

// Default field structure for ICF Record nodes
export const createDefaultICFRecord = () => {
  return {
    id: generateId(),
    code: "",
    description: "",
    category: "",
    qualifier: "",
    fields: [
      createDefaultField("text", "Code", "code"),
      createDefaultField("text", "Description", "description"),
      createDefaultField("select", "Category", "category"),
      createDefaultField("select", "Qualifier", "qualifier")
    ]
  };
};

// Generate name from label, making it URL-friendly
export const generateFieldNameFromLabel = (label, fieldId) => {
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

// Default ICF categories
export const ICF_CATEGORIES = [
  { value: "body_function", label: "Body Function (b)" },
  { value: "body_structure", label: "Body Structure (s)" },
  { value: "activity", label: "Activity (d)" },
  { value: "participation", label: "Participation (d)" },
  { value: "environmental", label: "Environmental Factor (e)" }
];

// Default ICF qualifiers
export const ICF_QUALIFIERS = [
  { value: "0", label: "0 - No problem (0-4%)" },
  { value: "1", label: "1 - Mild problem (5-24%)" },
  { value: "2", label: "2 - Moderate problem (25-49%)" },
  { value: "3", label: "3 - Severe problem (50-95%)" },
  { value: "4", label: "4 - Complete problem (96-100%)" },
  { value: "8", label: "8 - Not specified" },
  { value: "9", label: "9 - Not applicable" }
];

// Create a new ICF set template
export const createICFSetTemplate = (name, records) => {
  return {
    id: generateId(),
    name,
    records: [...records],
    type: "icfSet"
  };
};
