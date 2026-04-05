import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { v4 as uuidv4 } from 'uuid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useFlowStore from "../state/flowState";
import useTransientStore from "../state/transientState";

function NpForm({ isOpen, closeModal, formData, setFormData, setFetchingSwitch, isEditing, setIsEditing }) {
  const { setNewEditor, setNewProfile } = useFlowStore();
  const setToaster = useTransientStore((state) => state.setToaster);

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    surname: Yup.string().required('Surname is required'),
    age: Yup.number().required('Age is required').min(10, 'Age must be at least 10').max(100, 'Age must be less than 100'),
    gender: Yup.string().required('Gender is required'),
    height: Yup.number().required('Height is required').min(100, 'Height must be at least 100 cm').max(250, 'Height must be less than 250 cm'),
    weight: Yup.number().required('Weight is required').min(30, 'Weight must be at least 30 kg').max(200, 'Weight must be less than 200 kg'),
    status: Yup.string().required('Status is required'),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      name: formData.name || '',
      surname: formData.surname || '',
      age: formData.age || '',
      gender: formData.gender || '',
      height: formData.height || '',
      weight: formData.weight || '',
      status: formData.status || '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Check if there are any validation errors
        if (!formik.isValid) {
          // Collect all validation errors
          const errorMessages = Object.values(formik.errors).join(', ');
          setToaster({
            type: 'error',
            message: `Please fix the following errors: ${errorMessages}`,
            show: true,
            duration: 5000
          });
          setSubmitting(false);
          return;
        }

        const patientId = formData.PatientId || uuidv4();
        const heightInMeters = values.height / 100;
        const bmi = (values.weight / (heightInMeters * heightInMeters)).toFixed(2);
        const formDataWithBMI = { ...values, bmi: bmi };
        
        // Add patient to store
        useFlowStore.getState().addPatient(patientId, formDataWithBMI);
        setNewEditor(patientId);
        setNewProfile(patientId);
        
        // Show success toast
        setToaster({
          type: 'success',
          message: 'Patient created successfully!',
          show: true,
          duration: 3000
        });
        
        // Reset form and close modal
        formik.resetForm();
        closeModal();
        
      } catch (error) {
        console.error('Error creating patient:', error);
        setToaster({
          type: 'error',
          message: 'Failed to create patient. Please try again.',
          show: true,
          duration: 5000
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const closeNpFormModal = () => {
    closeModal();
    // Reset form values when closing
    formik.resetForm();
  };

  return (
    <>
      <Transition show={isOpen}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[1000] overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center flex items-center justify-center">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <div className="inline-block w-56 max-w-md p-2 overflow-hidden text-left border border-zinc-600 font-sans text-slate-300 align-middle transition-all transform bg-zinc-900 shadow-xl rounded-2xl z-[1001] relative">
              <Dialog.Title
                as="h3"
                className="text-lg font-thin leading-6 text-slate-300"
              >
               @ Creating a New Patient Entry
              </Dialog.Title>
              <div className="mt-2">
                <form onSubmit={formik.handleSubmit}>
                  <Fragment>
                    <div className="mb-1">
                      <label
                        htmlFor="name"
                        className="block text-slate-300 text-[12px] font-thin"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="shadow appearance-none rounded w-full text-[12px] font-thin py-1 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200 dark:bg-zinc-800 dark:text-slate-300"
                        placeholder="Enter name"
                      />

                    </div>

                    <div className="mb-1">
                      <label
                        htmlFor="surname"
                        className="block text-slate-300 text-[12px] font-thin"
                      >
                        Surname
                      </label>
                      <input
                        type="text"
                        id="surname"
                        name="surname"
                        value={formik.values.surname}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="shadow appearance-none rounded w-full text-[12px] font-thin py-1 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200 dark:bg-zinc-800 dark:text-slate-300"
                        placeholder="Enter surname"
                      />

                    </div>

                    <div className="mb-1">
                      <label
                        htmlFor="age"
                        className="block text-slate-300 text-[12px] font-thin"
                      >
                        Age
                      </label>
                      <select
                        id="age"
                        name="age"
                        value={formik.values.age}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="shadow appearance-none rounded w-full text-[12px] font-thin py-1 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200 dark:bg-zinc-800 dark:text-slate-300"
                      >
                        <option value="">Select Age</option>
                        {Array.from({ length: 90 }, (_, i) => (
                          <option key={i + 10} value={i + 10}>
                            {i + 10}
                          </option>
                        ))}
                      </select>

                    </div>

                    <div className="mb-1">
                      <label
                        htmlFor="gender"
                        className="block text-slate-300 text-[12px] font-thin"
                      >
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formik.values.gender}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="shadow appearance-none rounded w-full text-[12px] font-thin py-1 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200 dark:bg-zinc-800 dark:text-slate-300"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>

                    </div>

                    <div className="mb-1">
                      <label
                        htmlFor="height"
                        className="block text-slate-300 text-[12px] font-thin"
                      >
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        min="100"
                        max="250"
                        step="0.1"
                        value={formik.values.height}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="shadow appearance-none rounded w-full text-[12px] font-thin py-1 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200 dark:bg-zinc-800 dark:text-slate-300"
                        placeholder="Enter height"
                      />

                    </div>

                    <div className="mb-1">
                      <label
                        htmlFor="weight"
                        className="block text-slate-300 text-[12px] font-thin"
                      >
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        min="30"
                        max="200"
                        step="0.1"
                        value={formik.values.weight}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="shadow appearance-none rounded w-full text-[12px] font-thin py-1 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200 dark:bg-zinc-800 dark:text-slate-300"
                        placeholder="Enter weight"
                      />

                    </div>

                    <div className="mb-1">
                      <label
                        htmlFor="status"
                        className="block text-slate-300 text-[12px] font-thin"
                      >
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="shadow appearance-none rounded w-full text-[12px] font-thin py-1 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200 dark:bg-zinc-800 dark:text-slate-300"
                      >
                        <option value="">Select Status</option>
                        <option value="Rehabilitation">Rehabilitation</option>
                        <option value="Training">Training</option>
                      </select>

                    </div>
                  </Fragment>

                  <div className="flex flex-row gap-2 justify-end">
                    <div className="mt-1 justify-end">
                      <button
                        type="button"
                        onClick={closeNpFormModal}
                        className="inline-flex w-full justify-center rounded-md bg-neutral-800 px-2 text-[12px] font-medium text-slate-300 font-mono hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 transition-all duration-200"
                      >
                        Close
                      </button>
                    </div>
                    <div className="mt-1 justify-end">
                      <button
                        type="submit"
                        disabled={!formik.isValid || formik.isSubmitting}
                        className="inline-flex w-full justify-center rounded-md bg-neutral-800 px-2 text-[12px] font-medium text-slate-300 font-mono hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {formik.isSubmitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default NpForm;
