import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { FiPlus } from 'react-icons/fi';

const KanbanColumn = ({
  id,
  title,
  records,
  patientId,
  onUpdate,
  onDelete,
  onAdd,
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col w-64 bg-zinc-900 rounded-lg border border-zinc-800 h-full max-h-full">
      <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-800/50 rounded-t-lg">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          {title}
        </h3>
        <span className="bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
          {records.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-grow p-2 overflow-y-auto custom-scrollbar min-h-[100px]"
      >
        <SortableContext items={records.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          {records.map((record) => (
            <KanbanCard
              key={record.id}
              record={record}
              dimension={id}
              patientId={patientId}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={() => onAdd(patientId, id, { code: 'NEW CODE', description: 'Enter description...' })}
        className="m-2 p-2 border border-dashed border-zinc-700 rounded-md text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all flex items-center justify-center gap-2 text-xs group"
      >
        <FiPlus className="group-hover:scale-110 transition-transform" />
        <span>Add record</span>
      </button>
    </div>
  );
};

export default KanbanColumn;
