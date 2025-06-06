import React, { useState } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { Tab } from "@headlessui/react";
import useFlowStore from "../state/flowState";
import useTransientStore from "../state/transientState";
import { Close, Save } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

const InterventionModal = ({ isOpen, onClose }) => {
  const { nodes, edges, patientId, interventions, addIntervention, loadIntervention, removeIntervention } = useFlowStore();
  const { setToaster } = useTransientStore();
  const [newInterventionName, setNewInterventionName] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const defaultModalConfig = {
    width: 800,
    height: 600,
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 300,
  };

  function handleSaveIntervention() {
    if (!newInterventionName.trim()) {
      setToaster({
        type: "error",
        message: "Please enter a name for the intervention",
        show: true,
      });
      return;
    }

    // Check for duplicate names
    const existingInterventions = interventions[patientId] || [];
    if (existingInterventions.some((i) => i.name === newInterventionName)) {
      setToaster({
        type: "error",
        message: "An intervention with this name already exists",
        show: true,
      });
      return;
    }

    // Save intervention logic here
    const newIntervention = {
      id: uuidv4(),
      name: newInterventionName,
      date: new Date().toISOString().split('T')[0],
      nodes: nodes,
      edges: edges,
    };

    addIntervention(patientId, newIntervention);
    setNewInterventionName("");
    setToaster({
      type: "success",
      message: "Intervention saved successfully",
      show: true,
    });
  }

  function handleLoadIntervention(patientId, interventionId) {
    const intervention = interventions[patientId]?.find(
      (i) => i.id === interventionId
    );
  
    if (!intervention) {
      setToaster({
        type: "error",
        message: "Intervention not found.",
        show: true,
      });
      return;
    }
  
    loadIntervention(patientId, interventionId);
  
    setToaster({
      type: "success",
      message: `Loaded intervention: ${intervention.name}`,
      show: true,
    });
  
    onClose();
  }
  

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      aria={{
        labelledby: "intervention-management-title",
        describedby: "intervention-management-description",
      }}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
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
        minWidth={600}
        minHeight={400}
        bounds="window"
        dragHandleClassName="modal-handle"
      >
        <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xl rounded-lg overflow-hidden border border-zinc-800">
          <div className="modal-handle bg-zinc-900 p-4 flex justify-between items-center cursor-move border-b border-zinc-800">
            <h2 className="text-xl font-thin">@ Intervention Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition duration-150"
            >
              <Close />
            </button>
          </div>

          <Tab.Group selectedIndex={activeTabIndex} onChange={setActiveTabIndex}>
            <Tab.List className="flex bg-zinc-900 px-4 border-b border-zinc-800">
              <Tab
                className={({ selected }) =>
                  `py-3 px-4 text-sm font-medium transition-colors focus:outline-none ${
                    selected
                      ? "border-b-2 border-blue-500 text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`
                }
              >
                Save New
              </Tab>
              <Tab
                className={({ selected }) =>
                  `py-3 px-4 text-sm font-medium transition-colors focus:outline-none ${
                    selected
                      ? "border-b-2 border-blue-500 text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`
                }
              >
                Load Saved
              </Tab>
            </Tab.List>

            <Tab.Panels className="flex-1 overflow-auto bg-zinc-900">
              {/* Save New Intervention Panel */}
              <Tab.Panel className="p-6 h-full flex flex-col">
                <div className="mb-6">
                  <label htmlFor="interventionName" className="block text-sm font-light text-gray-300 mb-2">
                    Intervention Name
                  </label>
                  <input
                    type="text"
                    id="interventionName"
                    value={newInterventionName}
                    onChange={(e) => setNewInterventionName(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] bg-zinc-800 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                    placeholder="Enter a name for this intervention"
                  />
                </div>

                <div className="flex-1 bg-zinc-800 rounded-md p-4 mb-6 overflow-auto border border-zinc-700">
                  <h3 className="text-sm font-light mb-3 text-gray-300">Intervention Preview</h3>
                  <div className="text-gray-400 text-[11px]">
                    {nodes.length > 0 ? (
                      <div>
                        <p className="mb-4">This intervention contains {nodes.length} nodes and {edges.length} connections.</p>
                        
                        {/* Node Overview Table */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Node Details</h4>
                          <div className="bg-neutral-800 rounded border border-gray-600">
                            <div className="grid grid-cols-4 gap-2 p-2 bg-neutral-700 text-xs font-medium text-gray-200 rounded-t">
                              <div>Type</div>
                              <div>Label</div>
                              <div>Scope</div>
                              <div>Tags</div>
                            </div>
                            {nodes.map((node, index) => (
                              <div key={node.id} className={`grid grid-cols-4 gap-2 p-2 text-xs ${index % 2 === 0 ? 'bg-neutral-800' : 'bg-neutral-750'} ${index === nodes.length - 1 ? '' : 'border-b border-gray-600'}`}>
                                <div className="capitalize font-medium">
                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                    node.type === 'intervention' ? 'bg-blue-500' :
                                    node.type === 'phase' ? 'bg-green-500' :
                                    node.type === 'micro' ? 'bg-yellow-500' :
                                    node.type === 'session' ? 'bg-purple-500' : 'bg-gray-500'
                                  }`}></span>
                                  {node.type}
                                </div>
                                <div className="text-gray-300 truncate" title={node.data?.label || node.id}>
                                  {node.data?.label || "Unnamed"}
                                </div>
                                <div className="text-gray-400 truncate" title={node.data?.scope}>
                                  {node.data?.scope || "-"}
                                </div>
                                <div className="text-gray-400 truncate" title={node.data?.tags}>
                                  {node.data?.tags ? (
                                    <span className="text-xs bg-gray-600 px-1 rounded">
                                      {node.data.tags.split(';').length} tag(s)
                                    </span>
                                  ) : "-"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Additional Statistics */}
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div className="bg-neutral-800 p-3 rounded border border-gray-600">
                            <h5 className="text-xs font-medium text-gray-300 mb-2">Node Distribution</h5>
                            <div className="space-y-1 text-xs">
                              {['intervention', 'phase', 'micro', 'session'].map(type => {
                                const count = nodes.filter(n => n.type === type).length;
                                return count > 0 ? (
                                  <div key={type} className="flex justify-between">
                                    <span className="capitalize text-gray-400">{type}:</span>
                                    <span className="text-gray-300 font-medium">{count}</span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                          
                          <div className="bg-neutral-800 p-3 rounded border border-gray-600">
                            <h5 className="text-xs font-medium text-gray-300 mb-2">Session Data</h5>
                            <div className="space-y-1 text-xs">
                              {(() => {
                                const sessionNodes = nodes.filter(n => n.type === 'session');
                                const sessionsWithExercises = sessionNodes.filter(n => n.data?.exercises && Object.keys(n.data.exercises).length > 0);
                                const sessionsWithDates = sessionNodes.filter(n => n.data?.date);
                                return (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">With exercises:</span>
                                      <span className="text-gray-300 font-medium">{sessionsWithExercises.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">With dates:</span>
                                      <span className="text-gray-300 font-medium">{sessionsWithDates.length}</span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>No nodes in current intervention.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveIntervention}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] bg-gray-600 hover:bg-gray-700 rounded-md font-light transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={!newInterventionName.trim() || nodes.length === 0}
                  >
                    <Save fontSize="x-small" />
                    Save Intervention
                  </button>
                </div>
              </Tab.Panel>

              {/* Load Saved Interventions Panel */}
              <Tab.Panel className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-light text-gray-300 mb-3">Saved Interventions</h3>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-[11px] bg-zinc-800 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Search interventions..."
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  {(interventions[patientId] || []).length > 0 ? (
                    <div className="space-y-3">
                      {interventions[patientId].map((intervention) => (
                        <div
                          key={intervention.id}
                          className="p-4 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors duration-200 cursor-pointer flex justify-between items-center border border-zinc-700"
                          onClick={() => handleLoadIntervention(patientId, intervention.id)}
                        >
                          <div>
                            <h4 className="font-medium text-white">{intervention.name}</h4>
                            <p className="text-xs text-gray-400">Saved on {intervention.date}</p>
                          </div>
                          <button className="text-blue-400 hover:text-blue-300 px-3 py-1 rounded-md text-sm transition-colors">
                            Load
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>No saved interventions found.</p>
                    </div>
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </Rnd>
    </Modal>
  );
};

export default InterventionModal;
