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
import Select from "react-select";
import * as R from "ramda";
import './dashboard.css';
import { useDispatch, useSelector } from "react-redux";
import { addItem, editItem, deleteItem } from "../../global/slices/itemsSlice";



export const Composer = ({
  setBodyStructures,
  setActivitiesParticipation,
  setEnvironmentalFactors,
  setPersonalFactors,
  isOpenComposer,
  setIsOpenComposer,
  tableData,
  setTableData
}) => {
  const [searchResults, setSearchResults] = useState([]);
  
  const dispatch = useDispatch();
  const items = useSelector(state => state.item);
 


  const initialFormValues = useMemo(
    () => ({
      category: "",
      label: "",
      score: 0,
    }),
    []
  );

  const validationSchema = Yup.object().shape({
    category: Yup.string().required("A category code is required"),
    label: Yup.string().required("A label name for the category is required"),
    score: Yup.number().required("Select a value for the qualifier score"),
  });

  const handleClose = () => {
    setIsOpenComposer(false);
    setTableData([]);
  }

  const handleFormSubmit = (values, {resetForm}) => {
    /* const dataJSON = JSON.stringify(values); */

    const newRow = {
      category: values.category,
      label: values.label,
      score: values.score,
    };
    
    console.log("New Row:", newRow);

    setTableData([...tableData, newRow]);

    console.log("Updated Table Data:", tableData);

    resetForm();
    
  };

  const handleExercisePost = (values) => {
    dispatch(addItem(values));
    console.log(values);
  };

  const handleSearchChange = (inputValue) => {

    const input = inputValue.toLowerCase().split('');
    console.log(input);
    
    if (typeof items !== 'undefined') {
      const itemOptions = items.filter((item) =>
        input.every((word) =>
          (item.label.toLowerCase() + item.category.toLowerCase()).includes(word)
        )
      );
      setSearchResults(itemOptions);
      console.log(itemOptions);
    } else {

      console.warn('Input value is undefined.');
    }
  };
  

  const handleItemSelection = (selectedOption) => {
    const selectedItemName = selectedOption.label;
    const itemDetails = items.find(item => item.label === selectedItemName) // Access the label of the selected option
    if (itemDetails) {
              // Create a new row object with exercise details
              const newRow = {
                category: itemDetails.category,
                label: itemDetails.label,
                score: itemDetails.score,
              };

              // Add the new row to the tableData array
              setTableData([...tableData, newRow]);
            }
  };

  // Function to add a new row
  const addRow = () => {
    const newRow = {
      category: "",
      label: "",
      score: 0,
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
    const list_table_data = R.reduce(
      (acc, item) => [...acc, item],
      [],
      tableData
    );
    console.log(list_table_data);

    for (const item of list_table_data) {
      if (item.category.startsWith("b")) {
        setBodyStructures((prevState) => [...prevState, item]);
      } else if (item.category.startsWith("d")) {
        setActivitiesParticipation((prevState) => [...prevState, item]);
      } else if (item.category.startsWith("e")) {
        setEnvironmentalFactors((prevState) => [...prevState, item]);
      } else if (item.category.startsWith("p")) {
        setPersonalFactors((prevState) => [...prevState, item]);
      }
    }
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
      <button
        className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
        onClick={() => setIsOpenComposer(true)}
      >
        Add item
      </button>

      <Transition show={isOpenComposer}>
        <Dialog as="div" onClose={() => setIsOpenComposer(false)}>
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
                  width: "700px",
                  height: "800px",
                }}
                className="p-6 my-8 text-left font-mono text-slate-300 align-middle transition-all transform bg-zinc-900 shadow-xl overflow-y-auto rounded-md"
              >
                {" "}
                {/* This is the styling of the modal */}
                <h3 className="text-slate-300 font-mono py-2 rounded-md cursor-pointer text-xl">ICF Items Composer</h3>
                <div className="flex flex-row justify-between">
                <Formik
                  enableReinitialize={true}
                  initialValues={initialFormValues}
                  onSubmit={handleFormSubmit}
                  validationSchema={validationSchema}
                >
                  {({ values, handleChange, resetForm }) => (
                    
                    <div className="p-4 rounded-md mb-4">
                      <div className="mb-3">
                        <label className="block mb-1" htmlFor="name">
                          Category
                        </label>
                        <Field
                          type="text"
                          id="category"
                          name="category"
                          value={values.category}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 p-2 rounded-md h-8"
                        />
                        <ErrorMessage
                          name="category"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block mb-1" htmlFor="type">
                          Label
                        </label>
                        <Field
                          type="text"
                          id="label"
                          name="label"
                          value={values.label}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 p-2 rounded-md h-8"
                        />
                        <ErrorMessage
                          name="label"
                          component="div"
                          className="text-red-500"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block mb-1" htmlFor="volume">
                          Score
                        </label>
                        <Field
                          type="number"
                          id="score"
                          name="score"
                          value={values.score}
                          onChange={handleChange}
                          className="w-full bg-zinc-800 p-2 rounded-md h-8"
                        />
                        <ErrorMessage
                          name="score"
                          component="div"
                          className="text-red-500"
                        />
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => handleFormSubmit(values, {resetForm})}
                          className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                        >
                          Add to Set
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
                <div className="w-1/2" >
                  <Select
                    options={searchResults}
                    onChange={handleItemSelection}
                    onInputChange={handleSearchChange}
                    getOptionLabel={option => option.label}
                    getOptionValue={option => option.category}
                    classNamePrefix="bg-zinc-800 font-mono text-slate-300"
                  />
                </div>
                </div>
                {/* Material-UI Table */}
                <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={addRow}>Add Row</button>
                <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={deleteRow}>Delete Row</button>
                <TableContainer component={Paper} className="mt-4 font-mono">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {/* Table header cells */}
                        <TableCell size="small">Category</TableCell>
                        <TableCell size="small">Label</TableCell>
                        <TableCell size="small">Score</TableCell>
                        {/* Add more header cells */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell size="small">
                            {/* Editable input for name */}
                            <TextField
                              value={row.category}
                              onChange={(e) =>
                                handleCellEdit(
                                  e.target.value,
                                  index,
                                  "category"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell size="small">
                            {/* Editable input for type */}
                            <TextField
                              value={row.label}
                              onChange={(e) =>
                                handleCellEdit(e.target.value, index, "label")
                              }
                            />
                          </TableCell>
                          <TableCell size="small">
                            {/* Editable input for volume */}
                            <TextField
                              type="number"
                              value={row.score}
                              onChange={(e) =>
                                handleCellEdit(e.target.value, index, "score")
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
                <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={parseTable}>Commit String</button>
                <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={handleClose}>Close</button>
              </div>
              {/* </Resizable> */}
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
