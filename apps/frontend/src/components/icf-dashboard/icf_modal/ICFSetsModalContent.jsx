import React, { useState, useEffect, useMemo } from "react";
import { useNavigationStore } from "../../../state/core/useNavigationStore";
import { usePatientStore } from "../../../state/core/usePatientStore";
import { useInterventionStore } from "../../../state/core/useInterventionStore";
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
  const { 
    addTemplate, 
    loadTemplate, 
    removeTemplate, 
    templates,
    addSession,
    selectedInterventionId,
    selectedStructuralNodeId,
    selectedStructuralNodeType
  } = useInterventionStore();

  // --- Effect to Aggregate records from local state and potential props ---
  useEffect(() => {
    // Initial default record if empty
    if (records.length === 0) {
      const defaultRecord = createDefaultICFRecord();
      setRecords([defaultRecord]);
      setFormValues({
        [defaultRecord.id]: {
          category: "body_function",
          code: "",
          description: "",
        }
      });
    }
  }, []);

  // --- Record Actions ---
  const handleRecordAdd = () => {
    const newRecord = createDefaultICFRecord();
    setRecords(prev => [...prev, newRecord]);
    setFormValues(prev => ({
      ...prev,
      [newRecord.id]: {
        category: "body_function",
        code: "",
        description: "",
      }
    }));
  };

  const handleRecordDelete = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setFormValues(prev => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
    setSelectedRecords(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(id);
      return newSelected;
    });
  };

  const handleInputChange = (recordId, fieldName, value) => {
    setFormValues(prev => ({
      ...prev,
      [recordId]: {
        ...(prev[recordId] || {}),
        [fieldName]: value
      }
    }));

    // Clear error when user types
    if (errors[recordId]?.[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        const recordErrors = { ...newErrors[recordId] };
        delete recordErrors[fieldName];
        
        if (Object.keys(recordErrors).length === 0) {
          delete newErrors[recordId];
        } else {
          newErrors[recordId] = recordErrors;
        }
        return newErrors;
      });
    }
  };

  const handleFieldAdd = (recordId, type, subtype, label) => {
    setRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const newField = createDefaultField(type, label, subtype);
        return {
          ...record,
          fields: [...record.fields, newField]
        };
      }
      return record;
    }));
  };

  const handleFieldDelete = (recordId, fieldId) => {
    setRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        const fieldToDelete = record.fields.find(f => f.id === fieldId);
        if (fieldToDelete) {
          setFormValues(prevValues => {
            const recordValues = { ...prevValues[recordId] };
            delete recordValues[fieldToDelete.name];
            return { ...prevValues, [recordId]: recordValues };
          });
        }
        return {
          ...record,
          fields: record.fields.filter(f => f.id !== fieldId)
        };
      }
      return record;
    }));
  };

  const handleUpdateRecordLabel = (recordId, newLabel) => {
    setRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        return { ...record, label: newLabel };
      }
      return record;
    }));
  };

  const handleSaveSetTemplate = async () => {
    if (!newSetName.trim()) return;
    
    const selectedRecordsData = records.filter(r => selectedRecords.has(r.id));
    const template = createICFSetTemplate(newSetName, selectedRecordsData, formValues);
    
    addTemplate(template);
    setShowSaveSetForm(false);
    setNewSetName("");
    
    setToaster({
      type: "success",
      message: `Saved ICF set "${newSetName}" to templates`,
      show: true,
    });
  };

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

    // Editor logic - Add as sessions to the intervention
    if (activeTab === "Editor") {
      if (!selectedInterventionId) {
        setToaster({
          type: "error",
          message: "No active intervention selected",
          show: true,
        });
        return;
      }

      selectedRecords.forEach(record => {
        const recordValues = formValues[record.id] || {};
        
        // Target a specific microcycle if one is selected
        const targetMicroId = selectedStructuralNodeType === 'Micro' ? selectedStructuralNodeId : undefined;
        
        addSession(selectedInterventionId, {
          name: `${recordValues.code || record.code || ""} ${recordValues.description || record.description || "ICF Record"}`.trim(),
          tags: {
            type: "ICF",
            code: recordValues.code || record.code || "",
            category: recordValues.category || record.category || "",
            qualifier: recordValues.qualifier || ""
          }
        }, targetMicroId);
      });
      
      setToaster({
        type: "success",
        message: `Added ${selectedRecords.length} record(s) to intervention`,
        show: true,
      });
      onClose();
    }
  };

  // Insert a template
  const handleInsertTemplate = (template) => {
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
