import React, { useState } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { Tab } from "@headlessui/react";
import { useNavigationStore } from "../state/core/useNavigationStore";
import { useInterventionStore } from "../state/core/useInterventionStore";
import useUIStore from "../state/core/useUIStore";
import { Close, Save } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

const InterventionModal = ({ isOpen, onClose }) => {
  const { patientId } = useNavigationStore();
  const { interventions, addIntervention, loadIntervention, removeIntervention } = useInterventionStore();
  const { setToaster } = useUIStore();
  const [newInterventionName, setNewInterventionName] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const patientInterventions = React.useMemo(() => 
    Object.values(interventions).filter(i => i.patientId === patientId),
    [interventions, patientId]
  );

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
    if (patientInterventions.some((i) => i.name === newInterventionName)) {
      setToaster({
        type: "error",
        message: "An intervention with this name already exists",
        show: true,
      });
      return;
    }

    // Save intervention logic here
    addIntervention(patientId, {
      name: newInterventionName,
      date: new Date().toISOString().split('T')[0],
    });

    setNewInterventionName("");
    setToaster({
      type: "success",
      message: "Intervention saved successfully",
      show: true,
    });
  }

  function handleLoadIntervention(patientId, interventionId) {
    const intervention = interventions[interventionId];
  
    if (!intervention || intervention.patientId !== patientId) {
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
        <div className="bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
          <div className="bg-gray-900 p-4 flex justify-between items-center modal-handle cursor-move">
            <h2 className="text-xl font-semibold">Intervention Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition duration-150"
            >
              <Close />
            </button>
          </div>

          <Tab.Group selectedIndex={activeTabIndex} onChange={setActiveTabIndex}>
            <Tab.List className="flex bg-gray-900 px-4 border-b border-gray-700">
              <Tab
                className={({ selected }) =>
                  `py-3 px-4 text-sm font-medium transition-colors focus:outline-none ${
                    selected
                      ? "border-b-2 border-zinc-500 text-white"
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
                      ? "border-b-2 border-zinc-500 text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`
                }
              >
                Load Saved
              </Tab>
            </Tab.List>

            <Tab.Panels className="flex-1 overflow-auto">
              {/* Save New Intervention Panel */}
              <Tab.Panel className="p-6 h-full flex flex-col">
                <div className="mb-6">
                  <label htmlFor="interventionName" className="block text-sm font-medium text-gray-300 mb-2">
                    Intervention Name
                  </label>
                  <input
                    type="text"
                    id="interventionName"
                    value={newInterventionName}
                    onChange={(e) => setNewInterventionName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    placeholder="Enter a name for this intervention"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveIntervention}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-600 hover:bg-zinc-700 rounded-md font-medium transition duration-150"
                    disabled={!newInterventionName.trim()}
                  >
                    <Save fontSize="small" />
                    Save Intervention
                  </button>
                </div>
              </Tab.Panel>

              {/* Load Saved Interventions Panel */}
              <Tab.Panel className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Saved Interventions</h3>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      placeholder="Search interventions..."
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  {patientInterventions.length > 0 ?  (
                    <div className="space-y-3">
                      {patientInterventions.map((intervention) => (
                        <div
                          key={intervention.id}
                          className="p-4 bg-gray-700 rounded-md hover:bg-gray-600 transition duration-150 cursor-pointer flex justify-between items-center"
                          onClick={() => handleLoadIntervention(patientId,intervention.id)}
                        >
                          <div>
                            <h4 className="font-medium text-white">{intervention.name}</h4>
                            <p className="text-xs text-gray-400">Saved on {intervention.date}</p>
                          </div>
                          <button className="text-zinc-400 hover:text-zinc-300 px-3 py-1 rounded-md text-sm">
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

