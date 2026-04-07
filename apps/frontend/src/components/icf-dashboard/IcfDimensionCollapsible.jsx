import React, { useState } from 'react';
import { FiChevronRight, FiChevronDown, FiPlusCircle, FiTrash2 } from 'react-icons/fi';

const IcfDimensionCollapsible = ({
  dimensionId,
  title,
  records,
  patientId,
  onUpdate,
  onDelete,
  onAdd
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-800/50">
      <div 
        className="flex justify-between items-center py-2 px-3 hover:bg-zinc-800/40 cursor-pointer group transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">
            {title}
          </span>
          <span className="text-[9px] font-mono text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">
            {records?.length || 0}
          </span>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAdd(patientId, dimensionId);
          }}
          className="p-1 text-zinc-600 hover:text-blue-500 transition-colors"
          title={`Add to ${title}`}
        >
          <FiPlusCircle size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="bg-zinc-900/50 flex flex-col">
          {records && records.length > 0 ? (
            records.map((record) => (
              <div 
                key={record.id}
                className="flex items-center justify-between py-1.5 pl-8 pr-4 border-b border-zinc-800/30 hover:bg-zinc-800/20 group transition-colors"
              >
                <span className="text-[11px] text-zinc-300 truncate">
                  {record.description || record.title || "Untitled Record"}
                </span>
                <button 
                  onClick={() => onDelete(patientId, dimensionId, record.id)} 
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all ml-2 flex-shrink-0"
                  title="Delete record"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="py-2 pl-8 pr-4 text-[10px] text-zinc-600 italic">
              No records found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IcfDimensionCollapsible;
