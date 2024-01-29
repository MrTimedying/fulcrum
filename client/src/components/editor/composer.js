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
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import { RemoveCircleOutline } from "@mui/icons-material";
import React, { useMemo, useState } from "react";
import * as Yup from "yup";
import axios from "axios";
import Select from "react-select";
/* import { Resizable } from "react-resizable"; */
import * as R from "ramda";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const Composer = React.memo(({ middleware, setMiddleware }) => {
  const [tableData, setTableData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  /*   const [modalDimensions, setModalDimensions] = useState({
    width: 600,
    height: 600,
  }); */

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
    const dataJSON = JSON.stringify(values);

    setMiddleware((prevState) => ({ ...prevState, exerciseValues: dataJSON }));

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

    api
      .post("api/exercises", values)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleSearchChange = (inputValue) => {
    api
      .get(`api/exercises?name=${inputValue}`)
      .then(function (response) {
        const exerciseOptions = response.data.map((exercise) => ({
          value: exercise.ID,
          label: exercise.name,
        }));
        setSearchResults(exerciseOptions);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleExerciseSelection = (selectedOption) => {
    const selectedExerciseName = selectedOption.label; // Access the label of the selected option

    api
      .get(`api/exercises/details?name=${selectedExerciseName}`)
      .then(function (response) {
        const exerciseDetails = response.data;
        if (exerciseDetails) {
          // Create a new row object with exercise details
          const newRow = {
            name: exerciseDetails.name,
            type: exerciseDetails.type,
            volume: exerciseDetails.volume,
            repetitions: exerciseDetails.repetitions,
            intensity: exerciseDetails.intensity,
          };

          // Add the new row to the tableData array
          setTableData([...tableData, newRow]);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
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
    console.log(obj_table_data);

    setMiddleware((prevMiddleware) => ({
      ...prevMiddleware,
      table_data: obj_table_data,
    }));
  };

  //Function for the resize
  /*   const onResize = (event, { size }) => {
    setModalDimensions((prevDimensions) => ({
      ...prevDimensions,
      width: size.width,
      height: size.height,
    }));
  }; */

  return (
    <>
      <button onClick={() => setMiddleware({ ...middleware, isOpen: true })}>
        Manage exercises
      </button>
      <Transition show={middleware.isOpen}>
        <Dialog
          as="div"
          onClose={() => setMiddleware({ ...middleware, isOpen: false })}
        >
          <div className="fixed inset-0 z-10 overflow-y-auto">
            {" "}
            {/* This is the styling of the modal */}
            <div className="flex items-center justify-center">
              {" "}
              {/* This is the styling of the modal */}
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              {/* <Resizable
                width={modalDimensions.width}
                height={modalDimensions.height}
                onResize={onResize}
                minConstraints={[300, 300]}
                maxConstraints={[800, 800]}
                resizeHandles={["sw"]}
                handle={
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#007bff",
                      cursor: "se-resize",
                    }}
                  />
                }
              > */}
              <div
                style={{
                  width: "950px",
                  height: "450px",
                }}
                className="p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl overflow-y-auto rounded-md"
              >
                {" "}
                {/* This is the styling of the modal */}
                <Formik
                  enableReinitialize={true}
                  initialValues={initialFormValues}
                  onSubmit={handleFormSubmit}
                  validationSchema={validationSchema}
                >
                  {({ values, handleChange, resetForm }) => (
                    <div className="p-4 bg-gray-200 rounded-md mb-4">
                      <div className="mb-3">
                        <label className="block mb-1" htmlFor="name">
                          Name
                        </label>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block mb-1" htmlFor="type">
                          Type
                        </label>
                        <Field
                          type="text"
                          id="type"
                          name="type"
                          value={values.type}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
                        />
                        <ErrorMessage
                          name="type"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block mb-1" htmlFor="volume">
                          Volume
                        </label>
                        <Field
                          type="number"
                          id="volume"
                          name="volume"
                          value={values.volume}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
                        />
                        <ErrorMessage
                          name="volume"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block mb-1" htmlFor="repetitions">
                          Repetitions
                        </label>
                        <Field
                          type="number"
                          id="repetitions"
                          name="repetitions"
                          value={values.repetitions}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
                        />
                        <ErrorMessage
                          name="repetitions"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block mb-1" htmlFor="intensity">
                          Intensity
                        </label>
                        <Field
                          type="number"
                          id="intensity"
                          name="intensity"
                          value={values.intensity}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md"
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
                          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                        >
                          Add to the WOD
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExercisePost(values)}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
                        >
                          Save template
                        </button>
                      </div>
                    </div>
                  )}
                </Formik>
                <div>
                  <Select
                    options={searchResults}
                    onChange={handleExerciseSelection}
                    onInputChange={handleSearchChange}
                  />
                </div>
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
                <Button onClick={addRow}>Add Row</Button>
                <Button onClick={deleteRow}>Delete Row</Button>
                <Button onClick={parseTable}>Commit String</Button>
                <Button
                  onClick={() =>
                    setMiddleware({ ...middleware, isOpen: false })
                  }
                >
                  Close
                </Button>
              </div>
              {/* </Resizable> */}
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
});
