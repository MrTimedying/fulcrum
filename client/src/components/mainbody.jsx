import React, { Fragment, useState, useEffect, useCallback } from "react";
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
import BulkExerciseEditModal from "./BulkExerciseEditModal";
import BulkNodeDataModal from "./editor/bulk_node_modal/BulkNodeDataModal";
import NpForm from "./npform";
import ICFSetsModal from "./icf-dashboard/ICFSetsModal";

// Bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

// Helper: Gather descendants and their edges given a parent nodeId (Copied from templateModal.jsx)
function getAllDescendants(parentNodeId, nodes, edges) {
  if (!parentNodeId) return { nodes: [], edges: [] };
  const descendants = new Set();
  const connectingEdges = new Set();
  const queue = [parentNodeId];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const edge of edges) {
      if (edge.source === current && !descendants.has(edge.target)) {
        descendants.add(edge.target);
        connectingEdges.add(edge.id);
        queue.push(edge.target);
      }
    }
  }
  // Include parent node in results
  const nodeSet = new Set([parentNodeId, ...descendants]);
  return {
    nodes: nodes.filter(n => nodeSet.has(n.id)),
    edges: edges.filter(e =>
      nodeSet.has(e.source) &&
      nodeSet.has(e.target)
    ),
  };
}

function MainBody({ handleEditPatient }) {
  const { patientId, activeTab, setActiveTab, nodes, setNodes, edges, patients } = useFlowStore();
  const { setToaster } = useTransientStore();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isDatepickerModalOpen, setIsDatepickerModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isICFSetsModalOpen, setIsICFSetsModalOpen] = useState(false);

  // State for Bulk Exercise Edit Modal
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [targetSessionNodes, setTargetSessionNodes] = useState([]);
  const [isEditorSingleNodeSelected, setIsEditorSingleNodeSelected] = useState(false); // To track selection in Editor

  // State for Bulk Node Data Modal
  const [isBulkNodeDataModalOpen, setIsBulkNodeDataModalOpen] = useState(false);

  // Handler to receive single node selection status from Editor
  const handleEditorSingleNodeSelectedChange = useCallback((isSelected) => {
      setIsEditorSingleNodeSelected(isSelected);
  }, []);

  // Handler to open Bulk Edit Modal (called by FlowControls)
  const handleOpenBulkEditModal = useCallback(() => {
      // This logic was moved from editor.jsx
      const selectedNode = nodes.find((node) => node.selected); // Find the actually selected node from global state

      if (!isEditorSingleNodeSelected || !selectedNode) { // Use the status reported by Editor
          setToaster({
              type: "info",
              message: "Please select a single node to bulk edit its subtree exercises.",
              show: true,
          });
          return;
      }

      console.log("Opening bulk edit modal for subtree of node:", selectedNode.id);

      // 1. Get all descendants using the helper
      const { nodes: allDescendantNodes } = getAllDescendants(selectedNode.id, nodes, edges);

      // 2. Filter for only Session nodes
      const sessionNodes = allDescendantNodes.filter(node => node.type === 'session');

      if (sessionNodes.length === 0) {
           setToaster({
              type: "info",
              message: "No Session nodes found in the selected subtree to bulk edit.",
              show: true,
          });
          return;
      }

      console.log("Target Session nodes for bulk edit:", sessionNodes.map(n => n.id));

      // 3. Set state and open the modal
      setTargetSessionNodes(sessionNodes);
      setIsBulkEditModalOpen(true);

  }, [nodes, edges, isEditorSingleNodeSelected, setToaster]); // Depend on nodes and edges from store

  // Handler to close Bulk Edit Modal
  const handleCloseBulkEditModal = useCallback(() => {
      setIsBulkEditModalOpen(false);
      setTargetSessionNodes([]); // Clear target nodes when closing
  }, []);

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

  // Effect to synchronize profile node data with patient data when patient data changes
  useEffect(() => {
    if (activeTab === "Profile" && patientId && nodes.length > 0) {
      // Find profile node
      const profileNode = nodes.find(node => node.type === "profile");
      if (profileNode && patients[patientId]) {
        // Compare data to see if update is needed
        const patientData = patients[patientId];
        const nodeNeedsUpdate = 
          profileNode.data.name !== patientData.name ||
          profileNode.data.surname !== patientData.surname ||
          profileNode.data.age !== patientData.age ||
          profileNode.data.gender !== patientData.gender ||
          profileNode.data.height !== patientData.height ||
          profileNode.data.weight !== patientData.weight ||
          profileNode.data.status !== patientData.status ||
          profileNode.data.bmi !== patientData.bmi;
        
        if (nodeNeedsUpdate) {
          // Update the node data with latest patient data
          setNodes(nds => nds.map(n => 
            n.id === profileNode.id 
              ? { ...n, data: { ...n.data, ...patientData, PatientId: patientId } } 
              : n
          ));
        }
      }
    }
  }, [patients, patientId, activeTab, nodes, setNodes]);

  function handleModalOpening(id) {
    // Check if a node is selected - Use the status from Editor
    // Note: The actual selected node object is accessed directly in handleOpenBulkEditModal
    const nodeSelectedInEditor = nodes.find(node => node.selected); // Still need to find the node for other modals
    const multipleNodesSelectedInEditor = nodes.filter(node => node.selected).length > 1;

    if (id === "interventionMenu") {
      if (activeTab !== "Editor") {
        setToaster({
          type: "error",
          message: "Switch to the Editor tab to load or save an intervention to work on!",
          show: true,
        });
        return;
      }
      // if (!nodeSelectedInEditor) {
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

    // Check selection status using the state updated by Editor
    if (!nodeSelectedInEditor) { // Use the node object for checks relevant to specific modals
      setToaster({
        type: "error",
        message: "No node is selected. Please select a node first.",
        show: true,
      });
      return;
    }

     if (multipleNodesSelectedInEditor) { // Use the node object for checks relevant to specific modals
      setToaster({
        type: "error",
        message: "Tools are disabled when multiple nodes are selected.",
        show: true,
      });
      return;
    }

    // Early return for common error states
    if (id === "composer") {
      // Open Bulk Node Data Modal instead of the old composer for Data functionality
      if (activeTab !== "Editor") {
        setToaster({
          type: "error",
          message: "Data editing is only available in the Editor tab.",
          show: true,
        });
        return;
      }

      if (!nodeSelectedInEditor) {
        setToaster({
          type: "error",
          message: "Please select a node to edit its data and descendants.",
          show: true,
        });
        return;
      }

      if (multipleNodesSelectedInEditor) {
        setToaster({
          type: "error",
          message: "Please select only one node for bulk data editing.",
          show: true,
        });
        return;
      }

      setIsBulkNodeDataModalOpen(true);
      return;
    }  

    if (id === "calendarMenu") {
      if (nodeSelectedInEditor.type !== 'session' || activeTab !== "Editor") { // Use node object for type check
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
              <Profile 
                isInspectorOpen={isInspectorOpen} 
                setIsInspectorOpen={setIsInspectorOpen}
                handleEditPatient={handleEditPatient}
              />
              <ICFSetsModal
                isOpen={activeTab === "Profile" && isICFSetsModalOpen}
                onClose={() => setIsICFSetsModalOpen(false)}
              />
              {/* FlowControls for Profile tab */}
              <div className="absolute bottom-4 left-4 z-10">
                <PopPrimitive
                  isOpen={isStyleMenuOpen || isFeaturesMenuOpen}
                  onClose={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsStyleMenuOpen(false);
                  }}
                  menuType="style"
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
                  menuType="features"
                  activeMenu={activeMenu}
                >
                  <UtilityMenu />
                </PopPrimitive>
                <FlowControls
                  setIsFeaturesMenuOpen={setIsFeaturesMenuOpen}
                  setIsStyleMenuOpen={setIsStyleMenuOpen}
                  handleOpenBulkEditModal={handleOpenBulkEditModal}
                  singleNodeSelected={false} // Profile tab doesn't use single node selection
                  setIsICFSetsModalOpen={setIsICFSetsModalOpen}
                  isICFSetsModalOpen={isICFSetsModalOpen}
                />
              </div>
            </ReactFlowProvider>
          </Tab.Panel>
          <Tab.Panel key="interventionEditor" className="h-full">
            <ReactFlowProvider>
              {/* Pass handler to Editor */} {/* Report selection status back to MainBody */}
              <Editor
                  isInspectorOpen={isInspectorOpen}
                  setIsInspectorOpen={setIsInspectorOpen}
                  onOpenBulkEditRequest={handleOpenBulkEditModal}
                  onSingleNodeSelectedChange={handleEditorSingleNodeSelectedChange}
              />
              {/* FlowControls for Editor tab */}
              <div className="absolute bottom-4 left-4 z-10">
                <PopPrimitive
                  isOpen={isStyleMenuOpen || isFeaturesMenuOpen}
                  onClose={() => {
                    setIsFeaturesMenuOpen(false);
                    setIsStyleMenuOpen(false);
                  }}
                  menuType="style"
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
                  menuType="features"
                  activeMenu={activeMenu}
                >
                  <UtilityMenu />
                </PopPrimitive>
                <FlowControls
                  setIsFeaturesMenuOpen={setIsFeaturesMenuOpen}
                  setIsStyleMenuOpen={setIsStyleMenuOpen}
                  handleOpenBulkEditModal={handleOpenBulkEditModal}
                  singleNodeSelected={isEditorSingleNodeSelected}
                  setIsICFSetsModalOpen={setIsICFSetsModalOpen}
                  isICFSetsModalOpen={isICFSetsModalOpen}
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
          <BulkExerciseEditModal
              isOpen={isBulkEditModalOpen}
              onClose={handleCloseBulkEditModal}
              targetSessionNodes={targetSessionNodes}
          />
          <BulkNodeDataModal
            isOpen={isBulkNodeDataModalOpen}
            onClose={() => setIsBulkNodeDataModalOpen(false)}
          />
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
