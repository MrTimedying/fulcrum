import React, { Fragment, useState } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { Tab } from "@headlessui/react";
import Editor from "./editor/editor";
import Profile from "./icf-dashboard/profile";
import { ReactFlowProvider } from "@xyflow/react";
import useFlowStore from "../state/flowState";
import { AccountBox, DonutLarge, Close } from "@mui/icons-material";
import { SlNote } from "react-icons/sl";
import { IoMenu } from "react-icons/io5";
import { GoProjectTemplate } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";
import { Composer } from "./editor/composer";
import useTransientStore from "../state/transientState";
import InterventionModal from "./interventionModal";
import TemplateModal from "./templateModal";
import DatepickerModal from "./dateModal";

// Bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

function MainBody() {
  const { patientId, activeTab, setActiveTab, nodes } =
    useFlowStore();
  const { setToaster } = useTransientStore();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDatepickerModalOpen, setIsDatepickerModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);


  function handleModalOpening(id) {
    // Check if a node is selected
    const nodeSelected = nodes.find((node) => node.selected);
    const multipleNodesSelected = nodes.filter((node) => node.selected).length > 1;

    if (id === "interventionMenu") {
      if (activeTab !== "Editor") {
        setToaster({
          type: "error",
          message: "Switch to the Editor tab to load or save an intervention to work on!",
          show: true,
        });
        return;
      }
      // if (!nodeSelected) {
      //   setToaster({
      //     type: "error",
      //     message: "No node is selected. Please select a node first.",
      //     show: true,
      //   });
      //   return;
      // }
      setIsInterventionModalOpen(true);
      return;
    }

        if (id === "templateMenu") {

      if (activeTab !== "Editor") {
        setToaster({
          type: "error",
          message: "Templater only works in the Editor environment.",
          show: true,
        });
        return;
      }
      setIsTemplateModalOpen(true);
      return;
    }

    if (!nodeSelected) {
      setToaster({
        type: "error",
        message: "No node is selected. Please select a node first.",
        show: true,
      });
      return;
    }

    if (multipleNodesSelected) {
      setToaster({
        type: "error",
        message: "Tools are disabled when multiple nodes are selected.",
        show: true,
      });
      return;
    }
  
    // Early return for common error states
    if (id === "composer") {
      if (!nodeSelected) {
        setToaster({
          type: "error",
          message: "No node is selected. Please select a node to edit.",
          show: true,
        });
        return;
      }
      if (
        nodeSelected.type === "bodyStructure" ||
        nodeSelected.type === "activities" ||
        nodeSelected.type === "participation"
      ) {
        setToaster({
          message: "These are just placeholders. You can't edit them.",
          type: "error",
          show: true,
        });
        return;
      }
      setIsComposerOpen(true);
      return;
    }  

    if (id === "calendarMenu") {
      if (nodeSelected.type !== 'session' || activeTab !== "Editor") {
        setToaster({
          type: "error",
          message: "Calendar only works on sessions, in the intervention editor tool only.",
          show: true,
        });
        return;
      }
      setIsDatepickerModalOpen(true);
      return;
    }
  
    // Fallback/default: no action for unknown menu
    setToaster({
      type: "error",
      message: "Unknown menu action.",
      show: true,
    });
  }
  
  

  function UtilityMenu() {
    return (
      <div className="bg-zinc-900 rounded-full h-8 flex flex-row items-center place-self-center ml-36 col-span-6">
        <button
          id="composer"
          className="bg-zinc-900 hover:bg-black/30 text-slate-300 flex justify-center items-center font-sans text-xs font-medium m-2 px-1 rounded-md cursor-pointer  transition-colors duration-200"
          onClick={(e) => handleModalOpening(e.currentTarget.id)}
        >
          <SlNote size={20} /> Composer
        </button>
        <button
          id="interventionMenu"
          className="bg-zinc-900 hover:bg-black/30 text-slate-300 flex justify-center items-center font-sans text-xs font-medium m-2 px-1 rounded-md cursor-pointer  transition-colors duration-200"
          onClick={(e) => handleModalOpening(e.currentTarget.id)}
        >
          <IoMenu size={20} /> Intervention Menu
        </button>
        <button
          id="templateMenu"
          className="bg-zinc-900 hover:bg-black/30 text-slate-300 flex justify-center items-center font-sans text-xs font-medium m-2 px-1 rounded-md cursor-pointer  transition-colors duration-200"
          onClick={(e) => handleModalOpening(e.currentTarget.id)}
        >
          <GoProjectTemplate size={20} /> Template
        </button>
        <button
          id="calendarMenu"
          className="bg-zinc-900 hover:bg-black/30 text-slate-300 flex justify-center items-center font-sans text-xs font-medium m-2 px-1 rounded-md cursor-pointer  transition-colors duration-200"
          onClick={(e) => handleModalOpening(e.currentTarget.id)}
        >
          <IoCalendarOutline size={20} /> Calendar
        </button>
      </div>
    );
  }

  function TabStructure() {
    const handleActiveTab = (tab) => {
      setActiveTab(tab);
    };

    const initialIndex = activeTab === "Profile" ? 0 : 1;

    return (
      <Tab.Group 
        as="div" 
        className="flex flex-col h-full w-full"
        defaultIndex={initialIndex}>
        <div className="grid grid-cols-11 h-14 bg-zinc-850 w-full mb-2">
          <div className="bg-zinc-900 rounded-full h-8 flex flex-row items-center place-self-center ml-36 col-span-4">
            <Tab.List className="flex mx-auto h-auto text-xs">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    onClick={() => handleActiveTab("Profile")}
                    className={`my-2 ${
                      selected
                        ? "mx-2 rounded-none text-gray-300 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-indigo-500"
                        : "mx-2 text-gray-300 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                    }`}
                  >
                    <AccountBox /> Profile
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    onClick={() => handleActiveTab("Editor")}
                    className={`my-2 ${
                      selected
                        ? "mx-2 rounded-none text-gray-300 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-indigo-500"
                        : "mx-2 text-gray-300 hover:text-white px-1 cursor-pointer focus:outline-none focus:text-white font-medium transition duration-300 border-b-2 border-transparent"
                    }`}
                  >
                    <DonutLarge /> Editor
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
              <Profile isInspectorOpen={isInspectorOpen} setIsInspectorOpen={setIsInspectorOpen} />
            </ReactFlowProvider>
          </Tab.Panel>
          <Tab.Panel key="interventionEditor" className="h-full">
            <ReactFlowProvider>
              <Editor isInspectorOpen={isInspectorOpen} setIsInspectorOpen={setIsInspectorOpen} />
            </ReactFlowProvider>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    );
  }

  if (patientId) {
    return (
      <div
        className="w-4/5 bg-neutral-800 p-4 h-full"
        style={{ borderLeft: "solid 2px #1c1c1c" }}
      >
        {TabStructure()}
        <Composer
          isComposerOpen={isComposerOpen}
          setIsComposerOpen={setIsComposerOpen} />
        <InterventionModal 
          isOpen={isInterventionModalOpen}
          onClose={() => setIsInterventionModalOpen(false)}  />
        <TemplateModal 
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)} />
        <DatepickerModal
          isOpen={isDatepickerModalOpen}
          onClose={() => setIsDatepickerModalOpen(false)} />
      </div>
    );
  } else {
    return (
      <div
        className="w-4/5 flex items-center justify-center text-stone-400 bg-neutral-800 p-4 h-full"
        style={{ borderLeft: "solid 2px #1c1c1c" }}
      >
        Select a patient to view their information.
        <button
          onClick={() => {
            localStorage.removeItem("flow-store");
            window.location.reload();
          }}
          style={{ position: "fixed", bottom: 10, right: 10 }}
        >
          Reset Store
        </button>
      </div>
    );
  }
}

export default MainBody;
