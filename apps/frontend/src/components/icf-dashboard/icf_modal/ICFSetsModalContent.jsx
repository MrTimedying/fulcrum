import React, { useState, useEffect, useMemo } from "react";
import { useReactFlow } from "@xyflow/react";
import { v4 as uuidv4 } from "uuid";
import { useNavigationStore } from "../../../state/core/useNavigationStore";
import { usePatientStore } from "../../../state/core/usePatientStore";
import { useInterventionStore } from "../../../state/core/useInterventionStore";
import { useFlowDiagramStore } from "../../../state/flow/useFlowDiagramStore";
import useUIStore from "../../../state/core/useUIStore";
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
  const { setToaster } = useUIStore();
  // State
  const [activeView, setActiveView] = useState("nodeEditor");
  const [records, setRecords] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [showSaveSetForm, setShowSaveSetForm] = useState(false);
  const [newSetName, setNewSetName] = useState("");

  // Access granular stores
  const { activeTab, patientId } = useNavigationStore();
  const { addIcfRecord } = usePatientStore();
  const { addTemplate, loadTemplate, removeTemplate, templates } = useInterventionStore();
  const { setNodes, setEdges } = useFlowDiagramStore();
  const reactFlowInstance = useReactFlow();

  // ... (setup useEffects unchanged)

  // Mapping from record category to state dimension
  const categoryToDimension = {
    'body_function': 'bodyStructure',
    'body_structure': 'bodyStructure',
    'activity': 'activities',
    'participation': 'participation',
    'environmental': 'environmentalFactors',
    'personal': 'personalFactors' // If available
  };

  // Add records to flow or Kanban
  const handleAddSelectedToFlow = (recordIds) => {
    if (recordIds.length === 0) return;
    
    // Get the selected records
    const selectedRecords = records.filter(r => recordIds.includes(r.id));
    
    // Validate all selected records
    const validationErrors = validateAllRecords(selectedRecords, formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (activeTab === "Profile") {
      // Add to Kanban state
      selectedRecords.forEach(record => {
        const recordValues = formValues[record.id] || {};
        const dimension = categoryToDimension[recordValues.category || record.category] || 'bodyStructure';
        
        addIcfRecord(patientId, dimension, {
          code: recordValues.code || record.code || "",
          description: recordValues.description || record.description || "",
          category: recordValues.category || record.category || ""
        });
      });
      onClose();
      return;
    }

    // React Flow logic for Editor tab
    if (!reactFlowInstance) return;
    
    // Calculate position for new nodes
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
