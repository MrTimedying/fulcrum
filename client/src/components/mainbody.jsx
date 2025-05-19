import React, { Fragment, useState, useEffect } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { Tab } from "@headlessui/react";
import Editor from "./editor/editor";
import Profile from "./icf-dashboard/profile";
import { ReactFlowProvider } from "@xyflow/react";
import useFlowStore from "../state/flowState";
import { AiOutlineSave } from "react-icons/ai";
import { GiNotebook } from "react-icons/gi";
import { GoProjectTemplate } from "react-icons/go";
import { IoCalendarOutline } from "react-icons/io5";
import { Composer } from "./editor/composer";
import useTransientStore from "../state/transientState";
import InterventionModal from "./interventionModal";
import TemplateModal from "./templateModal";
import DatepickerModal from "./dateModal";
import FlowControls from "./controls/flowControls";
import PopPrimitive from "./controls/popPrimitive";
import StyleMenu from "./controls/styleMenu";

// Bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

function MainBody() {
  const { patientId, activeTab, setActiveTab, nodes, setNodes } =
    useFlowStore();
  const { setToaster } = useTransientStore();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDatepickerModalOpen, setIsDatepickerModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Update activeMenu when either menu state changes
  useEffect(() => {
    if (isFeaturesMenuOpen) {
      setActiveMenu('features');
    } else if (isStyleMenuOpen) {
      setActiveMenu('style');
    } else {
      setActiveMenu(null);
    }
  }, [isFeaturesMenuOpen, isStyleMenuOpen]);

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
      <div className="flex flex-col ">
        {/* <p className="font-light text-xl text-zinc-300 p-1">@ Utility Menu</p> */}
        
        <button
          id="composer"
          className=" hover:bg-zinc-700 text-slate-300 flex justify-start gap-2 font-sans text-xs m-2 px-1 rounded-md cursor-pointer  transition-colors duration-200"
          onClick={(e) => handleModalOpening(e.currentTarget.id)}
        >
          <GiNotebook className="text-lg font-extralight" /> Data
        </button>
        <button
          id="interventionMenu"
          className=" hover:bg-zinc-700 text-slate-300 flex justify-start gap-2 font-sans text-xs m-2 px-1 rounded-md cursor-pointer  transition-colors duration-200"
          onClick={(e) => handleModalOpening(e.currentTarget.id)}
        >
          <AiOutlineSave className="text-lg font-extralight"/> Save/Load
        </button>
        <button
          id="templateMenu"
          className=" hover:bg-zinc-700 text-slate-300 flex justify-start gap-2 font-sans text-xs m-2 px-1 rounded-md cursor-pointer  transition-colors duration-200"
          onClick={(e) => handleModalOpening(e.currentTarget.id)}
        >
          <GoProjectTemplate className="text-lg font-extralight" /> Template Nodes
        </button>
        <button
          id="calendarMenu"
          className=" hover:bg-zinc-700 text-slate-300 flex justify-start gap-2 font-sans text-xs m-2 px-1 rounded-md cursor-pointer  transition-colors duration-200"
          onClick={(e) => handleModalOpening(e.currentTarget.id)}
        >
          <IoCalendarOutline className="text-lg font-extralight" /> Schedule Session
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
        <div className="flex flex-row w-full bg-zinc-900">
          <div className="h-8 flex flex-row items-center place-self-center">
            <Tab.List className="flex mx-auto h-auto text-xl font-extralight">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    onClick={() => handleActiveTab("Profile")}
                    className={`my-2  ${
                      selected
                        ? " rounded-none bg-zinc-800 text-gray-300 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white"
                        : " text-gray-300 text-opacity-30 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white transition duration-300 "
                    }`}
                  >
                    # Profile
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    onClick={() => handleActiveTab("Editor")}
                    className={`my-2  ${
                      selected
                        ? " rounded-none bg-zinc-800 text-gray-300 hover:text-white p-1 cursor-pointer focus:outline-none focus:text-white "
                        : " text-gray-300 text-opacity-30 hover:text-white px-1 cursor-pointer focus:outline-none focus:text-white transition duration-300 "
                    }`}
                  >
                    # Editor
                  </button>
                )}
              </Tab>
            </Tab.List>
          </div>
          {/* <UtilityMenu /> */}
        </div>

        <Tab.Panels className="h-full overflow-y-auto">
          <Tab.Panel key="icfProfile" className="h-full">
            <ReactFlowProvider>
              <Profile isInspectorOpen={isInspectorOpen} setIsInspectorOpen={setIsInspectorOpen} />
              <div className="absolute bottom-4 left-4 z-10">
                
                <PopPrimitive 
                  isOpen={isFeaturesMenuOpen || isStyleMenuOpen} 
                  onClose={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsStyleMenuOpen(false);
                  }}
                  menuType="features"
                  activeMenu={activeMenu}
                >
                  <StyleMenu nodes={nodes} setNodes={setNodes} />
                </PopPrimitive>
                <PopPrimitive 
                  isOpen={isFeaturesMenuOpen || isStyleMenuOpen} 
                  onClose={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsStyleMenuOpen(false);
                  }}
                  menuType="style"
                  activeMenu={activeMenu}
                >
                  <UtilityMenu />
                </PopPrimitive>
                <FlowControls 
                  setIsFeaturesMenuOpen={setIsFeaturesMenuOpen} 
                  setIsStyleMenuOpen={setIsStyleMenuOpen} 
                />
              </div>
            </ReactFlowProvider>
          </Tab.Panel>
          <Tab.Panel key="interventionEditor" className="h-full">
            <ReactFlowProvider>
              <Editor isInspectorOpen={isInspectorOpen} setIsInspectorOpen={setIsInspectorOpen} />
              <div className="absolute bottom-4 left-4 z-10">
                
                <PopPrimitive 
                  isOpen={isFeaturesMenuOpen || isStyleMenuOpen} 
                  onClose={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsStyleMenuOpen(false);
                  }}
                  menuType="features"
                  activeMenu={activeMenu}
                >
                  <StyleMenu nodes={nodes} setNodes={setNodes} />
                </PopPrimitive>
                <PopPrimitive 
                  isOpen={isFeaturesMenuOpen || isStyleMenuOpen} 
                  onClose={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsStyleMenuOpen(false);
                  }}
                  menuType="style"
                  activeMenu={activeMenu}
                >
                  <UtilityMenu />
                </PopPrimitive>
                <FlowControls 
                  setIsFeaturesMenuOpen={setIsFeaturesMenuOpen} 
                  setIsStyleMenuOpen={setIsStyleMenuOpen} 
                />
              </div>
            </ReactFlowProvider>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    );
  }

  if (patientId) {
    return (
      <div
        className=" bg-neutral-800 h-full"
        
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
        className="flex items-center justify-center text-stone-400 bg-neutral-800 p-4 h-full"
        // style={{ borderLeft: "solid 2px #1c1c1c" }}
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
