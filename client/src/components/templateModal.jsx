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
        <div className="bg-gray-800 text-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
          <div className="bg-gray-900 p-4 flex justify-between items-center modal-handle cursor-move">
            <h2 className="text-xl font-semibold">Template Management</h2>
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
                  `py-3 px-4 text-sm font-medium transition-colors focus:outline-none ${selected
                    ? "border-b-2 border-indigo-500 text-white"
                    : "text-gray-400 hover:text-gray-200"
                  }`
                }
              >
                Save New
              </Tab>
              <Tab
                className={({ selected }) =>
                  `py-3 px-4 text-sm font-medium transition-colors focus:outline-none ${selected
                    ? "border-b-2 border-indigo-500 text-white"
                    : "text-gray-400 hover:text-gray-200"
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
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter a name for this template"
                  />
                </div>

                <div className="flex-1 bg-gray-700 rounded-md p-4 mb-6 overflow-auto">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Template Preview</h3>
                  <div className="text-gray-400 text-sm">
                    {previewNodes.length > 0 ? (
                      <div>
                        <p>This template contains {previewNodes.length} nodes.</p>
                        <ul className="list-disc list-inside mt-2">
                          {previewNodes.slice(0, 5).map((node) => (
                            <li key={node.id}>{node.data?.label || "Unnamed node"}</li>
                          ))}
                          {previewNodes.length > 5 && <li>...and {previewNodes.length - 5} more</li>}
                        </ul>
                      </div>
                    ) : (
                      <p>No node or descendants selected. Please select a parent node.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium transition duration-150"
                  >
                    <Save fontSize="small" /> Save Template
                  </button>
                </div>
              </Tab.Panel>

              {/* Load Saved Templates Panel */}
              <Tab.Panel className="p-6 h-full flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Saved Templates</h3>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                          className="p-4 bg-gray-700 rounded-md hover:bg-gray-600 transition duration-150 cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <h4 className="font-medium text-white">{tpl.name}</h4>
                            <p className="text-xs text-gray-400">Saved on {tpl.date}</p>
                            <p className="text-xs text-gray-400">{(tpl.nodes?.length ?? 0)} nodes, {(tpl.edges?.length ?? 0)} edges</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="text-indigo-400 hover:text-indigo-300 px-3 py-1 rounded-md text-sm flex items-center"
                              onClick={() => handleLoadTemplate(tpl.id)}
                            >
                              <FolderOpen fontSize="small" style={{marginRight: 4}} /> Load
                            </button>
                            <button
                              className="text-red-400 hover:text-red-300 px-3 py-1 rounded-md text-sm flex items-center"
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
