import React, { useState, useMemo } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { Tab } from "@headlessui/react";
import { Close, Save, Delete, FolderOpen } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

// Zustand state management hooks
import { useNavigationStore } from "../state/core/useNavigationStore";
import { useInterventionStore } from "../state/core/useInterventionStore";
import useUIStore from "../state/core/useUIStore";

const TemplateModal = ({ isOpen, onClose }) => {
  const {
    selectedInterventionId,
    selectedSessionId,
    selectedStructuralNodeId,
    selectedStructuralNodeType,
    interventions,
    phases,
    microcycles,
    sessions,
    templates,
    addTemplate,
    loadTemplate,
    removeTemplate,
  } = useInterventionStore();

  const { setToaster } = useUIStore();
  
  const [newTemplateName, setNewTemplateName] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const activeId = selectedStructuralNodeId || selectedSessionId || selectedInterventionId;
  const activeType = selectedStructuralNodeType || (selectedSessionId ? 'Session' : (selectedInterventionId ? 'Intervention' : null));

  // Hierarchical build helper
  const buildHierarchy = useMemo(() => {
    const build = (id, type) => {
      if (!id || !type) return null;

      if (type === 'Intervention') {
        const item = interventions[id];
        if (!item) return null;
        // Exclude structural IDs and legacy flow data
        const { id: _id, phaseIds, nodes, edges, patientId, ...data } = item;
        return {
          type: 'Intervention',
          data,
          phases: (phaseIds || []).map(pid => build(pid, 'Phase')).filter(Boolean)
        };
      }
      if (type === 'Phase') {
        const item = phases[id];
        if (!item) return null;
        // Exclude structural IDs
        const { id: _id, microcycleIds, ...data } = item;
        return {
          type: 'Phase',
          data,
          microcycles: (microcycleIds || []).map(mid => build(mid, 'Micro')).filter(Boolean)
        };
      }
      if (type === 'Micro') {
        const item = microcycles[id];
        if (!item) return null;
        // Exclude structural IDs
        const { id: _id, sessionIds, ...data } = item;
        return {
          type: 'Micro',
          data,
          sessions: (item.sessionIds || []).map(sid => build(sid, 'Session')).filter(Boolean)
        };
      }
      if (type === 'Session') {
        const item = sessions[id];
        if (!item) return null;
        // Exclude structural IDs
        const { id: _id, interventionId, ...data } = item;
        return {
          type: 'Session',
          data
        };
      }
      return null;
    };
    return build;
  }, [interventions, phases, microcycles, sessions]);

  const previewHierarchy = useMemo(() => buildHierarchy(activeId, activeType), [activeId, activeType, buildHierarchy]);

  // Preview helper
  const getHierarchySummary = (item) => {
    if (!item) return { title: "No selection", stats: "" };
    let counts = { Phases: 0, Micros: 0, Sessions: 0 };
    
    const count = (node) => {
      if (node.type === 'Phase') counts.Phases++;
      if (node.type === 'Micro') counts.Micros++;
      if (node.type === 'Session') counts.Sessions++;
      
      if (node.phases) node.phases.forEach(count);
      if (node.microcycles) node.microcycles.forEach(count);
      if (node.sessions) node.sessions.forEach(count);
    };
    
    count(item);
    
    const rootName = item.data?.name || item.data?.scope || 'Unnamed';
    return {
      title: `${item.type}: ${rootName}`,
      stats: `${counts.Phases} Phases, ${counts.Micros} Microcycles, ${counts.Sessions} Sessions`
    };
  };

  const previewSummary = useMemo(() => getHierarchySummary(previewHierarchy), [previewHierarchy]);

  // Modal configuration
  const defaultModalConfig = {
    width: 800,
    height: 600,
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 300,
  };

  // Save Template
  function handleSaveTemplate() {
    if (!activeId) {
      setToaster({
        type: "error",
        message: "Please select an item to save as a template.",
        show: true,
      });
      return;
    }

    if (!newTemplateName.trim()) {
      setToaster({
        type: "error",
        message: "Please enter a name for the template.",
        show: true,
      });
      return;
    }

    if (templates.some((t) => t.name === newTemplateName)) {
      setToaster({
        type: "error",
        message: "A template with this name already exists.",
        show: true,
      });
      return;
    }

    if (!previewHierarchy) {
      setToaster({
        type: "error",
        message: "Failed to generate template content.",
        show: true,
      });
      return;
    }

    const newTemplate = {
      id: uuidv4(),
      name: newTemplateName,
      date: new Date().toISOString().split("T")[0],
      content: previewHierarchy,
    };

    addTemplate(newTemplate);
    setNewTemplateName("");
    setToaster({
      type: "success",
      message: "Template saved successfully.",
      show: true,
    });
  }

  // Load Template
  function handleLoadTemplate(templateId) {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) {
      setToaster({
        type: "error",
        message: "Template not found.",
        show: true,
      });
      return;
    }
    loadTemplate(tpl.id);
    setToaster({
      type: "success",
      message: `Loaded template: ${tpl.name}`,
      show: true,
    });
    onClose();
  }

  // Delete Template
  function handleRemoveTemplate(templateId) {
    removeTemplate(templateId);
    setToaster({
      type: "success",
      message: "Template deleted.",
      show: true,
    });
  }

  // Filter templates
  const filteredTemplates = templates.filter(
     tpl => (tpl.name || "").toLowerCase().includes((searchQuery || "").toLowerCase())
    );    


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      aria={{
        labelledby: "template-management-title",
        describedby: "template-management-description",
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
        <div className="bg-zinc-900 text-white shadow-lg overflow-hidden flex flex-col h-full">
          <div className="bg-zinc-800 py-1 px-2 flex justify-between items-center modal-handle cursor-move">
            <h2 className="text-[10px]">Template Management</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition duration-150"
            >
              <Close />
            </button>
          </div>

          <Tab.Group selectedIndex={activeTabIndex} onChange={setActiveTabIndex}>
            <Tab.List className="flex bg-zinc-900 py-1 px-2 border-b border-neutral-700">
              <Tab
                className={({ selected }) =>
                  `py-1 px-2 text-[10px] transition-colors focus:outline-none ${selected
                    ? "border-b-2 border-neutral-400 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                  }`
                }
              >
                Save New
              </Tab>
              <Tab
                className={({ selected }) =>
                  `py-1 px-2 text-[10px] transition-colors focus:outline-none ${selected
                    ? "border-b-2 border-neutral-400 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                  }`
                }
              >
                Load Saved
              </Tab>
            </Tab.List>

            <Tab.Panels className="flex-1 overflow-auto">
              {/* Save New Template Panel */}
              <Tab.Panel className="p-6 h-full flex flex-col">
                <div className="mb-6">
                  <label htmlFor="templateName" className="block text-sm font-medium text-gray-300 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    id="templateName"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a name for this template"
                  />
                </div>

                <div className="flex-1 bg-zinc-800 rounded-md p-4 mb-6 overflow-auto">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Template Preview</h3>
                  <div className="text-gray-400 text-sm">
                    {previewHierarchy ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-zinc-900 shadow">
                          <h4 className="font-thin text-gray-300 text-xl">@ {previewSummary.title}</h4>
                          <div className="text-zinc-400 text-xs mt-2">
                             <p className="font-bold text-blue-400 mb-2">{previewSummary.stats}</p>
                             <div className="mt-4 p-2 bg-zinc-800 rounded border border-zinc-700">
                                <pre className="text-[10px] text-zinc-500 overflow-hidden text-ellipsis whitespace-pre-wrap">
                                  {JSON.stringify(previewHierarchy.data, null, 2)}
                                </pre>
                             </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>No item selected. Please select an Intervention, Phase, Microcycle or Session.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  { activeId ? (<button
                    onClick={handleSaveTemplate}
                    className="flex items-center text-xs gap-2 px-2 bg-blue-600 hover:bg-blue-500 py-2 rounded-md font-medium transition duration-150"
                  >
                    <Save fontSize="small" /> Save Template
                  </button>) : (
                    <button
                      disabled
                      className="flex items-center text-xs gap-2 px-2 bg-rose-800 rounded-md font-medium transition duration-150 opacity-50 cursor-not-allowed"
                    >
                      No selected item
                    </button>
                  )}
                </div>
              </Tab.Panel>

              {/* Load Saved Templates Panel */}
              <Tab.Panel className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Saved Templates</h3>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-auto">
                  {filteredTemplates.length > 0 ? (
                    <div className="space-y-3">
                      {filteredTemplates.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="p-4 bg-zinc-800 rounded-md hover:bg-zinc-700 transition duration-150 cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-medium text-white">{tpl.name}</h4>
                            <p className="text-xs text-gray-400">Saved on {tpl.date}</p>
                            {tpl.content ? (
                              <p className="text-xs text-blue-400">Hierarchical Template ({tpl.content.type})</p>
                            ) : (
                              <p className="text-xs text-rose-400">Legacy Template (Unsupported)</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              disabled={!tpl.content}
                              className={`flex items-center bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-3 py-1 rounded-md text-sm transition duration-150 ${!tpl.content ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => handleLoadTemplate(tpl.id)}
                            >
                              <FolderOpen fontSize="small" style={{marginRight: 4}} /> Load
                            </button>
                            <button
                              className="flex items-center bg-zinc-700 hover:bg-zinc-600 text-red-400 px-3 py-1 rounded-md text-sm transition duration-150"
                              onClick={() => handleRemoveTemplate(tpl.id)}
                            >
                              <Delete fontSize="small" style={{marginRight: 4}} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <p>No saved templates found.</p>
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

export default TemplateModal;
