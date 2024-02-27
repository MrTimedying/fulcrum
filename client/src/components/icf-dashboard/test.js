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
import { useDispatch, useSelector } from "react-redux";
import { addTest } from "../../global/slices/testSlice";


export const Test = ({
  isOpenTest,
  setIsOpenTest,
  cards,
  setCards,
  tableData,
  setTableData
}) => {
  const [searchResults, setSearchResults] = useState([]);

  const dispatch = useDispatch();
  const items = useSelector(state => state.test);

  const initialFormValues = useMemo(
    () => ({
      name: "",
      type: "",
      score: 0,
      date: "",
    }),
    []
  );

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("A name is required"),
    type: Yup.string().required("A type is required"),
    score: Yup.number().required("Select a value for the score"),
    date: Yup.date().required("A date is required"),
  });

  const handleFormSubmit = (values, { resetForm }) => {
    const newRow = {
      name: values.name,
      type: values.type,
      score: values.score,
      date: values.date,
    };

    console.log("New Row:", newRow);

    setTableData([...tableData, newRow]);

    console.log("Updated Table Data:", tableData);

    resetForm();
  };

  // Api requests and backend fetching

  const handleTestPost = (values) => {
    console.log(values);
    dispatch(addTest(values));
  };

  const handleSearchChange = (inputValue) => {

    const input = inputValue.toLowerCase().split('');
    
    if (typeof items !== 'undefined') {
      const itemOptions = items.filter((item) =>
        input.every((word) =>
          (item.name.toLowerCase()).includes(word)
        )
      );
      setSearchResults(itemOptions);
      console.log(itemOptions);
    } else {

      console.warn('Input value is undefined.');
    }
  };
  

  const handleItemSelection = (selectedOption) => {
    const selectedItemName = selectedOption.name;
    console.log(selectedItemName);
    const itemDetails = items.find(item => item.name === selectedItemName) // Access the label of the selected option
    if (itemDetails) {
              // Create a new row object with exercise details
              const newRow = {
                name: itemDetails.name,
                type: itemDetails.type,
                score: itemDetails.score,
                date: itemDetails.date,
              };
    

              // Add the new row to the tableData array
              setTableData([...tableData, newRow]);
            }
  };

  const handleClose = () => {
    setIsOpenTest(false);
    setTableData([]);
  }

  // Table editing

  const addRow = () => {
    const newRow = {
      name: "",
      type: "",
      score: 0,
      date: "",
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

  const handleCellEdit = (newValue, index, field) => {
    const updatedData = [...tableData];
    updatedData[index][field] = newValue;
    setTableData(updatedData);
  };

  const parseTable = () => {
    const list_table_data = R.reduce(
      (acc, item) => [...acc, item],
      [],
      tableData
    );
    console.log(list_table_data);

    setCards(list_table_data);
  };

  return (
    <>
      <button
        className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
        onClick={() => setIsOpenTest(true)}
      >
        Add Test Day
      </button>

      <Transition show={isOpenTest}>
        <Dialog as="div" onClose={() => setIsOpenTest(false)}>
        <div className="fixed inset-0 z-10 overflow-y-auto">
            {" "}
            {/* This is the styling of the modal */}
            <div className="flex items-center justify-center">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div
            style={{
              width: "700px",
              height: "800px",
            }}
            className="p-6 my-8 text-left align-middle transition-all transform text-slate-300 font-mono bg-zinc-900 shadow-xl overflow-y-auto rounded-md"
          >
            <h3 className="text-slate-300 font-mono py-2 rounded-md cursor-pointer text-xl">Test Composer</h3>
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
                      Name
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md bg-zinc-600 text-slate-300 font-mono"
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
                      className="w-full p-2 rounded-md bg-zinc-600 text-slate-300 font-mono"
                    />
                    <ErrorMessage
                      name="type"
                      component="div"
                      className="text-red-500"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1" htmlFor="score">
                      Score
                    </label>
                    <Field
                      type="number"
                      id="score"
                      name="score"
                      value={values.score}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md bg-zinc-600 text-slate-300 font-mono"
                    />
                    <ErrorMessage
                      name="score"
                      component="div"
                      className="text-red-500"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block mb-1" htmlFor="date">
                      Date
                    </label>
                    <Field
                      type="date"
                      id="date"
                      name="date"
                      value={values.date}
                      onChange={handleChange}
                      className="w-full p-2 rounded-md bg-zinc-600 text-slate-300 font-mono"
                    />
                    <ErrorMessage
                      name="date"
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
                      onClick={() => handleTestPost(values) }
                      className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                    >
                      Save template
                    </button>
                  </div>
                </div>
              )}
            </Formik>
            <div className="w-1/2 my-10">
              <Select
                options={searchResults}
                onChange={handleItemSelection}
                onInputChange={handleSearchChange}
                getOptionLabel={(option) => option.name}
                classNamePrefix="bg-zinc-600 font-mono text-slate-300"
              />
            </div></div>
            <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={addRow}>Add Row</button>
            <button className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm" onClick={deleteRow}>Delete Row</button>
            <TableContainer component={Paper} className="mt-4">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell size="small">Name</TableCell>
                    <TableCell size="small">Type</TableCell>
                    <TableCell size="small">Score</TableCell>
                    <TableCell size="small">Date</TableCell>
                    <TableCell size="small">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell size="small">
                        <TextField
                          value={row.name}
                          onChange={(e) =>
                            handleCellEdit(e.target.value, index, "name")
                          }
                        />
                      </TableCell>
                      <TableCell size="small">
                        <TextField
                          value={row.type}
                          onChange={(e) =>
                            handleCellEdit(e.target.value, index, "type")
                          }
                        />
                      </TableCell>
                      <TableCell size="small">
                        <TextField
                          type="number"
                          value={row.score}
                          onChange={(e) =>
                            handleCellEdit(e.target.value, index, "score")
                          }
                        />
                      </TableCell>
                      <TableCell size="small">
                        <TextField
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            handleCellEdit(e.target.value, index, "date")
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
