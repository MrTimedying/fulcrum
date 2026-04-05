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
import SessionEditor from "./editor/SessionEditor";
import useTransientStore from "../state/transientState";
import InterventionModal from "./interventionModal";
import TemplateModal from "./templateModal";
import DatepickerModal from "./dateModal";
import FlowControls from "./controls/flowControls";
import PopPrimitive from "./controls/popPrimitive";
import StyleMenu from "./controls/styleMenu";
import BulkExerciseEditModal from "./BulkExerciseEditModal";
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

  // Handler to receive single node selection status from Editor
  const handleEditorSingleNodeSelectedChange = useCallback((isSelected) => {
      setIsEditorSingleNodeSelected(isSelected);
  }, []);

  // Handler to open Bulk Edit Modal (called by FlowControls)
  const handleOpenBulkEditModal = useCallback(() => {
      const selectedNode = nodes.find((node) => node.selected);

      if (!isEditorSingleNodeSelected || !selectedNode) {
          setToaster({
              type: "info",
              message: "Please select a single node to bulk edit its subtree exercises.",
              show: true,
          });
          return;
      }

      const { nodes: allDescendantNodes } = getAllDescendants(selectedNode.id, nodes, edges);
      const sessionNodes = allDescendantNodes.filter(node => node.type === 'session');

      if (sessionNodes.length === 0) {
           setToaster({
              type: "info",
              message: "No Session nodes found in the selected subtree to bulk edit.",
              show: true,
          });
          return;
      }

      setTargetSessionNodes(sessionNodes);
      setIsBulkEditModalOpen(true);
  }, [nodes, edges, isEditorSingleNodeSelected, setToaster]);

  const handleCloseBulkEditModal = useCallback(() => {
      setIsBulkEditModalOpen(false);
      setTargetSessionNodes([]);
  }, []);

  useEffect(() => {
    if (isFeaturesMenuOpen) {
      setActiveMenu('features');
    } else if (isStyleMenuOpen) {
      setActiveMenu('style');
    } else {
      setActiveMenu(null);
    }
  }, [isFeaturesMenuOpen, isStyleMenuOpen]);

  useEffect(() => {
    if (activeTab === "Profile" && patientId && nodes.length > 0) {
      const profileNode = nodes.find(node => node.type === "profile");
      if (profileNode && patients[patientId]) {
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
    const nodeSelectedInEditor = nodes.find(node => node.selected);
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

    if (!nodeSelectedInEditor) {
      setToaster({
        type: "error",
        message: "No node is selected. Please select a node first.",
        show: true,
      });
      return;
    }

     if (multipleNodesSelectedInEditor) {
      setToaster({
        type: "error",
        message: "Tools are disabled when multiple nodes are selected.",
        show: true,
      });
      return;
    }

    if (id === "calendarMenu") {
      if (nodeSelectedInEditor.type !== 'session' || activeTab !== "Editor") {
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

    setToaster({
      type: "error",
      message: "Unknown menu action.",
      show: true,
    });
  }

  function UtilityMenu() {
    return (
      <div className="flex flex-col ">
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
    return (
      <div className="flex flex-col h-full w-full">
        {activeTab === "Profile" ? (
          <div key="icfProfile" className="h-full">
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
            </ReactFlowProvider>
          </div>
        ) : (
          <div key="interventionEditor" className="h-full">
            <SessionEditor />
          </div>
        )}
      </div>
    );
  }

  if (patientId) {
    return (
      <div className="bg-neutral-800 h-full">
        <ReactFlowProvider>
          {TabStructure()}

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
                singleNodeSelected={activeTab === "Editor" ? isEditorSingleNodeSelected : false}
                setIsICFSetsModalOpen={setIsICFSetsModalOpen}
                isICFSetsModalOpen={isICFSetsModalOpen}
              />
          </div>

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
        </ReactFlowProvider>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center text-stone-400 bg-neutral-800 p-4 h-full">
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