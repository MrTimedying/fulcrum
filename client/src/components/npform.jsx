import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import persistentStore from "../state/persistentState";
import { v4 as uuidv4 } from 'uuid';
import useFlowStore from "../state/flowState";




function NpForm({ isOpen, closeModal, formData, setFormData, setFetchingSwitch, isEditing, setIsEditing }) {

  const {setEditorState, setProfileState} = useFlowStore();
  
  

  const handleSubmit = () => {
    const patientId = formData.PatientId || uuidv4();
    const heightInMeters = formData.Height / 100;
    const weight = formData.Weight;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    const formDataWithBMI = { ...formData, BMI: bmi };
    persistentStore.getState().addPatient(patientId, formDataWithBMI);
    setEditorState(patientId);
    setProfileState(patientId);
    closeModal();
    console.log(persistentStore.getState().patients);
  };

  return (
    <>
      <Transition show={isOpen}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
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

            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left font-mono text-slate-300 align-middle transition-all transform bg-zinc-900 shadow-xl rounded-2xl">
              {/* Modal content goes here */}
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-slate-300"
              >
                Creating a New Patient entry
              </Dialog.Title>
              <div className="mt-2">
                <form>
                  <Fragment>
                    <div className="mb-4">
                      <label
                        htmlFor="Name"
                        className="block text-slate-300 text-sm font-bold mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="Name"
                        name="Name"
                        value={formData.Name} // Add value
                        onChange={(e) =>
                          setFormData({ ...formData, Name: e.target.value })
                        }
                        className="shadow appearance-none rounded w-full py-2 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="Surname"
                        className="block text-slate-300 text-sm font-bold mb-2"
                      >
                        Surname
                      </label>
                      <input
                        type="text"
                        id="Surname"
                        name="Surname"
                        value={formData.Surname} // Add value
                        onChange={(e) =>
                          setFormData({ ...formData, Surname: e.target.value })
                        }
                        className="shadow appearance-none rounded w-full py-2 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="Age"
                        className="block text-slate-300 text-sm font-bold mb-2"
                      >
                        Age
                      </label>
                      <select
                        id="Age"
                        name="Age"
                        value={formData.Age} // Add value
                        onChange={(e) =>
                          setFormData({ ...formData, Age: e.target.value })
                        }
                        className="shadow appearance-none rounded w-full py-2 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">Select Age</option>
                        {Array.from({ length: 90 }, (_, i) => (
                          <option key={i + 10} value={i + 10}>
                            {i + 10}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="Gender"
                        className="block text-slate-300 text-sm font-bold mb-2"
                      >
                        Gender
                      </label>
                      <select
                        id="Gender"
                        name="Gender"
                        value={formData.Gender} // Add value
                        onChange={(e) =>
                          setFormData({ ...formData, Gender: e.target.value })
                        }
                        className="shadow appearance-none rounded w-full py-2 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="Height"
                        className="block text-slate-300 text-sm font-bold mb-2"
                      >
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        id="Height"
                        name="Height"
                        min="100"
                        max="250"
                        step="0.1"
                        value={formData.Height} // Add value
                        onChange={(e) =>
                          setFormData({ ...formData, Height: e.target.value })
                        }
                        className="shadow appearance-none rounded w-full py-2 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="Weigth"
                        className="block text-slate-300 text-sm font-bold mb-2"
                      >
                        Weight (Kg)
                      </label>
                      <input
                        type="number"
                        id="Weight"
                        name="Weight"
                        min="30"
                        max="200"
                        step="0.1"
                        value={formData.Weight} // Add value
                        onChange={(e) =>
                          setFormData({ ...formData, Weight: e.target.value })
                        }
                        className="shadow appearance-none rounded w-full py-2 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="Status"
                        className="block text-slate-300 text-sm font-bold mb-2"
                      >
                        Status
                      </label>
                      <select
                        id="Status"
                        name="Status"
                        value={formData.Status} // Add value
                        onChange={(e) =>
                          setFormData({ ...formData, Status: e.target.value })
                        }
                        className="shadow appearance-none rounded w-full py-2 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="">Select Status</option>
                        <option value="Rehabilitation">Rehabilitation</option>
                        <option value="Training">Training</option>
                      </select>
                    </div>
                  </Fragment>
                </form>
              </div>

              <div className="flex flex-row justify-between">
                <div className="mt-4 justify-end">
                  <button
                    onClick={handleSubmit}
                    className="inline-flex w-full justify-center rounded-md bg-zinc-950 px-2 py-2 text-sm font-medium text-slate-300 font-mono hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                  >
                    Save
                  </button>
                </div>
                <div className="mt-4 justify-start">
                  <button
                    onClick={closeModal}
                    className="inline-flex w-full justify-center rounded-md bg-zinc-950 px-2 py-2 text-sm font-medium text-slate-300 font-mono hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default NpForm;
