import React, { useState, useRef, useEffect, useMemo } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import useFlowStore from "../../../state/flowState";
import useTransientStore from "../../../state/transientState";
import { createNodeValidationSchema } from "./nodeValidationSchema";
import TagInput from "./TagInput";
import { motion, AnimatePresence } from "motion/react";
import { v4 as uuidv4 } from 'uuid';

// --- Accessibility Setup ---
if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

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

// Define editable properties per node type (from editor.jsx dataTemplates)
// Excluding id, color, and order as they have specific logic and components
const editableProperties = {
  intervention: [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'type', label: 'Type', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'global', label: 'Global', type: 'text' },
    { name: 'service', label: 'Service', type: 'text' },
  ],
  phase: [
    { name: 'scope', label: 'Scope', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'tags', label: 'Tags', type: 'tags' },
  ],
  micro: [
    { name: 'scope', label: 'Scope', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'tags', label: 'Tags', type: 'tags' },
  ],
  session: [
    { name: 'scope', label: 'Scope', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'tags', label: 'Tags', type: 'tags' },
  ]
};

// --- BulkNodeDataModal Component ---
function BulkNodeDataModal({ isOpen, onClose }) {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState(new Set());
  const [isBulkEditVisible, setIsBulkEditVisible] = useState(false);
  const [bulkEditTargetProperty, setBulkEditTargetProperty] = useState(null);
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [bulkEditOperation, setBulkEditOperation] = useState('replace');

  const { nodes, edges, bulkUpdateNodeData } = useFlowStore();
  const { setToaster } = useTransientStore();

  const nodeSelected = useMemo(
    () => nodes.find((node) => node.selected),
    [nodes]
  );

  const defaultModalConfig = {
    width: Math.min(window.innerWidth * 0.9, 1200),
    height: Math.min(window.innerHeight * 0.9, 800),
    x: window.innerWidth * 0.05,
    y: window.innerHeight * 0.05,
  };

  // --- Effect to Get Selected Node + Descendants on Open ---
  useEffect(() => {
    if (isOpen && nodeSelected) {
      console.log(`--- BulkNodeDataModal: Getting descendants for ${nodeSelected.id} ---`);
      
      // Get selected node and all its descendants
      const { nodes: descendantNodes } = getAllDescendants(nodeSelected.id, nodes, edges);
      
      // Set selected nodes
      setSelectedNodes(descendantNodes);
      
      // Initialize form values with current node data
      const initialFormValues = {};
      descendantNodes.forEach(node => {
        initialFormValues[node.id] = { ...node.data };
      });
      setFormValues(initialFormValues);
      
      // Reset other state
      setErrors({});
      setIsSubmitting(false);
      setSelectedNodeIds(new Set());
      setBulkEditTargetProperty(null);
      setBulkEditValue("");
      setIsBulkEditVisible(false);
      
      console.log(`Found ${descendantNodes.length} nodes to edit:`, descendantNodes.map(n => n.id));
    }
  }, [isOpen, nodeSelected, nodes, edges]);

  // --- Input Change Handler ---
  const handleInputChange = (nodeId, propertyName, value) => {
    setFormValues((prev) => {
      const updatedNodeValues = {
        ...(prev[nodeId] || {}),
        [propertyName]: value,
      };
      return { ...prev, [nodeId]: updatedNodeValues };
    });

    // Clear errors for this field
    if (errors[nodeId]?.[propertyName]) {
      setErrors((prev) => {
        const newNodeErrors = { ...prev[nodeId] };
        delete newNodeErrors[propertyName];
        if (Object.keys(newNodeErrors).length === 0) {
          const { [nodeId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [nodeId]: newNodeErrors };
      });
    }
  };

  // --- Node Selection for Bulk Edit ---
  const handleNodeSelect = (nodeId, isChecked) => {
    setSelectedNodeIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (isChecked) {
        newSelected.add(nodeId);
      } else {
        newSelected.delete(nodeId);
      }
      return newSelected;
    });
  };

  // --- Bulk Edit Logic ---
  const handleBulkApply = () => {
    if (!bulkEditTargetProperty || bulkEditValue === '') {
      console.warn("No target property or value selected for bulk assignment.");
      return;
    }

    const targetNodeIds = selectedNodeIds.size > 0
      ? Array.from(selectedNodeIds)
      : selectedNodes.map(n => n.id);

    const updatedFormValues = { ...formValues };

    targetNodeIds.forEach(nodeId => {
      const node = selectedNodes.find(n => n.id === nodeId);
      if (node) {
        // Check if this node type has the target property
        const nodeProperties = editableProperties[node.type] || [];
        const hasProperty = nodeProperties.some(prop => prop.name === bulkEditTargetProperty);
        
        if (hasProperty) {
          if (!updatedFormValues[nodeId]) {
            updatedFormValues[nodeId] = {};
          }

          if (bulkEditOperation === 'replace') {
            updatedFormValues[nodeId][bulkEditTargetProperty] = bulkEditValue;
          } else if (bulkEditOperation === 'append') {
            const currentValue = updatedFormValues[nodeId][bulkEditTargetProperty] || '';
            const separator = (currentValue !== '' && bulkEditValue !== '') ? ' ' : '';
            updatedFormValues[nodeId][bulkEditTargetProperty] = currentValue + separator + bulkEditValue;
          }
        }
      }
    });

    setFormValues(updatedFormValues);
    setBulkEditTargetProperty(null);
    setBulkEditValue("");
    setIsBulkEditVisible(false);
  };

  // Calculate common properties for bulk edit dropdown (only properties available on ALL selected nodes)
  const bulkEditPropertyOptions = useMemo(() => {
    const targetNodes = selectedNodeIds.size > 0
      ? selectedNodes.filter(n => selectedNodeIds.has(n.id))
      : selectedNodes;

    if (targetNodes.length === 0) return [];

    // Get properties from the first node
    const firstNodeProperties = editableProperties[targetNodes[0].type] || [];
    
    // Find properties that exist in all selected node types
    const commonProperties = firstNodeProperties.filter(prop => {
      return targetNodes.every(node => {
        const nodeProperties = editableProperties[node.type] || [];
        return nodeProperties.some(nodeProp => nodeProp.name === prop.name);
      });
    });
    
    return commonProperties.map(prop => prop.name);
  }, [selectedNodes, selectedNodeIds]);

  // --- Submit Handler ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedNodes.length === 0) {
      setErrors({ form: "Error: No nodes to update." });
      return;
    }

    const validationSchema = createNodeValidationSchema(selectedNodes);
    setIsSubmitting(true);
    setErrors({});

    try {
      await validationSchema.validate(formValues, { abortEarly: false });

      // Update each node's data
      selectedNodes.forEach(node => {
        const nodeFormValues = formValues[node.id] || {};
        Object.keys(nodeFormValues).forEach(propertyName => {
          if (nodeFormValues[propertyName] !== node.data[propertyName]) {
            bulkUpdateNodeData(node.id, propertyName, nodeFormValues[propertyName]);
          }
        });
      });

      setToaster({
        type: "success",
        message: `Successfully updated ${selectedNodes.length} node(s).`,
        show: true,
      });
      
      setIsSubmitting(false);
      onClose();

    } catch (validationErrors) {
      if (validationErrors.inner && validationErrors.inner.length > 0) {
        const formattedErrors = {};
        validationErrors.inner.forEach((err) => {
          const [nodeId, propertyName] = err.path.split(".");
          if (nodeId && propertyName) {
            if (!formattedErrors[nodeId]) formattedErrors[nodeId] = {};
            formattedErrors[nodeId][propertyName] = err.message;
          } else {
            formattedErrors.form = formattedErrors.form ? `${formattedErrors.form}\n${err.message}` : err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        setErrors({ form: validationErrors.message || "Failed to validate form data." });
      }
      setIsSubmitting(false);
    }
  };

  // --- Render Field Based on Type ---
  const renderField = (node, property, value, error) => {
    const fieldId = `${node.id}-${property.name}`;
    const commonClasses = "w-full p-1 text-xs bg-zinc-800 border border-zinc-600 rounded text-white focus:outline-none focus:border-zinc-500";
    
    switch (property.type) {
      case 'textarea':
        return (
          <textarea
            id={fieldId}
            rows={2}
            className={`${commonClasses} resize-vertical`}
            value={value || ''}
            onChange={(e) => handleInputChange(node.id, property.name, e.target.value)}
            placeholder={`Enter ${property.label.toLowerCase()}`}
          />
        );
      case 'tags':
        return (
          <TagInput
            value={value || ''}
            onChange={(newValue) => handleInputChange(node.id, property.name, newValue)}
            placeholder="Add tags (e.g., #tag1;#tag2;)"
          />
        );
      default:
        return (
          <input
            id={fieldId}
            type="text"
            className={commonClasses}
            value={value || ''}
            onChange={(e) => handleInputChange(node.id, property.name, e.target.value)}
            placeholder={`Enter ${property.label.toLowerCase()}`}
          />
        );
    }
  };

  // --- Render ---
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 },
        content: {
          background: "transparent",
          border: "none",
          padding: 0,
          inset: 0,
          overflow: "hidden",
        },
      }}
      contentLabel="Bulk Node Data Editor"
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={800}
        minHeight={600}
        bounds="window"
        dragHandleClassName="modal-handle"
        className="w-full h-full"
      >
        <div className="w-full h-full flex flex-col bg-zinc-900 text-white shadow-xl rounded-lg overflow-hidden border border-zinc-800">
          {/* Header */}
          <div className="modal-handle bg-zinc-800 p-2 flex justify-between items-center cursor-move border-b border-zinc-700 flex-shrink-0">
            <h2 className="text-gray-200 text-sm font-medium">
              Bulk Node Data Editor - {selectedNodes.length} Node(s)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition duration-150 p-1 rounded-full hover:bg-zinc-700"
              aria-label="Close modal"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Subheader with Bulk Edit Toggle */}
          <div className="bg-zinc-800 flex flex-row items-center gap-2 p-2 border-b border-zinc-700">
            <span className="text-xs text-gray-300">
              Editing: {nodeSelected?.type} node + {selectedNodes.length - 1} descendant(s)
            </span>
            <button
              type="button"
              onClick={() => setIsBulkEditVisible(!isBulkEditVisible)}
              className="px-2 py-1 border border-dashed rounded-md border-zinc-600 text-zinc-400 bg-zinc-700 hover:bg-zinc-600 hover:text-zinc-200 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1"
            >
              {isBulkEditVisible ? 'Hide Bulk Assign' : 'Bulk Assign'}
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="p-2 flex-grow overflow-y-auto space-y-2 bg-zinc-900 flex flex-col"
          >
            {/* Bulk Edit Form */}
            <AnimatePresence>
              {isBulkEditVisible && (
                <motion.div
                  key="bulk-edit-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-2 border border-zinc-600 rounded-lg bg-zinc-800 space-y-2 mb-2"
                >
                  <h3 className="text-sm font-semibold text-gray-100">Bulk Assign Values</h3>
                  <p className="text-xs text-gray-400">
                    Applying to: {selectedNodeIds.size === 0 ? 'All Nodes' : `${selectedNodeIds.size} Selected Node(s)`}
                  </p>
                  
                  {bulkEditPropertyOptions.length > 0 ? (
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-medium text-gray-300">Select Property:</label>
                      <select
                        className="block w-full p-1 text-xs text-gray-300 border border-zinc-600 rounded-lg bg-zinc-700 focus:outline-none"
                        value={bulkEditTargetProperty || ''}
                        onChange={(e) => setBulkEditTargetProperty(e.target.value || null)}
                      >
                        <option value="">Choose a property...</option>
                        {bulkEditPropertyOptions.map(prop => (
                          <option key={prop} value={prop}>{prop}</option>
                        ))}
                      </select>

                      <label className="text-xs font-medium text-gray-300 mt-1">Value to Assign:</label>
                      <input
                        type="text"
                        className="block w-full p-1 text-xs text-gray-300 border border-zinc-600 rounded-lg bg-zinc-700 focus:outline-none"
                        value={bulkEditValue}
                        onChange={(e) => setBulkEditValue(e.target.value)}
                        placeholder="Enter value"
                      />

                      <div className="flex gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => setBulkEditOperation('replace')}
                          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                            bulkEditOperation === 'replace' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                          }`}
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setBulkEditOperation('append')}
                          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                            bulkEditOperation === 'append' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                          }`}
                        >
                          Append
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleBulkApply}
                        disabled={!bulkEditTargetProperty || bulkEditValue === ''}
                        className="mt-2 px-2 py-1 bg-zinc-700 text-white rounded-md hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-xs font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No properties available for bulk editing.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Messages */}
            {errors.form && (
              <div className="mb-2 p-2 bg-red-800/50 border border-red-700 text-red-200 rounded-md text-xs">
                {errors.form}
              </div>
            )}

            {/* Node List */}
            <div className="flex-grow space-y-2">
              {selectedNodes.map((node) => {
                const nodeProperties = editableProperties[node.type] || [];
                return (
                  <div
                    key={node.id}
                    className="p-2 border border-zinc-700 rounded-lg bg-zinc-800 space-y-2 relative"
                  >
                    {/* Node Header */}
                    <div className="flex justify-between items-center border-b border-zinc-600 pb-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-zinc-600"
                          checked={selectedNodeIds.has(node.id)}
                          onChange={(e) => handleNodeSelect(node.id, e.target.checked)}
                        />
                        <h4 className="text-sm font-medium text-white capitalize">
                          {node.type} Node
                        </h4>
                      </div>
                    </div>

                    {/* Node Properties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {nodeProperties.map((property) => {
                        const value = formValues[node.id]?.[property.name];
                        const error = errors[node.id]?.[property.name];
                        return (
                          <div key={property.name} className="space-y-1">
                            <label
                              htmlFor={`${node.id}-${property.name}`}
                              className="block text-xs font-medium text-gray-300"
                            >
                              {property.label}
                            </label>
                            {renderField(node, property, value, error)}
                            {error && (
                              <p className="text-red-400 text-xs">{error}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-700 flex-shrink-0 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-xs border border-zinc-600 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedNodes.length === 0}
                className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin inline-block w-3 h-3 border-[2px] border-current border-t-transparent text-white rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck size={12} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Rnd>
    </Modal>
  );
}

export default BulkNodeDataModal; 