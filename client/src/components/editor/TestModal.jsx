import React, { useState } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// Ensure Modal is attached to the app element for accessibility
if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

function TestModal({ isOpen, onClose, onSave }) {
  const [formFields, setFormFields] = useState([
    { id: 1, type: "text", label: "Test Name", name: "testName", required: true },
    { id: 2, type: "number", label: "Test Score", name: "testScore", required: true },
    { id: 3, type: "select", label: "Test Category", name: "testCategory", options: ["Category A", "Category B", "Category C"], required: false },
    { id: 4, type: "textarea", label: "Test Description", name: "testDescription", required: false }
  ]);
  const [successMessage, setSuccessMessage] = useState("");

  // Default size and position for the modal
  const defaultModalConfig = {
    width: 600,
    height: 500,
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 300 : 100,
    y: typeof window !== "undefined" ? window.innerHeight / 2 - 250 : 100,
  };

  // Build initial values for Formik
  const initialValues = formFields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {});

  // Build validation schema for Formik using Yup
  const validationSchema = Yup.object().shape(
    formFields.reduce((acc, field) => {
      if (field.required) {
        if (field.type === "number") {
          acc[field.name] = Yup.number()
            .required(`${field.label} is required`)
            .typeError(`${field.label} must be a valid number`);
        } else {
          acc[field.name] = Yup.string().required(`${field.label} is required`);
        }
      } else if (field.type === "number") {
        acc[field.name] = Yup.number()
          .typeError(`${field.label} must be a valid number`)
          .nullable();
      }
      return acc;
    }, {})
  );

  const addField = (type) => {
    const newId = formFields.length ? Math.max(...formFields.map(f => f.id)) + 1 : 1;
    const newField = {
      id: newId,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      name: `newField${newId}`,
      required: false,
      ...(type === "select" ? { options: ["Option 1", "Option 2"] } : {})
    };
    setFormFields([...formFields, newField]);
  };

  const removeField = (id) => {
    setFormFields(formFields.filter((field) => field.id !== id));
  };

  const handleSubmit = (values, { setSubmitting }) => {
    onSave(values);
    setSuccessMessage("Form submitted successfully!");
    setTimeout(() => {
      setSuccessMessage("");
      setSubmitting(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      aria={{
        labelledby: "modular-form-title",
        describedby: "modular-form-description",
      }}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1000,
        },
        content: {
          background: "transparent",
          border: "none",
          padding: 0,
          inset: 0,
          overflow: "hidden",
        },
      }}
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={400}
        minHeight={300}
        bounds="window"
        dragHandleClassName="modal-handle"
        className="flex"
      >
        <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="modal-handle bg-gray-100 dark:bg-gray-700 p-3 flex flex-row justify-between items-center cursor-move border-b border-gray-200 dark:border-gray-600">
            <h2 id="modular-form-title" className="text-lg font-semibold">
              Dynamic Test Form
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition duration-150"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          <div className="p-4 flex-grow overflow-y-auto space-y-4">
            <p id="modular-form-description" className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Fill in the details for the test. Add or remove fields as needed.
            </p>

            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {formFields.map((field) => (
                    <div
                      key={field.id}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 relative group space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium text-gray-900 dark:text-white flex items-center"
                        >
                          {field.label}{" "}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full text-sm"
                          aria-label={`Remove ${field.label}`}
                        >
                          🗑️
                        </button>
                      </div>

                      {field.type === "text" && (
                        <Field
                          id={field.name}
                          name={field.name}
                          type="text"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        />
                      )}
                      {field.type === "number" && (
                        <Field
                          id={field.name}
                          name={field.name}
                          type="number"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        />
                      )}
                      {field.type === "textarea" && (
                        <Field
                          id={field.name}
                          name={field.name}
                          as="textarea"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm min-h-[60px]"
                        />
                      )}
                      {field.type === "select" && (
                        <Field
                          id={field.name}
                          name={field.name}
                          as="select"
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        >
                          <option value="" disabled>
                            Select {field.label.toLowerCase()}
                          </option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Field>
                      )}

                      <ErrorMessage
                        name={field.name}
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => addField("text")}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-all duration-200"
                    >
                      + Text
                    </button>
                    <button
                      type="button"
                      onClick={() => addField("number")}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-all duration-200"
                    >
                      + Number
                    </button>
                    <button
                      type="button"
                      onClick={() => addField("select")}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-all duration-200"
                    >
                      + Select
                    </button>
                    <button
                      type="button"
                      onClick={() => addField("textarea")}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-all duration-200"
                    >
                      + Textarea
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? "Saving..." : "Save Test Data"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Rnd>
    </Modal>
  );
}

export default TestModal;

// Helper component for demonstration purposes

