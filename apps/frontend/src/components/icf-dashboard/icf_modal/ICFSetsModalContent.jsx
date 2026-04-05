import React, { useState, useEffect, useMemo } from "react";
import { useReactFlow } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import useFlowStore from "../../../state/flowState";
import useTransientStore from "../../../state/transientState";
import Sidebar from "./Sidebar";
import NodeEditor from "./NodeEditor";
import Templater from "./Templater";
import { 
  createDefaultICFRecord, 
  createDefaultField,
  generateFieldNameFromLabel,
  createICFSetTemplate
} from "./helpers";
import { validateAllRecords, isRecordValid } from "./validationSchema";
import { FiPlus } from "react-icons/fi";

// Main content of the ICFSetsModal component
const ICFSetsModalContent = ({ onClose }) => {
  // Get access to route information to check if we're in editor view
  const isEditorView = window.location.pathname.includes('/editor');
  const { setToaster } = useTransientStore();
  // State
  const [activeView, setActiveView] = useState("nodeEditor");
  const [records, setRecords] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [showSaveSetForm, setShowSaveSetForm] = useState(false);
  const [newSetName, setNewSetName] = useState("");

  // Access flow store
  const { addTemplate, loadTemplate, removeTemplate, templates, setNodes, setEdges } = useFlowStore();
  const reactFlowInstance = useReactFlow();

  // Setup initial state or load from persistent storage on mount
  useEffect(() => {
    // Check if we have saved state in localStorage
    const savedState = localStorage.getItem("icfSetsModalState");
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setRecords(parsedState.records || []);
        setFormValues(parsedState.formValues || {});
      } catch (error) {
        console.error("Error parsing saved ICF Sets Modal state:", error);
        // Initialize with default state if parsing fails
        initializeDefaultState();
      }
    } else {
      // Initialize with default state if no saved state exists
      initializeDefaultState();
    }
  }, []);

  // Save state to localStorage whenever records or formValues change
  useEffect(() => {
    const stateToSave = {
      records,
      formValues
    };
    
    localStorage.setItem("icfSetsModalState", JSON.stringify(stateToSave));
  }, [records, formValues]);

  // Initialize with a default record
  const initializeDefaultState = () => {
    const initialRecord = createDefaultICFRecord();
    setRecords([initialRecord]);
    
    const initialValues = {
      [initialRecord.id]: {}
    };
    initialRecord.fields.forEach(field => {
      initialValues[initialRecord.id][field.name] = "";
    });
    
    setFormValues(initialValues);
  };

  // Input change handler
  const handleInputChange = (recordId, fieldName, value) => {
    setFormValues(prev => {
      const updatedRecordValues = {
        ...(prev[recordId] || {}),
        [fieldName]: value
      };
      return { ...prev, [recordId]: updatedRecordValues };
    });

    // Clear any errors for this field
    if (errors[recordId]?.[fieldName]) {
      setErrors(prev => {
        const newRecordErrors = { ...prev[recordId] };
        delete newRecordErrors[fieldName];
        
        if (Object.keys(newRecordErrors).length === 0) {
          const { [recordId]: _, ...rest } = prev;
          return rest;
        }
        
        return { ...prev, [recordId]: newRecordErrors };
      });
    }
  };

  // Add a new record
  const handleRecordAdd = (newRecord) => {
    setRecords(prev => [...prev, newRecord]);
    
    // Initialize form values for the new record
    const newRecordValues = {};
    newRecord.fields.forEach(field => {
      newRecordValues[field.name] = "";
    });
    
    setFormValues(prev => ({
      ...prev,
      [newRecord.id]: newRecordValues
    }));
  };

  // Delete a record
  const handleRecordDelete = (recordId) => {
    setRecords(prev => prev.filter(record => record.id !== recordId));
    
    // Clean up form values and errors
    setFormValues(prev => {
      const { [recordId]: _, ...rest } = prev;
      return rest;
    });
    
    setErrors(prev => {
      const { [recordId]: _, ...rest } = prev;
      return rest;
    });
  };

  // Add a field to a record
  const handleFieldAdd = (recordId, fieldType, subtype = "") => {
    const newField = createDefaultField(fieldType, "", subtype);
    
    setRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, fields: [...record.fields, newField] }
          : record
      )
    );
    
    // Initialize form value for the new field
    setFormValues(prev => {
      const recordValues = prev[recordId] || {};
      return {
        ...prev,
        [recordId]: {
          ...recordValues,
          [newField.name]: ""
        }
      };
    });
  };

  // Delete a field from a record
  const handleFieldDelete = (recordId, fieldId) => {
    // Find the field name before removing
    let fieldName = null;
    const record = records.find(r => r.id === recordId);
    
    if (record) {
      const field = record.fields.find(f => f.id === fieldId);
      if (field) {
        fieldName = field.name;
      }
    }
    
    // Remove the field from the record
    setRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { 
              ...record, 
              fields: record.fields.filter(field => field.id !== fieldId)
            }
          : record
      )
    );
    
    // Clean up form values and errors for this field
    if (fieldName) {
      setFormValues(prev => {
        const recordValues = prev[recordId] || {};
        const { [fieldName]: _, ...restFields } = recordValues;
        return { ...prev, [recordId]: restFields };
      });
      
      setErrors(prev => {
        const recordErrors = prev[recordId] || {};
        const { [fieldName]: _, ...restErrors } = recordErrors;
        
        if (Object.keys(restErrors).length === 0) {
          const { [recordId]: __, ...restRecordErrors } = prev;
          return restRecordErrors;
        }
        
        return { ...prev, [recordId]: restErrors };
      });
    }
  };

  // Update record properties
  const handleUpdateRecordLabel = (recordId, property, newValue) => {
    setRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, [property]: newValue }
          : record
      )
    );
    
    // If updating the code, also update the form value
    if (property === "code") {
      setFormValues(prev => {
        const recordValues = prev[recordId] || {};
        return {
          ...prev,
          [recordId]: {
            ...recordValues,
            code: newValue
          }
        };
      });
    }
  };

  // Save a record as a template
  const handleSaveRecordTemplate = (recordId) => {
    const record = records.find(r => r.id === recordId);
    const recordValues = formValues[recordId] || {};
    
    if (!record || !isRecordValid(record, recordValues)) {
      // Show validation errors
      const validationErrors = validateAllRecords([record], formValues);
      setErrors(validationErrors);
      return;
    }
    
    // Create a node template from the record
    const nodeData = {
      code: recordValues.code || record.code,
      description: recordValues.description || record.description,
      // Add other field values
      ...recordValues
    };
    
    const template = {
      id: uuidv4(),
      name: nodeData.code || "Unnamed Record",
      type: "recordNode",
      nodes: [{
        id: uuidv4(),
        type: "record",
        data: nodeData,
        position: { x: 0, y: 0 }
      }],
      edges: []
    };
    
    addTemplate(template);
  };

  // Save multiple records as a set template
  const handleSaveSetTemplate = (name, recordIds) => {
    if (!name || recordIds.length === 0) return;
    
    // Prevent creating single element sets
    if (recordIds.length < 2) {
      setToaster({
        message: "Cannot create a set with a single element. Please select at least two records.",
        type: "error",
        open: true,
      });
      return;
    }
    
    // Get the selected records
    const selectedRecords = records.filter(r => recordIds.includes(r.id));
    
    // Validate all selected records
    const validationErrors = validateAllRecords(selectedRecords, formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Create nodes for the template
    const templateNodes = selectedRecords.map((record, index) => {
      const recordValues = formValues[record.id] || {};
      
      return {
        id: uuidv4(),
        type: "record",
        data: {
          code: recordValues.code || record.code,
          description: recordValues.description || record.description,
          // Add other field values
          ...recordValues
        },
        position: { x: 0, y: index * 100 } // Position nodes vertically
      };
    });
    
    const template = {
      id: uuidv4(),
      name,
      type: "icfSet",
      nodes: templateNodes,
      edges: []
    };
    
    addTemplate(template);
  };

  // Add records to flow
  const handleAddSelectedToFlow = (recordIds) => {
    if (!reactFlowInstance || recordIds.length === 0) return;
    
    // Get the selected records
    const selectedRecords = records.filter(r => recordIds.includes(r.id));
    
    // Validate all selected records
    const validationErrors = validateAllRecords(selectedRecords, formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Calculate position for new nodes
    const viewport = reactFlowInstance.getViewport();
    const containerBounds = reactFlowInstance.getContainer().getBoundingClientRect();
    const centerPosition = reactFlowInstance.screenToFlowPosition({
      x: containerBounds.width / 2,
      y: containerBounds.height / 2
    });
    
    // Create nodes for each selected record
    const newNodes = selectedRecords.map((record, index) => {
      const recordValues = formValues[record.id] || {};
      
      // Extract all field values to ensure we capture everything
      const fieldData = {};
      record.fields.forEach(field => {
        if (recordValues[field.name]) {
          fieldData[field.name] = recordValues[field.name];
        }
      });
      
      return {
        id: uuidv4(),
        type: "record",
        data: {
          code: recordValues.code || record.code || "",
          description: recordValues.description || record.description || "",
          category: recordValues.category || "",
          qualifier: recordValues.qualifier || "",
          type: "ICF", // Add type for display
          color: "rgba(28, 28, 28, 1)", // Default color from dataTemplates
          ...fieldData // Include all other field data
        },
        position: {
          x: centerPosition.x + (index % 3) * 150, // Grid layout
          y: centerPosition.y + Math.floor(index / 3) * 100
        }
      };
    });
    
    // Add nodes to the flow
    setNodes(nodes => [...nodes, ...newNodes]);
    
    // Close the modal
    onClose();
  };

  // Insert a template into the flow
  const handleInsertTemplate = (template) => {
    if (!reactFlowInstance) return;
    
    loadTemplate(template.id);
    onClose();
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isEditorView={isEditorView} 
        />
        
        {/* Main Content Area */}
        <div className="flex w-full">
          {activeView === "nodeEditor" ? (
            <NodeEditor
              records={records}
              formValues={formValues}
              errors={errors}
              onRecordAdd={handleRecordAdd}
              onRecordDelete={handleRecordDelete}
              onInputChange={handleInputChange}
              onFieldAdd={handleFieldAdd}
              onFieldDelete={handleFieldDelete}
              onUpdateRecordLabel={handleUpdateRecordLabel}
              onAddSelectedToFlow={handleAddSelectedToFlow}
              onSaveTemplate={handleSaveSetTemplate}
              selectedRecords={selectedRecords}
              setSelectedRecords={setSelectedRecords}
              showSaveSetForm={showSaveSetForm}
              setShowSaveSetForm={setShowSaveSetForm}
              newSetName={newSetName}
              setNewSetName={setNewSetName}
            />
          ) : (
            <Templater
              templates={templates}
              onInsertTemplate={handleInsertTemplate}
              onDeleteTemplate={removeTemplate}
            />
          )}
        </div>
      </div>
      
      {/* Footer with Selection Controls - Only shown in NodeEditor view */}
      {activeView === "nodeEditor" && (
        <div className="p-3 flex justify-between items-center border-t border-zinc-800 bg-zinc-900">
          <div className="text-sm text-zinc-400 flex items-center gap-2">
            <span>{records.length} record(s) available</span>
            {records.length > 0 && (
              <button
                onClick={() => {
                  const validIds = Array.from(new Set(records
                    .filter(r => isRecordValid(r, formValues[r.id]))
                    .map(r => r.id)
                  ));
                  
                  if (validIds.length > 0) {
                    handleAddSelectedToFlow(validIds);
                  }
                }}
                className="px-2 py-1 rounded text-xs bg-zinc-700 hover:bg-zinc-600 text-white transition-colors duration-200"
              >
                Add All Valid
              </button>
            )}
          </div>
          
          {/* Selection Controls moved from NodeEditor */}
          <div className="flex gap-2">
            <span className="text-sm text-zinc-400 mr-2 self-center">
              <span className="font-medium">{selectedRecords.size}</span> selected
            </span>
            <button
              onClick={() => selectedRecords.size > 0 && handleAddSelectedToFlow(Array.from(selectedRecords))}
              disabled={selectedRecords.size === 0}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm ${selectedRecords.size === 0 ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'} transition-colors duration-200`}
            >
              <FiPlus size={14} />
              <span>Add to Flow</span>
            </button>
            <button
              onClick={() => selectedRecords.size > 0 && setShowSaveSetForm(!showSaveSetForm)}
              disabled={selectedRecords.size === 0}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded text-sm ${selectedRecords.size === 0 ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' : 'bg-zinc-700 text-white hover:bg-zinc-600'} transition-colors duration-200`}
            >
              {showSaveSetForm ? "Cancel" : "Save as Set"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ICFSetsModalContent;
