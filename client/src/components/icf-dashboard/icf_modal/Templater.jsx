import React, { useState } from "react";
import { FiSearch, FiTrash2, FiPlus } from "react-icons/fi";

// Templater component for viewing and managing ICF set templates
const Templater = ({ 
  templates,
  onInsertTemplate,
  onDeleteTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplates, setSelectedTemplates] = useState(new Set());

  // Filter templates based on search term
  const filteredTemplates = templates.filter((template) => {
    // Skip filtering if search term is empty
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    
    // Search in template name and node data
    if (template.name.toLowerCase().includes(searchLower)) return true;
    
    // Search within nodes in the template
    return template.nodes.some(node => 
      (node.data?.code && node.data.code.toLowerCase().includes(searchLower)) ||
      (node.data?.description && node.data.description.toLowerCase().includes(searchLower))
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

  // Insert multiple templates to flow
  const handleInsertMultiple = () => {
    Array.from(selectedTemplates).forEach(templateId => {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        onInsertTemplate(template);
      }
    });
    setSelectedTemplates(new Set());
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-zinc-800">
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="shadow appearance-none rounded w-full text-[12px] font-thin py-1 pl-10 px-3 bg-zinc-800 text-slate-300 leading-tight focus:outline-none focus:shadow-outline transition-all duration-200 dark:bg-zinc-800 dark:text-slate-300 border border-zinc-700"
          />
        </div>

        {/* Selection Controls - Only show when templates are selected */}
        {selectedTemplates.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
            <div className="text-sm text-slate-300">
              <span className="font-medium">{selectedTemplates.size}</span> templates selected
            </div>
            <button
              onClick={handleInsertMultiple}
              className="inline-flex items-center gap-1 px-2 rounded-md bg-neutral-800 text-slate-300 text-[12px] font-medium font-mono hover:bg-black/20 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
            >
              <FiPlus size={14} />
              <span>Add to Flow</span>
            </button>
          </div>
        )}
      </div>

      {/* Templates List */}
      <div className="flex-grow overflow-y-auto p-4">

        <div>
          <h3 className="text-lg font-light text-slate-300 mb-3">@ ICF Set Templates</h3>
          {filteredTemplates.filter(t => t.type === 'icfSet').length === 0 ? (
            <div className="text-center py-4 text-zinc-500 bg-zinc-800/50 rounded-lg">
              <p>No ICF Set templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filteredTemplates
                .filter(t => t.type === 'icfSet')
                .map(template => (
                  <div 
                    key={template.id}
                    className={`p-3 rounded-lg border ${
                      selectedTemplates.has(template.id)
                        ? "border-zinc-700 bg-neutral-800"
                        : "border-neutral-700 bg-neutral-900 hover:border-neutral-600"
                    } transition-all duration-200 cursor-pointer`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-300 flex items-center">
                          {template.name}
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-300">
                            {template.nodes.length} records
                          </span>
                        </h4>
                        <div className="mt-2">
                          <p className="text-xs text-zinc-400 mb-1">Includes:</p>
                          <ul className="text-xs text-zinc-400 space-y-0.5 list-disc list-inside ml-1">
                            {template.nodes.slice(0, 3).map((node, idx) => (
                              <li key={idx}>
                                {node.data?.code || "No code"} - {node.data?.description?.substring(0, 30) || "No description"}
                                {node.data?.description?.length > 30 ? "..." : ""}
                              </li>
                            ))}
                            {template.nodes.length > 3 && (
                              <li className="italic">
                                And {template.nodes.length - 3} more records...
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInsertTemplate(template);
                          }}
                          className="px-2 rounded-md text-[12px] font-medium font-mono bg-neutral-800 text-slate-300 hover:bg-black/20 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                        >
                          Insert
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTemplate(template.id);
                          }}
                          className="p-1 rounded-md text-zinc-400 hover:text-red-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
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
      </div>
    </div>
  );
};

export default Templater;
