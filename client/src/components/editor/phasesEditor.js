import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';

const PhasesForm = ({ selectedPhase, setPhaseValues, selectedValues }) => {
  const initialFormValues = {
    weeks: '',
    dropdown: '',
    freeText: '',
  };

  const [formValues, setFormValues] = useState(initialFormValues);

  const handleFormSubmit = (values) => {
    const jsonData = JSON.stringify(values);
    setPhaseValues((prevPhaseValues) => ({
      ...prevPhaseValues,
      [selectedPhase]: jsonData,
    }));
  };

  const loadOldData = () => {
    if (selectedValues) {
      const parsedValues = selectedValues;
      setFormValues(parsedValues);
    } else {
      // If no data is available, reset the form values
      setFormValues(initialFormValues);
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={formValues}
      onSubmit={handleFormSubmit}
    >
      <Form>
        <div className="form-group">
          <label htmlFor="weeks">How many weeks?</label>
          <Field as="select" name="weeks" id="weeks">
            <option value="">Select</option>
            <option value="1">1 week</option>
            <option value="2">2 weeks</option>
            <option value="3">3 weeks</option>
            {/* Add more options as needed */}
          </Field>
        </div>
        <div className="form-group">
          <label htmlFor="dropdown">Dropdown</label>
          <Field as="select" name="dropdown" id="dropdown">
            <option value="">Select</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
            {/* Add more options as needed */}
          </Field>
        </div>
        <div className="form-group">
          <label htmlFor="freeText">Free Text</label>
          <Field type="text" name="freeText" id="freeText" />
        </div>

        <button type="submit">Submit</button>
        <button type="button" onClick={loadOldData}>Load</button>
      </Form>
    </Formik>
  );
};

export default PhasesForm;
