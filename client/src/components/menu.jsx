import { Menu, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useNavigate } from "react-router-dom";
import NpForm from './npform';
import useFlowStore from '../state/flowState';

export default function MyDropdown({ formData, setFormData, setFetchingSwitch, handleEditPatient }) {
  const [isNpFormModalOpen, setIsNpFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { patientId, setPatientId, removePatient, patients } = useFlowStore();

  const closeNpFormModal = () => {
    setIsNpFormModalOpen(false);
    setFormData({
      name: "",
      surname: "",
      age: "",
      gender: "",
      bmi: "",
      height: "",
      weight: "",
      status: "",
    });
  };

  const handlePatientCreation = () => {
    handleEditPatient();
  }

  const handlePatientDelete = (patientId) => {
    removePatient(patientId);
    navigate(`/`);
    setPatientId("");
  };

  return (
    <div className="px-2 z-10">
      <Menu as="div" className="relative inline-block text-right">
        <div>
          <Menu.Button className="inline-flex w-full justify-center border border-zinc-700 rounded-md bg-zinc-900 px-2 py-1 text-[10px] text-slate-300 font-sans hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
            Options
            <ChevronDownIcon
              className="ml-2 -mr-1 h-4 w-4 text-white"
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
          <Menu.Items className="absolute min-w-24 right-0 text-[10px] mt-2 origin-top-right divide-y border border-zinc-700 divide-gray-100 rounded-md bg-neutral-900 shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handlePatientCreation()}
                    className={`${
                      active ? "bg-gray-500 text-white" : "text-slate-300"
                    }  w-full px-2 py-1 `}
                  >
                    
                    <p>New Patient</p>
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handlePatientDelete(patientId)}
                    className={`${
                      active ? "bg-gray-500 text-white" : "text-slate-300"
                    }  w-full items-center px-2 py-1 `}
                  >
                    
                    <p>Delete Patient</p>
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <NpForm
        isOpen={isNpFormModalOpen}
        closeModal={closeNpFormModal}
        formData={formData}
        setFormData={setFormData}
        setFetchingSwitch={setFetchingSwitch}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    </div>
  );
}





