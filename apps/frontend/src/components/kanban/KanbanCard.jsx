import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const KanbanCard = ({ record, dimension, patientId, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: record.id });

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    code: record.code || '',
    description: record.description || '',
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(patientId, dimension, record.id, editValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValues({
      code: record.code || '',
      description: record.description || '',
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-zinc-700 p-3 rounded-md border border-zinc-500 mb-2 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editValues.code}
            onChange={(e) => setEditValues({ ...editValues, code: e.target.value })}
            className="bg-zinc-800 text-white text-xs p-1 rounded border border-zinc-600 focus:outline-none focus:border-blue-500"
            placeholder="Code"
            autoFocus
          />
          <textarea
            value={editValues.description}
            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
            className="bg-zinc-800 text-white text-xs p-1 rounded border border-zinc-600 focus:outline-none focus:border-blue-500 min-h-[60px] resize-none"
            placeholder="Description"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button onClick={handleCancel} className="text-zinc-400 hover:text-red-400">
              <FiX size={14} />
            </button>
            <button onClick={handleSave} className="text-zinc-400 hover:text-green-400">
              <FiCheck size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-zinc-800 p-3 rounded-md border border-zinc-700 mb-2 shadow-sm hover:border-zinc-500 transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          {record.category || 'ICF'}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <FiEdit2 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(patientId, dimension, record.id);
            }}
            className="text-zinc-500 hover:text-red-400 transition-colors"
          >
            <FiTrash2 size={12} />
          </button>
        </div>
      </div>
      <div className="text-sm font-bold text-zinc-100 mb-1">{record.code}</div>
      <div className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
        {record.description}
      </div>
    </div>
  );
};

export default KanbanCard;
