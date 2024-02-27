import React, { useEffect, useState, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; 
import { useEditorContext } from "./editorContext";
import * as R from "ramda";

const PhasesForm = () => {

const {
    selectedPhase,
    setPhaseValues,
    setPhaseData,
    PhaseData,
    setViewPhase,
    PhaseValues,
    setTimer,
    timer,
    weeksHandler,
    setTime_Pipeline,
    calculatePhaseEndDate,
  } = useEditorContext();

  const initialFormValues = useMemo(() => ({
    phasename: "",
    weeksnumber: 0,
    phasescope: "",
  }), []);
  const [maxWeeks, setMaxWeeks] = useState(0);
  const [formValues, setFormValues] = useState(initialFormValues);

  const handleFormSubmit = (values) => {

    let jsonData = values;

    jsonData = {...jsonData, phaseID: selectedPhase};

    setPhaseValues((prevState) => {
      const isDuplicate = prevState.some((item)=> (item.phaseID === jsonData.phaseID));
      if (!isDuplicate) {

        const updatedPhaseValues = [...prevState, {...jsonData}]
        const sortedPhaseValues = R.sortBy(R.prop('phaseID'), updatedPhaseValues );
       
        return sortedPhaseValues;
      }
      return prevState;
    });

    setPhaseData(jsonData);
    setViewPhase(values); 
    
    console.log(PhaseValues);

    setTimer(prevTimer => ({
      ...prevTimer,
      weeksCounter: Math.max(prevTimer.weeksCounter - values.weeksnumber, 0),
      phaseCounter: Math.max(prevTimer.phaseCounter - 1, 0),
      mirror_weeks_counter: prevTimer.mirror_weeks_counter + values.weeksnumber
    }));

    
    
/* 
    setWeeksCounter(timer.weeksCounter - values.weeksnumber);
    setPhaseCounter(timer.phaseCounter - 1);
    setMirrorWeeksCounter(timer.mirror_weeks_counter + values.weeksnumber); */

  };

  useEffect(() => {

    const sortedPhaseValues = R.sortBy(R.prop('phaseID'), PhaseValues);

    const updatedPhaseWeeks = sortedPhaseValues.map((value) => {
      const parsedValue = value;
      return parsedValue.weeksnumber;
    });
    
    setTime_Pipeline((prevtime_pipeline) => ({
      ...prevtime_pipeline,
      phase_weeks_array: updatedPhaseWeeks,
    }));

    setTime_Pipeline((prevtime_pipeline) => ({
      ...prevtime_pipeline,
      phase_date_array: calculatePhaseEndDate(timer.start, updatedPhaseWeeks),
    }));

    console.log(sortedPhaseValues);
    console.log(PhaseValues);

  },[PhaseValues, calculatePhaseEndDate, setTime_Pipeline, timer.start])

  useEffect(() => {
    if (typeof PhaseData === 'object' && PhaseData !== null && !Array.isArray(PhaseData)) {
      if (PhaseData !== null && PhaseData !== undefined) {
        try {
          const parsedValues = PhaseData;
          setFormValues(parsedValues);
          setViewPhase(parsedValues);
        } catch (error) {
          setFormValues(initialFormValues);
        }
      } else {
        setFormValues(initialFormValues);
      }
    } else {
      setFormValues(initialFormValues);
    }

  }, [selectedPhase, initialFormValues, PhaseData, setViewPhase, setFormValues]);

  useEffect(() => {
    
    const computedMaxWeeks = weeksHandler(PhaseData.weeksnumber, timer.weeksCounter, timer.phaseCounter, timer.minWeeks);
    setMaxWeeks(computedMaxWeeks);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PhaseData.weeksnumber, timer.weeksCounter, timer.phaseCounter, timer.minWeeks]);


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
            className="w-full bg-zinc-800 p-2 rounded-md h-8"
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
            max={maxWeeks}
            className="w-full bg-zinc-800 p-2 rounded-md h-8"
          />
          <ErrorMessage
            name="weeksnumber"
            component="div"
            className="error-message"
          />
        </div>
        <div className="form-group flex-col flex">
          <label htmlFor="phaseScope">Scope of the phase</label>
          <Field type="text" name="phasescope" id="phasescope" className="w-full bg-zinc-800 p-2 rounded-md h-8" />
          <ErrorMessage
            name="phasescope"
            component="div"
            className="error-message"
          />
        </div>

        <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" type="submit">Submit</button>
        
      </Form>
    </Formik>
  );
};

export default React.memo(PhasesForm);
