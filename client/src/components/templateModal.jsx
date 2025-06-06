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
        <div className="w-full h-full flex flex-col bg-zinc-800 text-white shadow-xl rounded-lg overflow-hidden border border-zinc-800">
          <div className="bg-zinc-900 p-4 flex justify-between items-center modal-handle cursor-move border-b border-zinc-800">
            <h2 className="text-xl font-thin">Template Management</h2>
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
                  `py-3 px-4 text-sm font-medium transition-colors focus:outline-none ${selected
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-gray-400 hover:text-gray-200"
                  }`
                }
              >
                Save New
              </Tab>
              <Tab
                className={({ selected }) =>
                  `py-3 px-4 text-sm font-medium transition-colors focus:outline-none ${selected
                    ? "border-b-2 border-blue-500 text-white"
                    : "text-gray-400 hover:text-gray-200"
                  }`
                }
              >
                Load Saved
              </Tab>
            </Tab.List>

            <Tab.Panels className="flex-1 overflow-auto bg-zinc-800">
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
                    className="w-full px-2 py-1 text-[11px] bg-zinc-800 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter a name for this template"
                  />
                </div>

                <div className="flex-1 bg-zinc-800 rounded-md p-4 mb-6 overflow-auto border border-zinc-700">
                  <h3 className="text-sm font-light text-gray-300 mb-3">Template Preview</h3>
                  <div className="text-gray-400 text-[11px]">
                    {previewNodes.length > 0 ? (
                      <div className="space-y-3">
                        {/* Node Overview Table */}
                        <div className="bg-neutral-800 rounded border border-gray-600">
                          <div className="grid grid-cols-3 gap-2 p-2 bg-neutral-700 text-xs font-medium text-gray-200 rounded-t">
                            <div>Type</div>
                            <div>Label</div>
                            <div>Details</div>
                          </div>
                          {previewNodes.slice(0, 5).map((node, index) => (
                            <div key={node.id} className={`grid grid-cols-3 gap-2 p-2 text-xs ${index % 2 === 0 ? 'bg-neutral-800' : 'bg-neutral-750'} ${index === previewNodes.slice(0, 5).length - 1 ? '' : 'border-b border-gray-600'}`}>
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
                              <div className="text-gray-400 truncate">
                                {node.type === 'intervention' && node.data?.name ? `Name: ${node.data.name}` :
                                 node.type === 'phase' && node.data?.scope ? `Scope: ${node.data.scope}` :
                                 node.type === 'micro' && node.data?.scope ? `Scope: ${node.data.scope}` :
                                 node.type === 'session' && node.data?.date ? `Date: ${node.data.date}` :
                                 "No details"
                                }
                              </div>
                            </div>
                          ))}
                        </div>

                        {previewNodes.length > 5 && (
                          <p className="text-zinc-400 text-xs mt-2">...and {previewNodes.length - 5} more nodes not shown</p>
                        )}
                      </div>
                    ) : (
                      <p>No node or descendants selected. Please select a parent node.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  { nodeSelected ? (
                    <button
                      onClick={handleSaveTemplate}
                      className="flex items-center gap-1 px-2 py-1 text-[11px] bg-gray-600 hover:bg-gray-700 rounded-md font-light transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                      disabled={!newTemplateName.trim() || previewNodes.length === 0}
                    >
                      <Save fontSize="x-small" /> Save Template
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-1 px-2 py-1 text-[11px] bg-gray-600 rounded-md font-light transition-colors duration-200 opacity-50 cursor-not-allowed"
                    >
                      <Save fontSize="x-small" /> No selected node
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
                      className="w-full px-2 py-1 text-[11px] bg-zinc-800 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                          className="p-4 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors duration-200 cursor-pointer flex justify-between items-center border border-zinc-700"
                          onClick={() => handleLoadTemplate(tpl.id)}
                        >
                          <div>
                            <h4 className="font-medium text-white">{tpl.name}</h4>
                            <p className="text-xs text-gray-400">Saved on {tpl.date}</p>
                            <p className="text-xs text-gray-400">{(tpl.nodes?.length ?? 0)} nodes, {(tpl.edges?.length ?? 0)} edges</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="flex items-center px-2 py-1 text-[11px] bg-neutral-800 hover:bg-black/20 text-slate-300 font-medium font-mono rounded-md transition-colors duration-200"
                              onClick={() => handleLoadTemplate(tpl.id)}
                            >
                              <FolderOpen fontSize="x-small" style={{marginRight: 4}} /> Load
                            </button>
                            <button
                              className="flex items-center px-2 py-1 text-[11px] bg-neutral-800 hover:bg-black/20 text-red-400 font-medium font-mono rounded-md transition-colors duration-200"
                              onClick={() => handleRemoveTemplate(tpl.id)}
                            >
                              <Delete fontSize="x-small" style={{marginRight: 4}} /> Delete
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
