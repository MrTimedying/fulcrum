import React, { useMemo, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { Composer } from "./composer";
import { useEditorContext } from "./editorContext";
import * as R from 'ramda';



export const WodEditor = React.memo(() => {

    const { selectedPhase, selectedMicro, setViewWod, setWodValues, wodData, setWodData, selectedWod } = useEditorContext();
  
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
    let jsonData = values;

    jsonData = {...jsonData,
    phaseID: selectedPhase,
    microID: selectedMicro,
    wodID: selectedWod,
    };

    setWodValues((prevState) => {
      const isDuplicate = prevState.some((item) => ( item.phaseID === jsonData.phaseID && item.microID === jsonData.microID && item.wodID === jsonData.wodID ));
      if(!isDuplicate){
        
        const updatedWodValues = [...prevState, {...jsonData}];

        const adjustedWodValues = R.sortWith([
          R.ascend(R.prop('phaseID')),
          R.ascend(R.prop('microID')),
          R.ascend(R.prop('wodID')),
        ], updatedWodValues);

        return adjustedWodValues;
      }
      return prevState;
    })
    
    setWodData(values);
    setViewWod(values);
  };

  useEffect(() => {
    if (
      typeof wodData === "object" &&
      wodData !== null &&
      !Array.isArray(wodData)
    ) {
      if (wodData !== null && wodData !== undefined && Object.keys(wodData).length !== 0) {
        try {
          const parsedValues =
            wodData;
          setFormValues(parsedValues);
          setViewWod(parsedValues);
          
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
    selectedWod,
    initialValues,
    wodData,
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
        key={selectedWod}
        enableReinitialize={true}
        initialValues={formValues}
        onSubmit={handleFormSubmit}
        validationSchema={validationSchema}
      >
        <WodFormBody  />
      </Formik>
      <Composer  />
    </div>
  );
});

export const WodFormBody = React.memo(({formValues}) => {

  const { tableString } = useEditorContext();


  const {setFieldValue, setValues} = useFormikContext();

  useEffect(() => {
    if (tableString !== null && tableString !== undefined){
      const exercises_string = {...tableString};
      setFieldValue("exercises", '');
      setFieldValue("exercises", JSON.stringify(exercises_string) );
    } else {
      setFieldValue("exercises", "");
    }
  }, [tableString, setFieldValue]);

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
