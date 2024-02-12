import React, { useMemo, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { Composer } from "./composer";



export const WodEditor = React.memo(({ 
  selectedPhase,
  setViewWod, 
  middleware, 
  setMiddleware }) => {
  
    const initialValues = useMemo(
    () => ({
      type: "",
      scope: "",
      exercises: "",
    }),
    []
  );

  const [formValues, setFormValues] = useState(initialValues);

  const handleFormSubmit = (values) => {
    const jsonData = values;
    

    setMiddleware((prevState) => {

      const updated_wod_values = {
        ...prevState.wodValues,
        [selectedPhase]: {
          ...prevState.wodValues[selectedPhase],
          [prevState.selectedMicro]: {
            ...prevState.wodValues[selectedPhase]?.[prevState.selectedMicro],
            [prevState.selectedWod]: jsonData,
          },
        },
      };

      setViewWod(values);


      return {
        ...prevState,
        wodValues: updated_wod_values,
        wodData: jsonData, // Assign jsonData directly to wodData
      };
    });
  };

  useEffect(() => {
    if (
      typeof middleware.wodData === "object" &&
      middleware.wodData !== null &&
      !Array.isArray(middleware.wodData)
    ) {
      if (middleware.wodData !== null && middleware.wodData !== undefined && Object.keys(middleware.wodData).length !== 0) {
        try {
          const parsedValues =
            middleware.wodData;
          setFormValues(parsedValues);
          setViewWod(parsedValues);
          console.log("IM HERE!")
        } catch (error) {
          /* console.error('This error has occurred:', error); */
          setFormValues(initialValues);
        }
      } else {
        setFormValues(initialValues);
        /* console.error('I am arrived to the first else!'); */
      }
    } else {
      /* console.error('I am arrived to the second else!'); */
      setFormValues(initialValues);
    }
  }, [
    middleware.selectedWod,
    initialValues,
    middleware.wodData,
    setViewWod,
    setFormValues,
  ]);

  const validationSchema = Yup.object().shape({
    type: Yup.string().required("Type is required"),
    scope: Yup.string().required("Scope is required"),
    exercises: Yup.string().required("Exercises are required"),
  });

  return (
    <div>
      <Formik
        key={middleware.selectedWod}
        enableReinitialize={true}
        initialValues={formValues}
        onSubmit={handleFormSubmit}
        validationSchema={validationSchema}
      >
        <WodFormBody middleware={middleware} setMiddleware={setMiddleware} />
      </Formik>
      <Composer middleware={middleware} setMiddleware={setMiddleware} />
    </div>
  );
});

export const WodFormBody = React.memo(({middleware, formValues}) => {

  const {setFieldValue, setValues} = useFormikContext();

  useEffect(() => {
    if (middleware.table_data !== null && middleware.table_data !== undefined){
      const exercises_string = {...middleware.table_data};
      setFieldValue("exercises", '');
      setFieldValue("exercises", JSON.stringify(exercises_string) );
    } else {
      setFieldValue("exercises", "");
    }
  }, [middleware.table_data, setFieldValue]);

  useEffect(() => {
    if (formValues !== null && formValues !== undefined){
      setValues(formValues);
    }
  }, [formValues, setValues]);

  return (
    <div className="flex flex-col space-y-4">
          <Form className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="type" className="text-white font-bold text-lg">
                Type
              </label>
              <Field
                name="type"
                type="text"
                className="w-full bg-zinc-800 p-2 rounded-md h-8"
              />
              <ErrorMessage
                name="type"
                component="div"
                className="text-red-500 text-xs"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="scope" className="text-white font-bold text-lg">
                Scope
              </label>
              <Field
                name="scope"
                type="text"
                className="w-full bg-zinc-800 p-2 rounded-md h-8"
              />
              <ErrorMessage
                name="scope"
                component="div"
                className="text-red-500 text-xs"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="exercises"
                className="text-white font-bold text-lg"
              >
                Exercises
              </label>
              <Field
                name="exercises"
                type="text"
                className="w-full bg-zinc-800 p-2 rounded-md h-8"
              />
              <ErrorMessage
                name="exercises"
                component="div"
                className="text-red-500 text-xs"
              />
            </div>

            <button
              type="submit"
              className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2  px-2 py-2 rounded-md cursor-pointer text-sm"
            >
              Submit
            </button>
          </Form>
        </div>
  )
});
