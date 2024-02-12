import React, { useEffect, useCallback } from "react";
import { useFormik } from "formik";
import Timer from "./time.ts";
import * as Yup from "yup"; 
import { addWeeks, parseISO } from 'date-fns';

const validationSchema = Yup.object().shape({
  interventionName: Yup.string().required("Name is required"),
  interventionType: Yup.string().required("Type is required"),
  startDate: Yup.date().required("Start date is required"),
  weeks: Yup.number().required("End date is required").min(4, "Interventions must last a minimum of 4 weeks"),
  globalGoal: Yup.string().required("Global goal is required"),
  serviceGoal: Yup.string().required("Service goal is required"),
});

export const InterventionEditor = React.memo(({
  interventionStartDate, //check
  setInterventionStartDate,
  setInterventionValues, //check
  weeks, //check
  setWeeks, //check
  isAccepted,
  setIsAccepted,
  setTimer, 
  setViewIntervention,
}) => {
  // Formik Initialization
  const initialValues = {
    interventionName: "",
    interventionType: "Rehabilitation",
    startDate: "",
    weeks: "",
    globalGoal: "",
    serviceGoal: "",
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values, actions) => {

      let values_end_date = values;
      let values_start_date = parseISO(values.startDate);

      values_end_date['endDate'] = addWeeks(values_start_date, values.weeks);
      
      
      /* console.log("Form submitted:", values); */
      setViewIntervention(values_end_date);
      setInterventionValues(values_end_date);

      
/*       const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);

      const durationInMilliseconds = endDate.getTime() - startDate.getTime();
      const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);
      const durationInWeeks =
        durationInMilliseconds / (1000 * 60 * 60 * 24 * 7); */
     
        setIsAccepted(true);
        /* console.log("Dates are of the correct chronological order!"); */
        actions.resetForm({
          values: {
            interventionName: "",
            interventionType: "",
            startDate: "",
            weeks: "",
            globalGoal: "",
            serviceGoal: "",
          },
        });
       /* else {
        console.log("You can't set up a start date after the end date, bruv!");
        // Reset the form
        actions.resetForm({
          values: {
            interventionName: "",
            interventionType: "",
            startDate: "",
            weeks: "",
          },
        });
      } */
    },
  });

  //Component's methods



  const timerBuilder = useCallback(() => {
    /* console.log("Created a new Timer Instance"); */
    const timerInstance = new Timer(interventionStartDate, weeks);
    const clonedTimer = Timer.from(timerInstance);
    return clonedTimer;
  }, [interventionStartDate, weeks]);

  useEffect(() => {
    if (isAccepted === true) {
      const newTimer = timerBuilder();
      setTimer(newTimer);
      /* console.log(newTimer); */
      newTimer.calculateEndDate(); 
    }
  }, [isAccepted, timerBuilder, setTimer]);

  const resetDate = () => {
    formik.resetForm({
      values: {
        interventionName: "",
        interventionType: "Rehabilitation",
        startDate: "",
        weeks: "",
        globalGoal: "",
        serviceGoal: "",
      },
    });
    setIsAccepted(false);
    setTimer(new Timer());
  };



  // Return Statement
  return (
    <div className="flex justify-center font-mono text-slate-300 bg-zinc-900 rounded-lg p-5 mr-2">
      <form
        onSubmit={(e) => {
          /* handleAccept(); */
          formik.handleSubmit(e);
        }}
        className="flex"
      >
      <div className="w-1/2 pr-4">
    <div>
      
        <div className="mb-4">
        <h2 className="text-xl text-slate-200 font-semibold mb-4">
            Intervention Editor
          </h2>
          <label className="text-slate-200 text-sm">
            <h3>Name of the intervention</h3>
            <input
              className="w-full bg-zinc-800 p-2 rounded-md h-8"
              id="interventionName"
              type="text"
              value={formik.values.interventionName}
              onChange={(e) => {
                formik.handleChange(e);
              }}
            ></input>
            <h3>Type of the intervention</h3>
            <select
              className="w-full bg-zinc-800 p-2 rounded-md h-8"
              id="interventionType"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.interventionType}
            >
              <option className="text-black" value="Rehabilitation">
                Rehabilitation
              </option>
              <option className="text-black" value="Training">
                Training
              </option>
            </select>
            <h3>Start of the intervention date</h3>
            <input
              className="w-full bg-zinc-800 p-2 rounded-md h-8"
              id="startDate"
              type="date"
              value={formik.values.startDate}
              onChange={(e) => {
                formik.handleChange(e);
                setInterventionStartDate(new Date(e.target.value));
                setIsAccepted(false);
              }}
            ></input>
            <h3>Number of weeks</h3>
            <input
              className="w-full bg-zinc-800 p-2 rounded-md h-8"
              id="weeks"
              type="number"
              value={formik.values.weeks}
              onChange={(e) => {
                formik.handleChange(e);
                setWeeks(e.target.value);
                setIsAccepted(false);
              }}
            ></input>
          </label>
        </div>

        <button
          className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2"
          type="submit"
          disabled={
            !interventionStartDate || !weeks || isAccepted
          }
        >
          Accept
        </button>

        <button
          className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2"
          type="button"
          disabled={
            !interventionStartDate || !weeks || !isAccepted
          }
          onClick={() => resetDate()}
        >
          Reset
        </button>

        {isAccepted && (
          <div>
            <p>
              Intervention Start Date: {interventionStartDate.toDateString()}
            </p>
            <p>Weeks duration: {weeks}</p>
          </div>
        )}
      
    </div></div>
    <div className="w-1/2">
    <h2 className="text-xl text-slate-200 font-semibold mb-4">
    Goal definition and achievement
          </h2>
        {/* Right column - Goal definition and achievement */}
        <div className="mb-4">
        <h3>Global goal</h3>
            <input
              className="w-full bg-zinc-800 p-2 rounded-md h-8"
              id="globalGoal"
              type="text"
              value={formik.values.globalGoal}
              onChange={(e) => {
                formik.handleChange(e);
              }}
            ></input>
        <h3>Service program goal</h3>
            <input
              className="w-full bg-zinc-800 p-2 rounded-md h-8"
              id="serviceGoal"
              type="text"
              value={formik.values.serviceGoal}
              onChange={(e) => {
                formik.handleChange(e);
              }}
            ></input>
          
          {/* Add your content for the right column here */}
        </div>
      </div>
      </form>
    </div>
  );
});
