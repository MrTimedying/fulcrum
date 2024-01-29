import React, { useMemo, useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export const MicroEditor = React.memo(({ setViewMicro, middleware, setMiddleware, selectedPhase }) => {
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
    const jsonData = /* JSON.stringify(values); */ values;
  
    setMiddleware((prevState) => {
      const updatedMicroValues = { ...prevState.microValues,
        [selectedPhase]: {
          ...prevState.microValues[selectedPhase],
          [prevState.selectedMicro]: jsonData
        }};
  
      
      
      let updatedMicroData = [...prevState.microData];
      updatedMicroData = {...values};

      setViewMicro(values);
  
      return {
        ...prevState,
        microValues: updatedMicroValues,
        microData: updatedMicroData
      };
    });
  };

  /*   const handleFormSubmit = (values) => {
    const jsonData = JSON.stringify(values);

    setMiddleware((prevState) => ({
      ...prevState.microValues,
      [selectedMicro]: jsonData 
    }));

  }; */

  

  const handlePatternChange = (e) => {
    setSelectedPattern(JSON.parse(e.target.value));
    
  };

  const committSessions = () => {
    if (Array.isArray(selectedPattern) && selectedPattern.length > 0) {
      let picked_pattern = selectedPattern;
      /* console.log('I am correctly calling committSessions/n picked_pattern: ', picked_pattern); */
      setMiddleware((prevState) => ({
        ...prevState,
        microPattern: picked_pattern,
      }));
    } else {
      alert('Please select a pattern!') // Not sure If I wanna keep this error handler here as a pop-up in the complete app.
    }
  };
  
  

  useEffect(() => {
    if (typeof middleware.microData === 'object' && middleware.microData !== null && !Array.isArray(middleware.microData)) {
      if (middleware.microData !== null && middleware.microData !== undefined) {
        try {
          const parsedValues = middleware.microData;
          setFormValues(parsedValues);
          setViewMicro(parsedValues);
          /* console.log(selectedPhase); */
          
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
  }, [middleware.microData, initialFormValues, setViewMicro, setFormValues, selectedPhase]);

  const validationSchema = Yup.object().shape({
    type: Yup.string().required("Type is required"),
    scope: Yup.string().required("Scope is required"),
    wods: Yup.number().required("Workout days needs to be implemented").min( 1, "A minimum of 1 workout day needs to be implemented").max(7, "At the moment you can't exceed a workout per day"),
  });

  return (
    <div>
      <Formik
        key={() => `${middleware.selectedMicro}-${selectedPhase}`}
        enableReinitialize={true}
        initialValues={formValues}
        onSubmit={handleFormSubmit}
        validationSchema={validationSchema}
      >
        {({setFieldValue}) => (
          <div className="col-span-1 row-span-3 w-96 h-full p-4 overflow-y-auto flex-grow">
          <Form className="space-y-4">

            <div className="flex flex-col">
            <label htmlFor="pattern" className="mb-1 text-white text-sm font-bold" style={{ fontFamily: 'Arial' }} >Pattern</label>
              <select 
                id="sessions" 
                name="sessions" 
                className="border rounded-md p-2 bg-gray-900 text-white text-sm focus:outline-none focus:ring focus:border-blue-300" 
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

              <select id="patterns" name="pattenrs" className="border rounded-md p-2 bg-gray-900 text-white text-sm focus:outline-none focus:ring focus:border-blue-300" style={{ fontFamily: 'Arial' }} onChange={handlePatternChange}>
              {getPatternOptions().map(option => (
                <option key={option.value} value={JSON.stringify(option.value)}>
                 {option.label}
                </option>
                ))}  
              </select>

              <button type="button" className="border rounded-md p-2 bg-gray-900 text-white text-sm focus:outline-none focus:ring focus:border-blue-300" onClick={() => {
                setFieldValue('wods', sessions);
                committSessions();
              }}>Committ</button>

            </div>

            <div className="flex flex-col">
              <label htmlFor="type" className="mb-1 text-white text-sm font-bold" style={{ fontFamily: 'Arial' }}>Type</label>
              <Field name="type" type="text" className="border rounded-md p-2 bg-gray-900 text-white text-sm focus:outline-none focus:ring focus:border-blue-300" style={{ fontFamily: 'Arial' }} />
              <ErrorMessage name="type" component="div" className="text-red-500 text-xs" style={{ fontFamily: 'Arial' }} />
            </div>
        
            <div className="flex flex-col">
              <label htmlFor="scope" className="mb-1 text-white text-sm font-bold" style={{ fontFamily: 'Arial' }}>Scope</label>
              <Field name="scope" type="text" className="border rounded-md p-2 bg-gray-900 text-white text-sm focus:outline-none focus:ring focus:border-blue-300" style={{ fontFamily: 'Arial' }} />
              <ErrorMessage name="scope" component="div" className="text-red-500 text-xs" style={{ fontFamily: 'Arial' }} />
            </div>
        
            <div className="flex flex-col">
              <label htmlFor="wods" className="mb-1 text-white text-sm font-bold" style={{ fontFamily: 'Arial' }}>WoDs</label>
              <Field name="wods" min="1" max="7" type="number" className="border rounded-md p-2 bg-gray-900 text-white text-sm focus:outline-none focus:ring focus:border-blue-300" style={{ fontFamily: 'Arial' }} />
              <ErrorMessage name="wods" component="div" className="text-red-500 text-xs" style={{ fontFamily: 'Arial' }} />
            </div>
        
            <button type="submit" className="bg-gray-900 hover:bg-black text-white font-bold py-1 px-2 rounded" style={{ fontFamily: 'Arial' }}>
              Submit
            </button>
          </Form>
        </div>
        
        
        )}
      </Formik>
    </div>
  );
});
