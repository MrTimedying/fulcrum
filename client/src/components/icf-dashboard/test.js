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
import * as R from "ramda";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const Test = ({
  isOpenTest,
  setIsOpenTest,
  cards,
  setCards,
  tableData,
  setTableData
}) => {
  const [searchResults, setSearchResults] = useState([]);

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

    api
      .post("api/test", values)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleSearchChange = (inputValue) => {
    api
      .get(`api/test?name=${inputValue}`)
      .then(function (response) {
        const itemOptions = response.data.map((item) => ({
          value: item.ID,
          label: item.Name,
        }));
        setSearchResults(itemOptions);
        console.log(itemOptions);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleItemSelection = (selectedOption) => {
    const selectedItemName = selectedOption.label; 
    console.log(selectedOption);

    api
      .get(`api/test/details?name=${selectedItemName}`)
      .then(function (response) {
        const itemDetails = response.data;
        console.log(itemDetails);
        if (itemDetails) {
          
          const newRow = {
            name: itemDetails.Name,
            type: itemDetails.Type,
            score: itemDetails.Score,
            date: itemDetails.Date,
          };

          
          setTableData([...tableData, newRow]);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
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
        className="bg-indigo-500 text-white px-4 py-2 rounded-md cursor-pointer text-sm"
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
              width: "950px",
              height: "450px",
            }}
            className="p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl overflow-y-auto rounded-md"
          >
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
                    <label className="block mb-1" htmlFor="score">
                      Score
                    </label>
                    <Field
                      type="number"
                      id="score"
                      name="score"
                      value={values.score}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
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
                      className="w-full p-2 border rounded-md"
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
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                    >
                      Add to Set
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestPost(values) }
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
                onChange={handleItemSelection}
                onInputChange={handleSearchChange}
              />
            </div>
            <Button onClick={addRow}>Add Row</Button>
            <Button onClick={deleteRow}>Delete Row</Button>
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
            <Button onClick={parseTable}>Commit String</Button>
            <Button onClick={handleClose}>Close</Button>
          </div>
          {/* </Resizable> */}
          </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};