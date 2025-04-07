import React, { Fragment, useState } from "react";
import Modal from 'react-modal';
import { Rnd } from 'react-rnd';
import { Tab } from "@headlessui/react";
import Editor from "./editor/editor";
import Profile from "./icf-dashboard/profile";
import { ReactFlowProvider } from "@xyflow/react";
import useTransientStore from "../state/transientState";
import { AccountBox, DonutLarge, Close } from "@mui/icons-material";
import { Composer } from "./editor/composer";

// Bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

function MainBody() {
  const patientID = useTransientStore((state) => state.patientID);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Profile');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal styles
  const modalStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
    },
    content: {
      background: 'transparent',
      border: 'none',
      padding: 0,
      inset: 0,
      overflow: 'hidden',
    }
  };

  // Default modal dimensions
  const defaultModalConfig = {
    width: 800,
    height: 600,
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 300,
  };

  function ModalComposer() {
    return (
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={modalStyles}
        contentLabel="Composer Modal"
      >
        <Rnd
          default={defaultModalConfig}
          minWidth={400}
          minHeight={300}
          bounds="window"
          dragHandleClassName="modal-handle"
        >
          <div className="w-full h-full bg-zinc-900 rounded-lg shadow-xl overflow-hidden flex flex-col">
            {/* Modal Header - Drag Handle */}
            <div className="modal-handle bg-zinc-800 px-4 py-3 flex justify-between items-center cursor-move">
              <h3 className="text-gray-200 font-medium">Composer</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <Close />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4">
              <Composer />
            </div>
          </div>
        </Rnd>
      </Modal>
    );
  }

  function UtilityMenu() {
    return (
      <button
        id="createPhase"
        className="bg-zinc-900 hover:bg-black/30 text-slate-300 w-16 font-mono m-2 px-1 rounded-md cursor-pointer text-sm transition-colors duration-200"
        onClick={() => setIsModalOpen(true)}
      >
        <AccountBox />
      </button>
    );
  }

  function TabStructure() {
    return (
      <Tab.Group as="div" className="flex flex-col h-full w-full">
        <div className="grid grid-cols-11 h-14 bg-zinc-850 w-full mb-2">
          <div className="bg-zinc-900 rounded-full h-8 flex flex-row items-center place-self-center ml-36 col-span-10">
            <Tab.List className="flex mx-auto h-auto text-xs">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    onClick={() => setSelectedTab('Profile')}
                    className={`my-2 ${
                      selected
                        ? "mx-2 rounded-none text-gray-300 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-indigo-500"
                        : "mx-2 text-gray-300 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                    }`}
                  >
                    <AccountBox />
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    onClick={() => setSelectedTab('Editor')}
                    className={`my-2 ${
                      selected
                        ? "mx-2 rounded-none text-gray-300 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-indigo-500"
                        : "mx-2 text-gray-300 hover:text-white px-1 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                    }`}
                  >
                    <DonutLarge />
                  </button>
                )}
              </Tab>
            </Tab.List>
          </div>
          <UtilityMenu />
        </div>

        <Tab.Panels className="h-full overflow-y-auto">
          <Tab.Panel key="icfProfile" className="h-full">
          <ReactFlowProvider>
            <Profile />
            </ReactFlowProvider>
          </Tab.Panel>
          <Tab.Panel key="internvetionEditor" className="h-full">
            <ReactFlowProvider>
              <Editor isExpanded={isExpanded} isModalOpen={isModalOpen} />
            </ReactFlowProvider>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    );
  }

  if (patientID) {
    return (
      <div className="w-4/5 bg-neutral-800 p-4 h-full" style={{borderLeft: "solid 2px #1c1c1c"}}>
        {TabStructure()}
        <ModalComposer />
      </div>
    );
  } else {
    return (
      <div className="w-4/5 flex items-center justify-center text-stone-400 bg-neutral-800 p-4 h-full" style={{borderLeft: "solid 2px #1c1c1c"}}>
        Select a patient to view their information.
      </div>
    );
  }
}

export default MainBody;
