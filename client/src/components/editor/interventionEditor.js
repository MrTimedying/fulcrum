import React, { useState } from "react";
import { useFormik } from "formik";
import { useEditorContext } from "./editorContext.js";
import * as Yup from "yup"; 
import { addWeeks, parseISO } from 'date-fns';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

const validationSchema = Yup.object().shape({
  interventionName: Yup.string().required("Name is required"),
  interventionType: Yup.string().required("Type is required"),
  start: Yup.date().required("Start date is required"),
  weeks: Yup.number().required("End date is required").min(4, "Interventions must last a minimum of 4 weeks"),
  globalGoal: Yup.string().required("Global goal is required"),
  serviceGoal: Yup.string().required("Service goal is required"),
});

export const InterventionEditor = React.memo(() => {

  // Context consuming
  const {
    interventionStartDate, //check
    setInterventionStartDate,
    setInterventionValues, //check
    weeks, //check
    setWeeks, //check
    isAccepted,
    setIsAccepted,
    setTimer, 
    setViewIntervention,
  } = useEditorContext();

  const [toastOpen, setToastOpen] = useState(false);

  const handleToastClose = (event, reason) =>{
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
  }

  // Formik Initialization
  const initialValues = {
    interventionName: "",
    interventionType: "Rehabilitation",
    start: "",
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
      console.log("values at face value", values);
      let values_start_date = parseISO(values.start);

      values_end_date['end'] = addWeeks(values_start_date, values.weeks);
      values_end_date.start = values_start_date.toISOString();
      values_end_date.end = values_end_date.end.toISOString();
      console.log(values_end_date);
      
      setViewIntervention(values_end_date);
      setInterventionValues(values_end_date);

      setTimer(prevTimer => ({
        ...prevTimer,
        start: values_end_date['start'],
        end: values_end_date['end'],
        weeks: Math.max(values.weeks,0),
        weeksCounter: Math.max(values.weeks,0)
      }))
      

      setIsAccepted(true);

      actions.resetForm({
        values: {
          interventionName: "",
          interventionType: "",
          start: "",
          weeks: "",
          globalGoal: "",
          serviceGoal: "",
        },
      });

    },
  });



  const resetDate = () => {
    formik.resetForm({
      values: {
        interventionName: "",
        interventionType: "Rehabilitation",
        start: "",
        weeks: "",
        globalGoal: "",
        serviceGoal: "",
      },
    });
    setIsAccepted(false);
    setTimer({
      start: new Date(2024, 1, 1),
      end: new Date(2024,1,1),
      weeks: 0,
      weeksCounter: Math.max(0,0), // A max needs to be set in the consuming logic
      phaseCounter: 0, // A max needs to be set in the consuming logic
      minWeeks: 4,
      mirror_weeks_counter: 0
    });
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleToastClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );



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
              id="start"
              type="date"
              value={formik.values.start}
              onChange={(e) => {
                formik.handleChange(e);
                setInterventionStartDate(e.target.value);
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
          onClick={() => setToastOpen(true)}
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

        <Snackbar
          open={toastOpen}
          autoHideDuration={3000}
          onClose={handleToastClose}
          message="Intervention data has been created successfully"
          action={action}
          TransitionComponent={Slide}
        />
      
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
