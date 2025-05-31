import React, { useState } from "react";
import RecordEditor from "./RecordEditor";
import FieldButtons from "./FieldButtons";
import { createDefaultICFRecord, createDefaultField } from "./helpers";
import { FiSearch, FiPlusCircle, FiPlus, FiAlertTriangle } from "react-icons/fi";
import useTransientStore from "../../../state/transientState";

// NodeEditor component for editing and managing individual ICF record nodes
const NodeEditor = ({
  records,
  formValues,
  errors,
  onRecordAdd,
  onRecordDelete,
  onInputChange,
  onFieldAdd,
  onFieldDelete,
  onUpdateRecordLabel,
  onAddSelectedToFlow,
  onSaveTemplate,
  // Props for state lifted to parent
  selectedRecords,
  setSelectedRecords,
  showSaveSetForm,
  setShowSaveSetForm,
  newSetName,
  setNewSetName,
}) => {
  const { setToaster } = useTransientStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filter records based on search term
  const filteredRecords = records.filter((record) => {
    // Always include selected records
    if (selectedRecords.has(record.id)) return true;

    // Skip filtering if search term is empty
    if (!searchTerm.trim()) return true;

    const recordValues = formValues[record.id] || {};
    const searchLower = searchTerm.toLowerCase();

    // Search in code and description
    if (record.code && record.code.toLowerCase().includes(searchLower)) return true;
    if (recordValues.code && recordValues.code.toLowerCase().includes(searchLower)) return true;
    if (recordValues.description && recordValues.description.toLowerCase().includes(searchLower)) return true;

    return false;
  });

  // No longer needed as we're only using checkboxes for selection
  const handleRecordSelect = (recordId) => {
    // Keep for compatibility but no longer actively used
  };

  // Toggle record selection for bulk operations
  const handleRecordCheckboxToggle = (recordId) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  // Add a new record
  const handleAddRecord = () => {
    const newRecord = createDefaultICFRecord();
    onRecordAdd(newRecord);
    setSelectedRecord(newRecord.id);
  };

  // Handle adding selected records to flow
  const handleAddSelectedToFlow = () => {
    onAddSelectedToFlow(Array.from(selectedRecords));
    setSelectedRecords(new Set());
  };

  // Handle saving selected records as a template
  const handleSaveAsTemplate = () => {
    if (newSetName.trim() && selectedRecords.size > 0) {
      onSaveTemplate(newSetName, Array.from(selectedRecords));
      setSelectedRecords(new Set());
      setNewSetName("");
      setShowSaveSetForm(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Search and Actions Bar */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 ">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by code, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-[10px] py-1 w-full rounded bg-zinc-800 border  text-white focus:outline-none caret-white border-r-2 border-zinc-900"
            />
          </div>
          <button
            onClick={handleAddRecord}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-zinc-800 text-white hover:bg-slate-800 border border-zinc-900 transition-colors duration-200"
            title="Add new record"
          >
            <FiPlusCircle />
            <span>New</span>
          </button>
        </div>

        {/* Save as Template Form */}
        {showSaveSetForm && (
          <div className=" p-3 bg-zinc-800 rounded-lg">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter set name"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                className="flex-grow p-2 rounded bg-zinc-700 border border-zinc-600 text-white focus:outline-none focus:border-blue-600"
              />
              <button
                onClick={handleSaveAsTemplate}
                disabled={!newSetName.trim() || selectedRecords.size === 0}
                className={`px-3 py-2 rounded text-white ${
                  !newSetName.trim() || selectedRecords.size === 0
                    ? "bg-zinc-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } transition-colors duration-200`}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Field Buttons - Always visible but conditionally enabled */}
      <div className={`p-4 border-b border-zinc-700 ${selectedRecords.size > 0 ? 'bg-zinc-800/50' : 'bg-zinc-900/80'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-sm font-medium ${selectedRecords.size > 0 ? 'text-white' : 'text-zinc-500'}`}>
            Add Fields to Selected Records
          </h3>
          <div className="text-xs text-zinc-400">
            {selectedRecords.size > 0 ? 
              `${selectedRecords.size} record(s) selected` : 
              "Select records to add fields"}
          </div>
        </div>
        <div className={selectedRecords.size === 0 ? 'opacity-50 pointer-events-none' : ''}>
          <FieldButtons 
            onAddField={(_, fieldType) => {
              // Add the field to all selected records
              Array.from(selectedRecords).forEach(recordId => {
                onFieldAdd(recordId, fieldType);
              });
            }} 
          />
        </div>
      </div>

      {/* Records List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <p className="text-lg mb-2">No records found</p>
            <p className="text-sm">
              {searchTerm
                ? "Try a different search term or clear the search"
                : "Click the 'New' button to add your first record"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filteredRecords.map((record) => (
              <RecordEditor
                key={record.id}
                record={record}
                formValues={formValues}
                errors={errors}
                onInputChange={onInputChange}
                onFieldDelete={onFieldDelete}
                onRecordDelete={onRecordDelete}
                selected={record.id === selectedRecord}
                onSelect={handleRecordSelect}
                isSelected={selectedRecords.has(record.id)}
                onToggleSelect={handleRecordCheckboxToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeEditor;
