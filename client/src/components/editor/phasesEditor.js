import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; // Import Yup for validation

const PhasesForm = ({
  selectedPhase,
  setPhaseValues,
  selectedValues,
  setViewPhase,
  timer
  /* phaseIndex */
}) => {
  const initialFormValues = useMemo(() => ({
    phasename: "",
    weeksnumber: 0,
    phasescope: "",
  }), []);

  const [formValues, setFormValues] = useState(initialFormValues);

  const handleFormSubmit = (values) => {
    const jsonData = JSON.stringify(values);
    setPhaseValues((prevPhaseValues) => ({
      ...prevPhaseValues,
      [selectedPhase]: jsonData,
    }));
    console.log(values);
    setViewPhase(values);

    /* timer.setWeeksCounter(timer.weeksCounter - values.weeksnumber); */
    console.log(timer.phaseCounter);
    console.log(timer.weeksCounter);
    console.log(timer.weeksHandler());

  };

  useEffect(() => {
    if (typeof selectedValues === 'object' && selectedValues !== null && !Array.isArray(selectedValues)) {
      if (selectedValues !== null && selectedValues !== undefined) {
        try {
          const parsedValues = selectedValues;
          setFormValues(parsedValues);
          setViewPhase(parsedValues);
        } catch (error) {
          console.error('This error has occurred:', error);
          setFormValues(initialFormValues);
        }
      } else {
        setFormValues(initialFormValues);
        console.error('I am arrived to the first else!');
      }
    } else {
      
      console.error('I am arrived to the second else!');
      setFormValues(initialFormValues);
      
    }
  }, [selectedPhase, initialFormValues, selectedValues, setViewPhase, setFormValues]);

  const loadOldData = () => {
    if (typeof selectedValues === 'object' && selectedValues !== null && !Array.isArray(selectedValues)) {
      if (selectedValues !== null && selectedValues !== undefined) {
        try {
          const parsedValues = selectedValues;
          setFormValues(parsedValues);
        } catch (error) {
          console.error('This error has occurred:', error);
          setFormValues(initialFormValues);
        }
      } else {
        // If no data is available, reset the form values
        alert('Data could not be retrived!');
      }
    } else {
      alert('There is no data stored!');
      setFormValues(initialFormValues);
      
    }
  };

  // Define validation schema using Yup
  const validationSchema = Yup.object().shape({
    phasename: Yup.string().required("Name is required"),
    weeksnumber: Yup.number()
      .required("Number of weeks is required")
      .min(4, "Minimum 4 weeks"),
    phasescope: Yup.string().required("Scope is required"),
  });

  return (
    <Formik
      key={selectedPhase}
      enableReinitialize={true}
      initialValues={formValues}
      onSubmit={handleFormSubmit}
      validationSchema={validationSchema} // Add validation schema to Formik
    >
      <Form>
        <div className="form-group flex flex-col w-full">
          <label htmlFor="phaseName">Name of the Phase</label>
          <Field
            as="input"
            name="phasename"
            id="phasename"
            placeholder="Name the phase"
          />
          <ErrorMessage
            name="phasename"
            component="div"
            className="error-message"
          />
        </div>
        <div className="form-group flex flex-col">
          <label htmlFor="weeksNumber">Number of weeks</label>
          <Field
            type="number"
            name="weeksnumber"
            id="weeksnumber"
            step="1"
            min="4"
            max={timer.weeksHandler()}
          />
          <ErrorMessage
            name="weeksnumber"
            component="div"
            className="error-message"
          />
        </div>
        <div className="form-group flex-col flex">
          <label htmlFor="phaseScope">Scope of the phase</label>
          <Field type="text" name="phasescope" id="phasescope" />
          <ErrorMessage
            name="phasescope"
            component="div"
            className="error-message"
          />
        </div>

        <button type="submit">Submit</button>
        <button type="button" onClick={loadOldData}>
          Load
        </button>
      </Form>
    </Formik>
  );
};

export default PhasesForm;
