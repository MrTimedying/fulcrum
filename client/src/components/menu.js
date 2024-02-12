import { Menu, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useNavigate } from "react-router-dom";
import NpForm from './npform'
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080"
});

export default function MyDropdown({patientID, setPatientID, formData, setFormData, setFetchingSwitch}) {
  const [isNpFormModalOpen, setIsNpFormModalOpen] = useState(false);
  const navigate = useNavigate();
  


  const closeNpFormModal = () => {
    setIsNpFormModalOpen(false);
    setFormData({
      Name: "",
      Surname: "",
      Age: "",
      Gender: "",
      BMI: "",
      Height: "",
      Weight: "",
      Status: "",
    });
  };

  const handlePatientCreation = () => {

    setIsNpFormModalOpen(true);
    setFormData({
      Name: "",
      Surname: "",
      Age: "",
      Gender: "",
      BMI: "",
      Height: "",
      Weight: "",
      Status: "",
    });
    
  }

  const handlePatientEdit = (patientID) => {
    console.log(patientID);
    api
    .get('api/patients', { params: { id: patientID}})
    .then(function (response){
      const patientData = response.data.find(patient => patient.ID === parseInt(patientID))
      setFormData(patientData);
    }).catch(function (error){
      console.log(error);
    })
    setIsNpFormModalOpen(true);
  };

  const handlePatientDelete = (patientID) => {
    const ID = parseInt(patientID);
    console.log(ID);

    api
        .delete("api/patients", { params: { ID: ID } })
        .then(function (response) {
            console.log(response);
            return api.delete(`api/profile?ID=${ID}`);
        })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
            // Handle errors for patient and profile deletion if needed
        });
    setPatientID(0);
    navigate(`/`)
    setFetchingSwitch(true);
};


  return (
    <div className="px-2">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-slate-300 font-mono hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
            Options
            <ChevronDownIcon
              className="ml-2 -mr-1 h-5 w-5 text-white"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-zinc-900 shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handlePatientCreation()}
                    className={`${
                      active ? 'bg-gray-500 text-white' : 'text-slate-300'
                    } group flex w-full rounded-md px-2 py-2 text-sm`}
                  >
                    {active ? (
                      <NewPatientActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <NewPatientInactiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    )}
                    <div className='pl-4 w-full text-left'>New Patient</div>
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handlePatientEdit(patientID)}
                    className={`${
                      active ? 'bg-gray-500 text-white' : 'text-slate-300'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {active ? (
                      <EditActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <EditInactiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    )}
                    <div className='pl-4 w-full text-left'>Edit Patient</div>
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handlePatientDelete(patientID)}
                    className={`${
                      active ? 'bg-gray-500 text-white' : 'text-slate-300'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {active ? (
                      <DeleteActiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <DeleteInactiveIcon
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                    )}
                    <div className='pl-4 w-full text-left'>Delete Patient</div>
                  </button>
                )}
              </Menu.Item>
              </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <NpForm isOpen={isNpFormModalOpen} closeModal={closeNpFormModal} formData={formData} setFormData={setFormData} setFetchingSwitch={setFetchingSwitch} />
    </div>
  )
}

// NewPatientActiveIcon
function NewPatientActiveIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

// NewPatientInactiveIcon
function NewPatientInactiveIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

// EditInactiveIcon
function EditInactiveIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.331 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

// EditActiveIcon
function EditActiveIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.331 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

// DeleteInactiveIcon
function DeleteInactiveIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
      />
    </svg>
  );
}

// DeleteActiveIcon
function DeleteActiveIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
      />
    </svg>
  );
}
