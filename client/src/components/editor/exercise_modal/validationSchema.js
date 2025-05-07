import * as yup from "yup";

// Define the expected validation rules for each subtype
// Using actual RegExp objects is cleaner than strings like "/.../"
const subtypesValidationRules = {
  name: { type: "string" }, // Basic type check
  sets: { type: "number", integer: true, positive: true },
  reps_constant: { type: "number", integer: true, positive: true }, // Number with integer and positive constraints
  reps_variant: {
    type: "string",
    regex: /^(\d{1,2};)+$/, // Regex for 1 or 2 digits followed by semicolon, repeated
    errorMessage: (label) => `${label} must be a sequence of 1 or 2 digits followed by a semicolon (e.g., "1;22;3;")`,
    // No custom .test() needed here as the regex handles the 1-2 digit count
  },
  duration_constant: {
    type: "string",
    // Note: \d{0,2} means 0, 1, or 2 digits. This allows "::00", "0:0:00", "00:00:00".
    // If you strictly need two digits for MM/SS, use \d{2} as in the previous example.
    // Assuming \d{0,2} is intentional for HH and MM allowing single digits or empty
    regex: /^\d{0,2}:\d{0,2}:\d{2}$/,
    errorMessage: (label) => `${label} must be in HH:MM:SS format (e.g., "1:05:30" or "10:05:30").`,
    // Custom test is needed to validate numeric ranges (0-59 for MM and SS)
    test: {
        name: 'duration-values',
        errorMessage: (label) => `${label} has invalid time values (minutes and seconds must be 00-59).`,
        validator: (value) => {
             if (value === null || value === undefined || value === '') return true; // Handle optional field

             const parts = value.split(':');
             if (parts.length !== 3) return false; // Should be caught by regex, but safeguard

             const hours = parseInt(parts[0], 10); // Parse hours (can be NaN if empty \d{0,2})
             const minutes = parseInt(parts[1], 10); // Parse minutes (can be NaN if empty \d{0,2})
             const seconds = parseInt(parts[2], 10); // Parse seconds (should always be a number if regex passes \d{2})

             const isHoursValid = parts[0] === '' || (!isNaN(hours) && hours >= 0); // Allow empty hours or >= 0
             const isMinutesValid = parts[1] === '' || (!isNaN(minutes) && minutes >= 0 && minutes <= 59); // Allow empty minutes or 0-59
             const isSecondsValid = !isNaN(seconds) && seconds >= 0 && seconds <= 59; // Must be 0-59

             return isHoursValid && isMinutesValid && isSecondsValid;
        }
    }
  },
  duration_variant: {
      type: "string",
      // Regex for one or more occurrences of (0-2 digits:0-2 digits:2 digits;)
      regex: /^(\d{0,2}:\d{0,2}:\d{2};)+$/,
      errorMessage: (label) => `${label} must be a sequence of durations in HH:MM:SS; format (e.g., "0:05:30;1:00:00;").`,
      // Custom test needed to validate numeric ranges within each duration part
       test: {
        name: 'sets-duration-values',
        errorMessage: (label) => `${label} contains durations with invalid values (minutes and seconds must be 00-59).`,
        validator: (value) => {
             if (value === null || value === undefined || value === '') return true; // Handle optional field

             // Remove the last semicolon before splitting into individual durations
             const durations = value.slice(0, -1).split(';');

             for (const duration of durations) {
                 const parts = duration.split(':');
                 if (parts.length !== 3) return false; // Should not happen with regex, but safeguard

                 const hours = parseInt(parts[0], 10);
                 const minutes = parseInt(parts[1], 10);
                 const seconds = parseInt(parts[2], 10);

                 const isHoursValid = parts[0] === '' || (!isNaN(hours) && hours >= 0); // Allow empty or >= 0
                 const isMinutesValid = parts[1] === '' || (!isNaN(minutes) && minutes >= 0 && minutes <= 59); // Allow empty or 0-59
                 const isSecondsValid = !isNaN(seconds) && seconds >= 0 && seconds <= 59; // Must be 0-59

                 if (!(isHoursValid && isMinutesValid && isSecondsValid)) {
                     return false; // Found an invalid duration part
                 }
             }

             return true; // All duration parts were valid
        }
    }
  },
  intensity_type: { type: "string" }, // Assuming just a generic text input
  intensity_string: {
    type: "string",
     // Regex for one or more occurrences of (2 digits;)
    regex: /^(\d{2};)+$/,
    errorMessage: (label) => `${label} must be a sequence of 2 digits followed by a semicolon (e.g., "75;80;85;").`,
     // No custom .test() needed
  },
  intensity_number: { type: "number", positive: true }, // Assuming a single positive number
};


export const createValidationSchema = (containers) => {
  const shape = {};

  containers.forEach((container) => {
    const containerShape = {};

    container.fields.forEach((field) => {
      let fieldSchema; // Declare schema variable

      // Look up validation rules based on subtype, fallback to a default if no subtype or subtype not found
      const validationRule = field.subtype && subtypesValidationRules[field.subtype]
                             ? subtypesValidationRules[field.subtype]
                             : { type: field.type || 'string' }; // Default based on field.type

      // 1. Determine the base schema based on the looked-up type and required status
      if (validationRule.type === "number") {
        fieldSchema = yup
          .number()
          // Use field.label for error messages, fallback to field.name
          .typeError(`${field.label || field.name} must be a number.`);

        if (field.required) {
          fieldSchema = fieldSchema.required(`${field.label || field.name} is required.`);
        } else {
          // Allow null/undefined/empty string for optional numbers
           // Transform empty strings to null so .number() doesn't throw on empty
          fieldSchema = fieldSchema.notRequired().nullable().transform((value, originalValue) =>
              String(originalValue).trim() === '' ? null : value
          );
        }

        // Apply specific number constraints from the rule object
        if (validationRule.integer) {
             fieldSchema = fieldSchema.integer(`${field.label || field.name} must be a whole number.`);
        }
         if (validationRule.positive) {
             fieldSchema = fieldSchema.positive(`${field.label || field.name} must be a positive number.`);
        }

      } else { // Assume string validation for 'string', 'text', and any unhandled types/subtypes with regex
        fieldSchema = yup.string();

         if (field.required) {
          fieldSchema = fieldSchema.required(`${field.label || field.name} is required.`).trim();
        } else {
          // Allow empty string for optional strings, trim whitespace
          fieldSchema = fieldSchema.notRequired().trim().nullable(); // Use nullable if empty string should be treated as null
        }

        // 2. Apply regex validation if specified in the rule
        if (validationRule.regex) {
           const errorMessage = typeof validationRule.errorMessage === 'function'
                               ? validationRule.errorMessage(field.label || field.name)
                               : validationRule.errorMessage || `${field.label || field.name} has an invalid format.`;

           fieldSchema = fieldSchema.matches(validationRule.regex, errorMessage);
        }
      }


      // 3. Apply custom test validation if specified in the rule
      if (validationRule.test) {
           const testName = validationRule.test.name || `${field.name}-custom-test`; // Use field name for unique test name fallback
           const errorMessage = typeof validationRule.test.errorMessage === 'function'
                               ? validationRule.test.errorMessage(field.label || field.name)
                               : validationRule.test.errorMessage || `${field.label || field.name} has an invalid value.`;
           const validator = validationRule.test.validator;

           if (typeof validator === 'function') {
              fieldSchema = fieldSchema.test(testName, errorMessage, validator);
           } else {
               console.warn(`Subtype '${field.subtype}' test rule for field '${field.name}' is missing a validator function.`);
           }
      }


      // 4. Assign the final schema for this field
      containerShape[field.name] = fieldSchema;
    });

    // Assign the object schema for this container
    shape[container.id] = yup.object().shape(containerShape);
  });

  // Return the overall schema for the form
  return yup.object().shape(shape);
};
