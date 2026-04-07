import React, { useState } from "react";
import Modal from "react-modal";
import { Rnd } from "react-rnd";
import { FiSearch, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import { useInterventionStore } from "../state/core/useInterventionStore";
import useUIStore from "../state/core/useUIStore";

const TemplaterModal = ({ isOpen, onClose }) => {
  const { templates, loadTemplate, removeTemplate } = useInterventionStore();
  const { addToast } = useUIStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());

  // Filter templates based on search term
  const filteredTemplates = templates.filter((template) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      template.name.toLowerCase().includes(searchLower) ||
      (template.content?.type && template.content.type.toLowerCase().includes(searchLower))
    );
  });

  // Toggle template selection
  const handleTemplateSelect = (templateId) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplates(newSelected);
  };

  // Insert multiple templates
  const handleInsertMultiple = () => {
    Array.from(selectedTemplates).forEach(templateId => {
      loadTemplate(templateId);
    });
    setSelectedTemplates(new Set());
    addToast({ type: 'success', message: `Added ${selectedTemplates.size} templates to intervention` });
    onClose();
  };

  const handleInsertSingle = (templateId) => {
    loadTemplate(templateId);
    addToast({ type: 'success', message: 'Template added to intervention' });
    onClose();
  };

  const handleDeleteTemplate = (e, templateId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this template?")) {
      removeTemplate(templateId);
      addToast({ type: 'info', message: 'Template deleted' });
    }
  };

  // Default modal configuration for Rnd
  const defaultModalConfig = {
    width: 800,
    height: 600,
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 400 : 100,
    y: typeof window !== "undefined" ? window.innerHeight / 2 - 300 : 100,
  };

  const getTemplateStats = (template) => {
    const content = template.content;
    if (!content) return "Legacy Template";
    
    let phases = 0, micros = 0, sessions = 0;
    const count = (node) => {
      if (node.type === 'Phase') phases++;
      if (node.type === 'Micro') micros++;
      if (node.type === 'Session') sessions++;
      if (node.microcycles) node.microcycles.forEach(count);
      if (node.sessions) node.sessions.forEach(count);
    };
    count(content);

    const parts = [];
    if (phases > 0) parts.push(`${phases} Phase${phases > 1 ? 's' : ''}`);
    if (micros > 0) parts.push(`${micros} Micro${micros > 1 ? 's' : ''}`);
    if (sessions > 0) parts.push(`${sessions} Session${sessions > 1 ? 's' : ''}`);
    
    return parts.join(', ') || "Empty Template";
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Intervention Templater"
      style={{
        content: {
          background: 'transparent',
          border: 'none',
          padding: 0,
          inset: 0,
          overflow: 'hidden',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1000,
        },
      }}
    >
      <Rnd
        default={defaultModalConfig}
        minWidth={600}
        minHeight={400}
        bounds="window"
        dragHandleClassName="modal-handle"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className="bg-zinc-900 text-white shadow-lg overflow-hidden flex flex-col h-full rounded-lg border border-zinc-700">
          {/* Header */}
          <div className="bg-zinc-800 px-4 py-2 flex justify-between items-center modal-handle cursor-move rounded-t-lg border-b border-zinc-700">
            <h2 className="text-sm font-medium tracking-tight">Intervention Templater</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <FiX size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="relative mb-2">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search templates (e.g., 'Phase', 'Strength', 'Micro')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-[11px] py-2 w-full rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {selectedTemplates.size > 0 && (
              <div className="flex items-center justify-between p-2 bg-blue-900/20 border border-blue-800/50 rounded-lg mt-2 animate-in fade-in slide-in-from-top-1">
                <div className="text-xs text-blue-300">
                  <span className="font-bold">{selectedTemplates.size}</span> templates selected
                </div>
                <button
                  onClick={handleInsertMultiple}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  <FiPlus size={14} />
                  <span>Add Selected to Intervention</span>
                </button>
              </div>
            )}
          </div>

          {/* Templates List */}
          <div className="flex-grow overflow-y-auto p-4 custom-scrollbar-hover">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 bg-zinc-800/20 rounded-lg border border-dashed border-zinc-800">
                <p className="text-sm italic">No templates found.</p>
                <p className="text-xs mt-1">Save Phases or Microcycles from the Editor to see them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTemplates.map(template => (
                  <div 
                    key={template.id}
                    className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer group ${
                      selectedTemplates.has(template.id)
                        ? "border-blue-500 bg-blue-900/10"
                        : "border-zinc-800 bg-zinc-800/40 hover:border-zinc-700 hover:bg-zinc-800/60"
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm text-white truncate">
                            {template.name}
                          </h4>
                          <span className={`px-1.5 py-0.5 text-[9px] rounded uppercase font-bold ${
                            template.content?.type === 'Phase' ? 'bg-purple-900/50 text-purple-300' : 
                            template.content?.type === 'Micro' ? 'bg-blue-900/50 text-blue-300' : 'bg-zinc-700 text-zinc-300'
                          }`}>
                            {template.content?.type || 'Misc'}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mb-2 italic">
                          {getTemplateStats(template)}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-mono">
                          Saved: {template.date}
                        </p>
                      </div>
                      
                      <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertSingle(template.id);
                          }}
                          className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                          title="Insert template"
                        >
                          <FiPlus size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTemplate(e, template.id)}
                          className="p-1.5 rounded bg-zinc-700 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors"
                          title="Delete template"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-zinc-800 bg-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
            <div>Total Templates: {templates.length}</div>
            <div className="italic">Click to select, use + to insert immediately</div>
          </div>
        </div>
      </Rnd>
    </Modal>
  );
};

export default TemplaterModal;
