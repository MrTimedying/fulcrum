import React, { useState } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { Tab } from "@headlessui/react";
import { Close, Save, Delete, FolderOpen } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

// Zustand state management hooks (based on your InterventionModal pattern)
import useFlowStore from "../state/flowState";
import useTransientStore from "../state/transientState";

// Helper: Gather descendants and their edges given a parent nodeId
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

const TemplateModal = ({ isOpen, onClose }) => {
  // Zustand stores (pattern from InterventionModal)
  const {
    nodes,
    edges,
    patientId, // Assuming analogous to patientId, otherwise adjust as needed
    templates,
    addTemplate,
    loadTemplate,
    removeTemplate,
  } = useFlowStore();

  const { setToaster } = useTransientStore();
  const nodeSelected = nodes.find((node) => node.selected);
  const selectedNodeId = nodeSelected?.id;
  const [newTemplateName, setNewTemplateName] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Get descendants for current selection
  const { nodes: previewNodes, edges: previewEdges } =
    getAllDescendants(selectedNodeId, nodes, edges);


  // Modal configuration
  const defaultModalConfig = {
    width: 800,
    height: 600,
    x: window.innerWidth / 2 - 400,
    y: window.innerHeight / 2 - 300,
  };

  // Save Template
  function handleSaveTemplate() {
    if (!nodeSelected) {
      setToaster({
        type: "error",
        message: "Please select a node to save as a template.",
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

    if (previewNodes.length === 0) {
      setToaster({
        type: "error",
        message: "No nodes/descendants found for the current selection.",
        show: true,
      });
      return;
    }

    const newTemplate = {
      id: uuidv4(),
      name: newTemplateName,
      date: new Date().toISOString().split("T")[0],
      nodes: JSON.parse(JSON.stringify(previewNodes)),
      edges: JSON.parse(JSON.stringify(previewEdges)),
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
                    {previewNodes.length > 0 ? (
                      <div className="space-y-3">
                        {previewNodes.slice(0, 5).map((node) => (
                          <div key={node.id} className="p-3 bg-zinc-900 shadow">
                            <h4 className="font-thin text-gray-300 text-xl">@ {node.type || "Unnamed node"}</h4>
                            <div className="text-zinc-400 text-xs mt-2">
                              {node.type === 'InterventionNode' && node.data && (
                                <>
                                  <p>Name: {node.data.name || 'Not defined'}</p>
                                  <p>Type: {node.data.type || 'Not defined'}</p>
                                  <p>Global Goal: {node.data.global || 'Not defined'}</p>
                                  <p>Service Goal: {node.data.service || 'Not defined'}</p>
                                </>
                              )}
                              {node.type === 'PhaseNode' && node.data && (
                                <>
                                  <p>Scope: {node.data.scope || 'Not defined'}</p>
                                  <p>Description: {node.data.description || 'Not defined'}</p>
                                </>
                              )}
                              {node.type === 'MicroNode' && node.data && (
                                <>
                                  <p>Scope: {node.data.scope || 'Not defined'}</p>
                                  <p>Description: {node.data.description || 'Not defined'}</p>
                                </>
                              )}
                              {node.type === 'SessionNode' && node.data && (
                                <>
                                  <p>Scope: {node.data.scope || 'Not defined'}</p>
                                  <p>Date: {node.data.date || 'Not defined'}</p>
                                  {node.data.exercises && Object.keys(node.data.exercises).length > 0 && (
                                    <p>{Object.keys(node.data.exercises).length} exercises defined</p>
                                  )}
                                </>
                              )}
                              {/* Fallback if node type is unknown or data is missing */}
                              {(!node.type || !node.data) && <p>No detailed data available</p>}
                            </div>
                          </div>
                        ))}
                        {previewNodes.length > 5 && (
                          <p className="text-zinc-400 text-xs">...and {previewNodes.length - 5} more nodes not shown</p>
                        )}
                      </div>
                    ) : (
                      <p>No node or descendants selected. Please select a parent node.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">

                  { nodeSelected ? (<button
                    onClick={handleSaveTemplate}
                    className="flex items-center text-xs gap-2 px-2 bg-blue-600 rounded-md font-medium transition duration-150"
                  >
                    <Save fontSize="small" /> Save Template
                  </button>) : (
                    <button
                      disabled
                      className="flex items-center text-xs gap-2 px-2 bg-rose-800 rounded-md font-medium transition duration-150 opacity-50 cursor-not-allowed"
                    >
                      No selected node
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
                            <p className="text-xs text-gray-400">{(tpl.nodes?.length ?? 0)} nodes, {(tpl.edges?.length ?? 0)} edges</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="flex items-center bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-3 py-1 rounded-md text-sm transition duration-150"
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
