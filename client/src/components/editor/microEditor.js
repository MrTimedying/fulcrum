import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEditorContext } from './editorContext';
import {addWeeks, addDays, parseISO} from 'date-fns';
import * as R from 'ramda';

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
    microPattern
  } = useEditorContext();

  const initialFormValues = useMemo(
    () => ({
      type: "",
      scope: "",
      wods: "",
    }),
    []
  );
  
  const getPatternOptions = () => {
    let options = [];
    if (sessions !== null && sessions !== undefined) {
      if (sessions === 1) {
        return [
          { value: [1, 0, 0, 0, 0, 0, 0], label: 'All Mondays', description: 'Select all Mondays' },
          { value: [0, 1, 0, 0, 0, 0, 0], label: 'All Tuesdays', description: 'Select all Tuesdays' },
          { value: [0, 0, 1, 0, 0, 0, 0], label: 'All Wednesdays', description: 'Select all Wednesdays' },
          { value: [0, 0, 0, 1, 0, 0, 0], label: 'All Thursdays', description: 'Select all Thursdays' },
          { value: [0, 0, 0, 0, 1, 0, 0], label: 'All Fridays', description: 'Select all Fridays' },
          { value: [0, 0, 0, 0, 0, 1, 0], label: 'All Saturdays', description: 'Select all Saturdays' },
          { value: [0, 0, 0, 0, 0, 0, 1], label: 'All Sundays', description: 'Select all Sundays' },
        ];
      } else if (sessions === 2) {
        return [
          { value: [1, 0, 1, 0, 0, 0, 0], label: 'All Mondays and Wednesdays', description: 'Select all Mondays and Wednesdays' },
          { value: [0, 1, 0, 1, 0, 0, 0], label: 'All Tuesdays and Thursdays', description: 'Select all Tuesdays and Thursdays' },
          { value: [0, 0, 1, 0, 1, 0, 0], label: 'All Wednesdays and Fridays', description: 'Select all Wednesdays and Fridays' },
          { value: [0, 0, 0, 0, 1, 0, 1], label: 'All Fridays and Sundays', description: 'Select all Fridays and Sundays' },
        ];
      } else if (sessions === 3) {
        return [
          { value: [1, 0, 1, 0, 1, 0, 0], label: 'Monday, Wednesday and Friday', description: 'Select all Monday, Wednesday and Friday' },
          { value: [0, 1, 0, 1, 0, 1, 0], label: 'Tuesday, Thursday and Saturday', description: 'Select all Tuesday, Thursday and Saturday' },
          { value: [0, 0, 1, 0, 1, 0, 1], label: 'Wednesday, Friday and Sunday', description: 'Select all Wednesday, Friday and Sunday' },
        ];
      } else if (sessions === 4) {
        return [
          { value: [1, 0, 1, 0, 1, 0, 1], label: 'Mon, Wedn, Frid, Sun', description: 'Select all Mon, Wedn, Frid, Sun' },
          { value: [0, 1, 0, 1, 0, 1, 1], label: 'Tue, Thu, Sat, Sun', description: 'Select all Tue, Thu, Sat, Sun' },
          { value: [1, 1, 0, 1, 0, 1, 0], label: 'Mon, Tue, Thu, Sat', description: 'Select all Mon, Tue, Thu, Sat' },
        ];
      } else if (sessions === 5) {
        return [
          { value: [1, 1, 1, 0, 1, 0, 1], label: 'All Mon, Tue, Wed, Fri, Sun', description: 'Select all Mon, Tue, Wed, Fri, Sun' },
          { value: [1, 0, 1, 0, 1, 1, 1], label: 'All Mon, Wed, Fri, Sat, Sun', description: 'Select all Mon, Wed, Fri, Sat, Sun' },
          { value: [1, 0, 1, 1, 1, 0, 1], label: 'All Mon, Wed, Thu, Fri, Sun', description: 'Select all Mon, Wed, Thu, Fri, Sun' },
        ];
      } else if (sessions === 6) {
        return [
          { value: [1, 1, 1, 1, 1, 1, 0], label: 'All Days Except Sundays', description: 'Select all days except Sundays' },
          { value: [0, 1, 1, 1, 1, 1, 1], label: 'All Tuesdays to Sundays', description: 'Select all Tuesdays to Sundays' },
          { value: [1, 0, 1, 1, 1, 1, 1], label: 'All Mondays, Wednesdays to Sundays', description: 'Select all Mondays, Wednesdays to Sundays' },
          { value: [1, 1, 1, 1, 1, 0, 1], label: 'All Weekdays Except Saturdays', description: 'Select all weekdays except Saturdays' },
        ];
      } else if (sessions === 7) {
        return [
          { value: [1, 1, 1, 1, 1, 1, 1], label: 'All Days of the Week', description: 'Select all days of the week' },
        ];
      } else {
         options.push({ value: null, label: 'Select a number of sessions', description: 'Please choose the number of sessions' });
         return options;
      }} else {
        options.push({ value: null, label: 'Select a number of sessions', description: 'Please choose the number of sessions' });
        return options;
      }
  };

  const [formValues, setFormValues] = useState(initialFormValues);
  const [sessions, setSessions] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState([1, 0, 0, 0, 0, 0, 0]);

  const handleFormSubmit = (values) => {
    let jsonData = /* JSON.stringify(values); */ values;
    
    jsonData = { 
      ...jsonData,
      phaseID: selectedPhase,
      microID: selectedMicro,
      };
          
    setMicroValues((prevState) => {
      const isDuplicate = prevState.some((item) => (item.phaseID === jsonData.phaseID && item.microID === jsonData.microID));
      if (!isDuplicate) {

        const updatedMicroValues = [...prevState, {...jsonData}]

        const sortedMicroValues = R.sortWith([
          R.ascend(R.prop('phaseID')),
          R.ascend(R.prop('microID')),
        ], updatedMicroValues);

        return sortedMicroValues;
      }
      return prevState;
    });

    setMicroData(jsonData);
    setViewMicro(jsonData);
    
  };

  const handlePatternChange = (e) => {
    setSelectedPattern(JSON.parse(e.target.value));
    
  };

  const committSessions = () => {
    if (Array.isArray(selectedPattern) && selectedPattern.length > 0) {
      let picked_pattern = selectedPattern;
      /* console.log('I am correctly calling committSessions/n picked_pattern: ', picked_pattern); */
      setMicroPattern(picked_pattern);
    } else {
      alert('Please select a pattern!') // Not sure If I wanna keep this error handler here as a pop-up in the complete app.
    }
  };

  const calculateMicroEndDate = useCallback((begin_date, array) => {
    const startDate = typeof begin_date === 'string' ? parseISO(begin_date) : begin_date;
    let start_date = startDate;
    let dateArray = []

    array.forEach(() => {
      dateArray.push(addWeeks(start_date,1));
      start_date = addWeeks(start_date, 1);

    })

    dateArray = dateArray.map((date) => date.toISOString());

    return dateArray;   
  }, []);

  function getDatesFromPattern(begin_date, patternArray) {
    const result = [];
    let currentDate = typeof begin_date === 'string' ? parseISO(begin_date) : begin_date;
  
    patternArray.forEach((value) => {
      currentDate = addDays(currentDate, 1); 
  
      if (value === 1) {
        result.push(currentDate); 
      }
    });
  
    return result;
  }

  const Patternizer = useCallback((start_date, patternArray) => {
    let begin_date = typeof start_date === 'string' ? parseISO(start_date) : start_date;
    let date_results = [];
  
    microValues.forEach(() => {
      date_results.push(getDatesFromPattern(begin_date, patternArray));
      begin_date = addWeeks(begin_date, 1);
    });
  
    date_results = date_results.map((array) => array.map((date) => date.toISOString()));
    return date_results;
  }, [microValues]);
  
  useEffect(() => {
    // Listeners for the Phase Dates

    /* const overall_weeks = timer.weeksCounter + timer.mirror_weeks_counter; */

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

    
  }, [
    timer.start,
    setTime_Pipeline, 
    calculateMicroEndDate,
    Patternizer,
    microPattern,
    timer.mirror_weeks_counter,
    timer.weeksCounter,
    microValues
  ]); 

  useEffect(() => {
    if (typeof microData === 'object' && microData !== null && !Array.isArray(microData)) {
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
  }, [microData, initialFormValues, setViewMicro, setFormValues, selectedPhase]);

  const validationSchema = Yup.object().shape({
    type: Yup.string().required("Type is required"),
    scope: Yup.string().required("Scope is required"),
    wods: Yup.number().required("Workout days needs to be implemented").min( 1, "A minimum of 1 workout day needs to be implemented").max(7, "At the moment you can't exceed a workout per day"),
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
        {({setFieldValue}) => (
          <div className="col-span-1 row-span-3 w-96 h-full p-4 overflow-y-auto flex-grow">
          <Form className="space-y-4">

            <div className="flex flex-col">
            <label htmlFor="pattern" className="text-lg my-2 text-slate-200 col-span-1 row-span-1 font-semibold mb-2" style={{ fontFamily: 'Arial' }} >Pattern</label>
              <select 
                id="sessions" 
                name="sessions" 
                className="w-full bg-zinc-800 p-2 rounded-md h-8 my-2" 
                style={{ fontFamily: 'Arial' }} 
                onChange={e => setSessions(parseInt(e.target.value))}
                >
                <option value="1" defaultValue>1 Session/week</option>
                <option value="2">2 Sessions/week</option>
                <option value="3">3 Sessions/week</option>
                <option value="4">4 Sessions/week</option>
                <option value="5">5 Sessions/week</option>
                <option value="6">6 Sessions/week</option>
                <option value="7">7 Sessions/week</option>
              </select>

              <select id="patterns" name="pattenrs" className="w-full bg-zinc-800 p-2 rounded-md h-8" style={{ fontFamily: 'Arial' }} onChange={handlePatternChange}>
              {getPatternOptions().map(option => (
                <option key={option.value} value={JSON.stringify(option.value)}>
                 {option.label}
                </option>
                ))}  
              </select>

              <button type="button" className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 w-16 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={() => {
                setFieldValue('wods', sessions);
                committSessions();
              }}>Commit</button>

            </div>

            <div className="flex flex-col">
              <label htmlFor="type" className="mb-1 text-white text-sm font-bold" style={{ fontFamily: 'Arial' }}>Type</label>
              <Field name="type" type="text" className="w-full bg-zinc-800 p-2 rounded-md h-8" style={{ fontFamily: 'Arial' }} />
              <ErrorMessage name="type" component="div" className="text-red-500 text-xs" style={{ fontFamily: 'Arial' }} />
            </div>
        
            <div className="flex flex-col">
              <label htmlFor="scope" className="mb-1 text-white text-sm font-bold" style={{ fontFamily: 'Arial' }}>Scope</label>
              <Field name="scope" type="text" className="w-full bg-zinc-800 p-2 rounded-md h-8" style={{ fontFamily: 'Arial' }} />
              <ErrorMessage name="scope" component="div" className="text-red-500 text-xs" style={{ fontFamily: 'Arial' }} />
            </div>
        
            <div className="flex flex-col">
              <label htmlFor="wods" className="mb-1 text-white text-sm font-bold" style={{ fontFamily: 'Arial' }}>WoDs</label>
              <Field name="wods" min="1" max="7" type="number" className="w-full bg-zinc-800 p-2 rounded-md h-8" style={{ fontFamily: 'Arial' }} />
              <ErrorMessage name="wods" component="div" className="text-red-500 text-xs" style={{ fontFamily: 'Arial' }} />
            </div>
        
            <button type="submit" className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 w-16 px-2 py-2 rounded-md cursor-pointer text-sm" style={{ fontFamily: 'Arial' }}>
              Submit
            </button>
          </Form>
        </div>
        
        
        )}
      </Formik>
    </div>
  );
});
