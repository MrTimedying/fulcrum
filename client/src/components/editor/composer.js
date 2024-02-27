import { Formik, Field, ErrorMessage } from "formik";
import { Dialog, Transition } from "@headlessui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
} from "@mui/material";
import { RemoveCircleOutline } from "@mui/icons-material";
import React, { useMemo, useState } from "react";
import * as Yup from "yup";
import Select from "react-select";
import { useEditorContext } from "./editorContext";
import * as R from "ramda";
import { useDispatch, useSelector } from "react-redux";
import { addExercise } from "../../global/slices/exercisesSlice";



export const Composer = React.memo(() => {
  const [tableData, setTableData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const {isOpen, setIsOpen, setExerciseValues, setTableString} = useEditorContext();

  const dispatch = useDispatch();
  const exerciseState = useSelector(state => state.exercise);


  const initialFormValues = useMemo(
    () => ({
      name: "",
      type: "",
      volume: 0,
      repetitions: 0,
      intensity: 0,
    }),
    []
  );

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("A name for the exercise is required"),
    type: Yup.string().required("A type for the exercise is required"),
    volume: Yup.number().required(
      "Indicate the number of sets or the number of minutes, required"
    ),
    repetitions: Yup.number().required(
      "Indicate the number of repetitions of the volume"
    ),
    intensity: Yup.number().required(
      "Indicate the intensity in arbitrary units out of 100"
    ),
  });

  const handleFormSubmit = (values, { resetForm }) => {
    const dataJSON = values;

    setExerciseValues(dataJSON);

    const newRow = {
      name: values.name,
      type: values.type,
      volume: values.volume,
      repetitions: values.repetitions,
      intensity: values.intensity,
    };

    setTableData([...tableData, newRow]);

    resetForm();
  };

  const handleExercisePost = (values) => {
    console.log(values);
    dispatch(addExercise(values));
  };

  const handleSearchChange = (inputValue) => {

    const input = inputValue.toLowerCase().split('');

    if (typeof exerciseState !== 'undefined') {
      const exerciseOptions = exerciseState
        .map(action=>action.payload)
        .filter((exercise) =>
          input.every(word => exercise.name.toLowerCase().includes(word)));

      
    
    setSearchResults(exerciseOptions);
    } else {
      console.warn('Input value is undefined');
    }

  };

  const handleExerciseSelection = (selectedOption) => {
    const selectedExerciseName = selectedOption.name; 
    console.log(selectedExerciseName);

    const exerciseDetails = exerciseState.map(action => action.payload).find((exercise) => 
      exercise.name === selectedExerciseName);

    console.log(exerciseDetails);

    if (exerciseDetails) {
      const newRow = {
        name: exerciseDetails.name,
        type: exerciseDetails.type,
        volume: exerciseDetails.volume,
        repetitions: exerciseDetails.repetitions,
        intensity: exerciseDetails.intensity,
      };

      setTableData([...tableData, newRow]);
    }


  };

  // Function to add a new row
  const addRow = () => {
    const newRow = {
      name: "",
      type: "",
      volume: 0,
      repetitions: 0,
      intensity: 0,
    };
    setTableData([...tableData, newRow]);
  };

  const deleteRow = () => {
    const updatedTableData = [...tableData];
    updatedTableData.pop();

    setTableData(updatedTableData);
  };

  const handleDelete = (index) => {
    const updatedTableData = [...tableData];
    updatedTableData.splice(index, 1);
    setTableData(updatedTableData);
  };

  // Function to handle cell edits
  const handleCellEdit = (newValue, index, field) => {
    const updatedData = [...tableData];
    updatedData[index][field] = newValue;
    setTableData(updatedData);
  };

  // Parsing the table and extracting all data into a JavaScript object:

  const parseTable = () => {
    const obj_table_data = R.addIndex(R.reduce)(
      (acc, item, index) => ({
        ...acc,
        [`exercise_number_${index + 1}`]: item,
      }),
      {},
      tableData
    );

    setTableString(obj_table_data);
    setIsOpen(false);
  };


  return (
    <>
      <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2  px-2 py-2 rounded-md cursor-pointer text-sm" onClick={() => (setIsOpen(true))}>
        Manage exercises
      </button>
      <Transition show={isOpen}>
        <Dialog
          as="div"
          onClose={() => setIsOpen(false)}
        >
          <div className="fixed inset-0 z-10 overflow-y-auto">
            {" "}
            
            <div className="flex items-center justify-center">
              {" "}
              
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
             
              <div
                style={{
                  width: "700px",
                  height: "800px",
                }}
                className="p-6 my-8 text-left align-middle transition-all transform text-slate-300 font-mono bg-zinc-900 shadow-xl overflow-y-auto rounded-md"
              >
                <h3 className="text-slate-300 font-mono py-2 rounded-md cursor-pointer text-xl">WOD Composer</h3>
                <div className="flex flex-row">
                <Formik
                  enableReinitialize={true}
                  initialValues={initialFormValues}
                  onSubmit={handleFormSubmit}
                  validationSchema={validationSchema}
                >
                  {({ values, handleChange, resetForm }) => (
                    <div className="p-4 rounded-md mb-4">
                      <div className="mb-2">
                        <label className="block mb-1" htmlFor="name">
                          Name
                        </label>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 p-2 rounded-md h-8"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block mb-1" htmlFor="type">
                          Type
                        </label>
                        <Field
                          type="text"
                          id="type"
                          name="type"
                          value={values.type}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 p-2 rounded-md h-8"
                        />
                        <ErrorMessage
                          name="type"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block mb-1" htmlFor="volume">
                          Volume
                        </label>
                        <Field
                          type="number"
                          id="volume"
                          name="volume"
                          value={values.volume}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 p-2 rounded-md h-8"
                        />
                        <ErrorMessage
                          name="volume"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block mb-1" htmlFor="repetitions">
                          Repetitions
                        </label>
                        <Field
                          type="number"
                          id="repetitions"
                          name="repetitions"
                          value={values.repetitions}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 p-2 rounded-md h-8"
                        />
                        <ErrorMessage
                          name="repetitions"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block mb-1" htmlFor="intensity">
                          Intensity
                        </label>
                        <Field
                          type="number"
                          id="intensity"
                          name="intensity"
                          value={values.intensity}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 p-2 rounded-md h-8"
                        />
                        <ErrorMessage
                          name="intensity"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick= {() => handleFormSubmit(values, {resetForm})}
                          className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                        >
                          Add to the WOD
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExercisePost(values)}
                          className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                        >
                          Save template
                        </button>
                      </div>
                    </div>
                  )}
                </Formik>

                <div className="my-2 w-96">
                  <Select
                    options={searchResults}
                    onChange={handleExerciseSelection}
                    onInputChange={handleSearchChange}
                    getOptionLabel={option => option.name}
                    classNamePrefix="bg-zinc-600 font-mono text-slate-300 h-8"
                  />
                </div></div>
                {/* Material-UI Table */}
                <TableContainer component={Paper} className="mt-4">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {/* Table header cells */}
                        <TableCell size="small">Type</TableCell>
                        <TableCell size="small">Name</TableCell>
                        <TableCell size="small">Volume</TableCell>
                        <TableCell size="small">Repetitions</TableCell>
                        <TableCell size="small">Intensity</TableCell>
                        {/* Add more header cells */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell size="small">
                            {/* Editable input for name */}
                            <TextField
                              value={row.name}
                              onChange={(e) =>
                                handleCellEdit(e.target.value, index, "name")
                              }
                            />
                          </TableCell>
                          <TableCell size="small">
                            {/* Editable input for type */}
                            <TextField
                              value={row.type}
                              onChange={(e) =>
                                handleCellEdit(e.target.value, index, "type")
                              }
                            />
                          </TableCell>
                          <TableCell size="small">
                            {/* Editable input for volume */}
                            <TextField
                              type="number"
                              value={row.volume}
                              onChange={(e) =>
                                handleCellEdit(e.target.value, index, "volume")
                              }
                            />
                          </TableCell>
                          <TableCell size="small">
                            {/* Editable input for repetitions */}
                            <TextField
                              type="number"
                              value={row.repetitions}
                              onChange={(e) =>
                                handleCellEdit(
                                  e.target.value,
                                  index,
                                  "repetitions"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell size="small">
                            {/* Editable input for intensity */}
                            <TextField
                              type="number"
                              value={row.intensity}
                              onChange={(e) =>
                                handleCellEdit(
                                  e.target.value,
                                  index,
                                  "intensity"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell size="small">
                            <IconButton
                              aria-label="delete"
                              onClick={() => handleDelete(index)}
                            >
                              <RemoveCircleOutline style={{ color: "red" }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={addRow}>Add Row</button>
                <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={deleteRow}>Delete Row</button>
                <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={parseTable}>Commit String</button>
                <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
              {/* </Resizable> */}
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
});
