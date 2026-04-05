// Simple validation logic for ICF records

/**
 * Create a validation schema for a record
 * @param {Object} record - The record to validate
 * @returns {Function} - A function that validates values against the schema
 */
export const createValidationSchema = (record) => {
  return (values) => {
    const errors = {};
    
    record.fields.forEach((field) => {
      // Skip validation if the field isn't required or has a value
      if (!field.required || (values && values[field.name])) {
        return;
      }
      
      // Add error if required field is empty
      errors[field.name] = "This field is required";
    });
    
    return Object.keys(errors).length > 0 ? errors : null;
  };
};

/**
 * Validate all records at once
 * @param {Array} records - Array of record objects to validate
 * @param {Object} formValues - All form values organized by record ID
 * @returns {Object} - Errors by record ID and field name
 */
export const validateAllRecords = (records, formValues) => {
  const allErrors = {};
  
  records.forEach((record) => {
    const recordValues = formValues[record.id] || {};
    const recordValidator = createValidationSchema(record);
    const recordErrors = recordValidator(recordValues);
    
    if (recordErrors) {
      allErrors[record.id] = recordErrors;
    }
  });
  
  return allErrors;
};

/**
 * Check if a record has the minimum required data to be valid
 * @param {Object} record - The record to check
 * @param {Object} values - The values for this record
 * @returns {boolean} - Whether the record is valid
 */
export const isRecordValid = (record, values) => {
  // At minimum, a record should have a code
  if (!values || !values.code) {
    return false;
  }
  
  // Check all required fields
  for (const field of record.fields) {
    if (field.required && !values[field.name]) {
      return false;
    }
  }
  
  return true;
};
