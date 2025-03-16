import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEditorContext } from "./editorContext";
import { addWeeks, parseISO, eachDayOfInterval, getDay } from "date-fns";
import * as R from "ramda";

export const MicroEditor = React.memo(() => {
  const {
    setViewMicro,
    microValues,
    setMicroValues,
    setMicroData,
    microData,
    setMicroPattern,
    selectedMicro,
    selectedPhase,
    timer,
    setTime_Pipeline,
    microPattern,
    setToastPayload,
    setToastIsOpen,
  } = useEditorContext();

  const initialFormValues = useMemo(
    () => ({
      type: "",
      scope: "",
      wods: "",
    }),
    []
  );

  const [formValues, setFormValues] = useState(initialFormValues);

  

  const daySelector = (value) => {
    setMicroPattern((prevState) => {
      if (!prevState.includes(value)) {
        let list = [...prevState, value];
        let sortedList = R.sortWith([
          (a, b) => {
            const comparator = [1, 2, 3, 4, 5, 6, 0];
            return comparator.indexOf(a) - comparator.indexOf(b);
          }
        ], list);
        console.log(sortedList);
        return sortedList;
      } else if (prevState.includes(value)) {
        let list = prevState.filter((item) => item!==value);
        let sortedList = R.sortWith([
          (a, b) => {
            const comparator = [1, 2, 3, 4, 5, 6, 0];
            return comparator.indexOf(a) - comparator.indexOf(b);
          }
        ], list);
        console.log(sortedList);
        return sortedList;
      }
    });

  };

  const handleFormSubmit = (values) => {
    let jsonData = {
      type: values.type,
      scope: values.scope,
      wods: microPattern.length,
    }; 
      
    jsonData = {
      ...jsonData,
      phaseID: selectedPhase,
      microID: selectedMicro,
    };

    setMicroValues((prevState) => {
      const isDuplicate = prevState.some(
        (item) =>
          item.phaseID === jsonData.phaseID && item.microID === jsonData.microID
      );
      let updatedMicroValues;

      if (!isDuplicate) {
        updatedMicroValues = [...prevState, { ...jsonData }];

        const sortedMicroValues = R.sortWith(
          [R.ascend(R.prop("phaseID")), R.ascend(R.prop("microID"))],
          updatedMicroValues
        );

        return sortedMicroValues;
      } else if (isDuplicate) {
        updatedMicroValues = prevState.filter(
          (item) =>
            item.phaseID !== jsonData.phaseID &&
            item.microID !== jsonData.microID
        );

        updatedMicroValues = [...updatedMicroValues, { ...jsonData }];

        const sortedMicroValues = R.sortWith(
          [R.ascend(R.prop("phaseID")), R.ascend(R.prop("microID"))],
          updatedMicroValues
        );

        return sortedMicroValues;
      }
    });

    console.log(microValues);

    setMicroData(jsonData);
    setViewMicro(jsonData);

    setToastPayload({
      type: "success",
      message: `Microcycle added successfully of the type: ${jsonData.type}`,
    });
    setToastIsOpen(true);
  };



  const calculateMicroEndDate = useCallback((begin_date, array) => {
    const startDate =
      typeof begin_date === "string" ? parseISO(begin_date) : begin_date;
    let start_date = startDate;
    let dateArray = [];

    array.forEach(() => {
      dateArray.push(addWeeks(start_date, 1));
      start_date = addWeeks(start_date, 1);
    });

    dateArray = dateArray.map((date) => date.toISOString());

    return dateArray;
  }, []);

  function getDatesFromPattern(begin_date, patternArray) {
    const result = [];
    let currentDate =
      typeof begin_date === "string" ? parseISO(begin_date) : begin_date;
  
    let endDate = addWeeks(currentDate, 1);
  
    let interval = eachDayOfInterval({ start: currentDate, end: endDate });
    console.log(interval);
  
    interval.forEach(date => {
      const day = getDay(date);
      console.log(day);
      if (patternArray.includes(day)) {
        result.push(date);
      }
    });
  
    return result;
  }

  const Patternizer = useCallback(
    (start_date, patternArray) => {
      let begin_date =
        typeof start_date === "string" ? parseISO(start_date) : start_date;
      let date_results = [];

      microValues.forEach(() => {
        date_results.push(getDatesFromPattern(begin_date, patternArray));
        begin_date = addWeeks(begin_date, 1);
      });

      date_results = date_results.map((array) =>
        array.map((date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString())
      );
      return date_results;
    },
    [microValues]
  );

  useEffect(() => {

    setTime_Pipeline((prevtime_pipeline) => ({
      ...prevtime_pipeline,
      micro_date_array: calculateMicroEndDate(timer.start, microValues),
    }));

    if (microPattern) {
      setTime_Pipeline((prevtime_pipeline) => ({
        ...prevtime_pipeline,
        wod_date_array: Patternizer(timer.start, microPattern),
      }));
      console.log(microPattern);
    } else {
      console.log("No pattern selected");
    }

    /* console.log(time_pipeline); */
  }, [
    timer.start,
    setTime_Pipeline,
    calculateMicroEndDate,
    Patternizer,
    microPattern,
    timer.mirror_weeks_counter,
    timer.weeksCounter,
    microValues,
  ]);

  useEffect(() => {
    if (
      typeof microData === "object" &&
      microData !== null &&
      !Array.isArray(microData)
    ) {
      if (microData !== null && microData !== undefined) {
        try {
          const parsedValues = microData;
          setFormValues(parsedValues);
          setViewMicro(parsedValues);
          console.log(parsedValues);
        } catch (error) {
          /* console.error('This error has occurred:', error); */
          setFormValues(initialFormValues);
        }
      } else {
        setFormValues(initialFormValues);
        /* console.log(selectedPhase); */
        /* console.error('I am arrived to the first else!'); */
      }
    } else {
      /* console.error('I am arrived to the second else!'); */
      setFormValues(initialFormValues);
      /* console.log(selectedPhase); */
    }
  }, [
    microData,
    initialFormValues,
    setViewMicro,
    setFormValues,
    selectedPhase,
  ]);

  const validationSchema = Yup.object().shape({

    type: Yup.string().required("Type is required"),
    scope: Yup.string().required("Scope is required"),
/*     wods: Yup.number()
      .required("Workout days needs to be implemented")
      .min(1, "A minimum of 1 workout day needs to be implemented")
      .max(7, "At the moment you can't exceed a workout per day"), */
  });

  return (
    <div>
      <Formik
        key={() => `${selectedMicro}-${selectedPhase}`}
        enableReinitialize={true}
        initialValues={formValues}
        onSubmit={handleFormSubmit}
        validationSchema={validationSchema}
      >
        {() => (
          <div className="col-span-1 row-span-3 w-96 h-full p-4 overflow-y-auto flex-grow">
            <Form className="space-y-4">
              
              <div>
                <h3 className="font-mono">Patternizer</h3>
                <div className="flex flex-row bg-zinc-800 rounded-md px-6 py-2">
                  {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => daySelector(day)}
                      className={`p-2 rounded-full transition-transform duration-200 ease ${
                        microPattern.includes(day)
                          ? "bg-slate-950 transform scale-110"
                          : "inactive"
                      }`}
                    >
                      {day === 0
                        ? "Sun"
                        : day === 1
                        ? "Mon"
                        : day === 2
                        ? "Tue"
                        : day === 3
                        ? "Wed"
                        : day === 4
                        ? "Thu"
                        : day === 5
                        ? "Fri"
                        : "Sat"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="type"
                  className="mb-1 text-white text-sm font-bold"
                  style={{ fontFamily: "Arial" }}
                >
                  Type
                </label>
                <Field
                  name="type"
                  type="text"
                  className="w-full bg-zinc-800 p-2 rounded-md h-8"
                  style={{ fontFamily: "Arial" }}
                />
                <ErrorMessage
                  name="type"
                  component="div"
                  className="text-red-500 text-xs"
                  style={{ fontFamily: "Arial" }}
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="scope"
                  className="mb-1 text-white text-sm font-bold"
                  style={{ fontFamily: "Arial" }}
                >
                  Scope
                </label>
                <Field
                  name="scope"
                  type="text"
                  className="w-full bg-zinc-800 p-2 rounded-md h-8"
                  style={{ fontFamily: "Arial" }}
                />
                <ErrorMessage
                  name="scope"
                  component="div"
                  className="text-red-500 text-xs"
                  style={{ fontFamily: "Arial" }}
                />
              </div>

{/*               <div className="flex flex-col">
                <label
                  htmlFor="wods"
                  className="mb-1 text-white text-sm font-bold"
                  style={{ fontFamily: "Arial" }}
                >
                  WoDs
                </label>
                <Field
                  name="wods"
                  min="1"
                  max="7"
                  type="number"
                  className="w-full bg-zinc-800 p-2 rounded-md h-8"
                  style={{ fontFamily: "Arial" }}
                  readOnly={true}
                  setValue={microPattern.length}
                />
                <ErrorMessage
                  name="wods"
                  component="div"
                  className="text-red-500 text-xs"
                  style={{ fontFamily: "Arial" }}
                />
              </div> */}

              <button
                type="submit"
                className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 w-16 px-2 py-2 rounded-md cursor-pointer text-sm"
                style={{ fontFamily: "Arial" }}
              >
                Submit
              </button>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  );
});
