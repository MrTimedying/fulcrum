import React, { useEffect, useCallback } from "react";
import { useFormik } from "formik";
import Timer from "./time.ts";
import * as Yup from "yup"; 
import { format } from 'date-fns';

const validationSchema = Yup.object().shape({
  interventionName: Yup.string().required("Name is required"),
  interventionType: Yup.string().required("Type is required"),
  startDate: Yup.date().required("Start date is required"),
  weeks: Yup.number().required("End date is required").min(4, "Interventions must last a minimum of 4 weeks"),
});

export const InterventionEditor = ({
  interventionStartDate, //check
  setInterventionStartDate, //check
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
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values, actions) => {
      
      /* console.log("Form submitted:", values); */
      setViewIntervention(values);

      
/*       const startDate = new Date(values.startDate);
      const endDate = new Date(values.endDate);

      const durationInMilliseconds = endDate.getTime() - startDate.getTime();
      const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);
      const durationInWeeks =
        durationInMilliseconds / (1000 * 60 * 60 * 24 * 7); */
     {
        setIsAccepted(true);
        console.log("Dates are of the correct chronological order!");
        actions.resetForm({
          values: {
            interventionName: "",
            interventionType: "",
            startDate: "",
            weeks: "",
          },
        });
      } /* else {
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
    console.log("Created a new Timer Instance");
    return new Timer(interventionStartDate, weeks);
  }, [interventionStartDate, weeks]);

  useEffect(() => {
    if (isAccepted === true) {
      const newTimer = timerBuilder();
      setTimer(newTimer);
      console.log(newTimer);
      newTimer.calculateEndDate(); 
    }
  }, [isAccepted, timerBuilder, setTimer]);

  const resetDate = () => {
    formik.resetForm({
      values: {
        interventionName: "",
        interventionType: "Rehabilitation",
        startDate: "",
        endDate: "",
      },
    });
    setIsAccepted(false);
    setTimer(null);
  };



  // Return Statement
  return (
    <div>
      <form
        onSubmit={(e) => {
          /* handleAccept(); */
          formik.handleSubmit(e);
        }}
      >
        <div className="mb-4">
          <label className="text-slate-200 text-sm">
            <h3>Name of the intervention</h3>
            <input
              className="text-black"
              id="interventionName"
              type="text"
              value={formik.values.interventionName}
              onChange={(e) => {
                formik.handleChange(e);
              }}
            ></input>
            <h3>Type of the intervention</h3>
            <select
              className="text-black"
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
              className="text-black"
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
              className="text-black"
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
      </form>
    </div>
  );
};
