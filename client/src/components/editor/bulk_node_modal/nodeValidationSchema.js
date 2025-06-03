import * as yup from "yup";

// Define validation rules for node properties
const propertyValidationRules = {
  name: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 100,
    errorMessage: (label) => `${label} must be between 1 and 100 characters.`
  },
  type: {
    type: "string",
    required: false,
    maxLength: 50,
    errorMessage: (label) => `${label} must be less than 50 characters.`
  },
  description: {
    type: "string",
    required: false,
    maxLength: 500,
    errorMessage: (label) => `${label} must be less than 500 characters.`
  },
  scope: {
    type: "string",
    required: true,
    minLength: 1,
    maxLength: 100,
    errorMessage: (label) => `${label} must be between 1 and 100 characters.`
  },
  color: {
    type: "string",
    required: false,
    regex: /^#[0-9A-F]{6}$/i,
    errorMessage: (label) => `${label} must be a valid hex color (e.g., #FF0000).`
  },
  global: {
    type: "string",
    required: false,
    maxLength: 100,
    errorMessage: (label) => `${label} must be less than 100 characters.`
  },
  service: {
    type: "string",
    required: false,
    maxLength: 100,
    errorMessage: (label) => `${label} must be less than 100 characters.`
  },
  tags: {
    type: "string",
    required: false,
    regex: /^(#\w+;)*$/,
    errorMessage: (label) => `${label} must be in the format #tag1;#tag2; (hashtag followed by word and semicolon).`
  }
};

// Define editable properties per node type
const editablePropertiesByType = {
  intervention: ['name', 'type', 'description', 'global', 'service'],
  phase: ['scope', 'tags'],
  micro: ['scope', 'tags'],
  session: ['scope', 'tags']
};

export const createNodeValidationSchema = (nodes) => {
  const shape = {};

  nodes.forEach((node) => {
    const nodeShape = {};
    const editableProperties = editablePropertiesByType[node.type] || [];

    editableProperties.forEach((propertyName) => {
      const validationRule = propertyValidationRules[propertyName];
      if (!validationRule) {
        console.warn(`No validation rule found for property: ${propertyName}`);
        return;
      }

      let fieldSchema;

      // Create base schema
      if (validationRule.type === "string") {
        fieldSchema = yup.string();

        // Handle required validation
        if (validationRule.required) {
          fieldSchema = fieldSchema.required(`${propertyName} is required.`).trim();
        } else {
          fieldSchema = fieldSchema.notRequired().trim().nullable();
        }

        // Apply length constraints
        if (validationRule.minLength) {
          fieldSchema = fieldSchema.min(
            validationRule.minLength,
            validationRule.errorMessage 
              ? validationRule.errorMessage(propertyName)
              : `${propertyName} must be at least ${validationRule.minLength} characters.`
          );
        }

        if (validationRule.maxLength) {
          fieldSchema = fieldSchema.max(
            validationRule.maxLength,
            validationRule.errorMessage 
              ? validationRule.errorMessage(propertyName)
              : `${propertyName} must be no more than ${validationRule.maxLength} characters.`
          );
        }

        // Apply regex validation
        if (validationRule.regex) {
          const errorMessage = typeof validationRule.errorMessage === 'function'
            ? validationRule.errorMessage(propertyName)
            : validationRule.errorMessage || `${propertyName} has an invalid format.`;

          fieldSchema = fieldSchema.matches(validationRule.regex, errorMessage);
        }

      } else if (validationRule.type === "number") {
        fieldSchema = yup
          .number()
          .typeError(`${propertyName} must be a number.`);

        if (validationRule.required) {
          fieldSchema = fieldSchema.required(`${propertyName} is required.`);
        } else {
          fieldSchema = fieldSchema.notRequired().nullable().transform((value, originalValue) =>
            String(originalValue).trim() === '' ? null : value
          );
        }

        if (validationRule.positive) {
          fieldSchema = fieldSchema.positive(`${propertyName} must be a positive number.`);
        }

        if (validationRule.integer) {
          fieldSchema = fieldSchema.integer(`${propertyName} must be a whole number.`);
        }
      }

      // Apply custom test validation if specified
      if (validationRule.test) {
        const testName = validationRule.test.name || `${propertyName}-custom-test`;
        const errorMessage = typeof validationRule.test.errorMessage === 'function'
          ? validationRule.test.errorMessage(propertyName)
          : validationRule.test.errorMessage || `${propertyName} has an invalid value.`;
        const validator = validationRule.test.validator;

        if (typeof validator === 'function') {
          fieldSchema = fieldSchema.test(testName, errorMessage, validator);
        }
      }

      nodeShape[propertyName] = fieldSchema;
    });

    // Assign the object schema for this node
    shape[node.id] = yup.object().shape(nodeShape);
  });

  // Return the overall schema for the form
  return yup.object().shape(shape);
}; 