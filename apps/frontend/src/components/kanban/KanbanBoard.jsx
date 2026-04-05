import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import useFlowStore from '../../state/flowState';

const DIMENSIONS = [
  { id: 'bodyStructure', title: 'Body Functions & Structures' },
  { id: 'activities', title: 'Activities' },
  { id: 'participation', title: 'Participation' },
  { id: 'environmentalFactors', title: 'Environmental Factors' },
  { id: 'personalFactors', title: 'Personal Factors' },
];

const KanbanBoard = ({ patientId }) => {
  const { 
    patients, 
    updateIcfRecord, 
    addIcfRecord, 
    deleteIcfRecord, 
    moveIcfRecord 
  } = useFlowStore();
  
  const patient = patients[patientId];
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!patient || !patient.icf) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 italic">
        Select a patient to view their profile.
      </div>
    );
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the container for both the active and over items
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Moving between containers
    const activeItems = patient.icf[activeContainer];
    const overItems = patient.icf[overContainer];
    
    const activeIndex = activeItems.findIndex(item => item.id === activeId);
    const overIndex = overItems.findIndex(item => item.id === overId);

    let newIndex;
    if (DIMENSIONS.some(d => d.id === overId)) {
        // If dropping onto a column directly
        newIndex = overItems.length;
    } else {
        // If dropping over another card
        const isBelowOverItem = active.rect.current.translated && 
                                active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
        newIndex = isBelowOverItem ? overIndex + 1 : overIndex;
    }

    moveIcfRecord(patientId, activeContainer, overContainer, activeId, newIndex);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = patient.icf[activeContainer].findIndex(item => item.id === activeId);
      const overIndex = patient.icf[overContainer].findIndex(item => item.id === overId);

      if (activeIndex !== overIndex) {
        moveIcfRecord(patientId, activeContainer, overContainer, activeId, overIndex);
      }
    }

    setActiveId(null);
  };

  const findContainer = (id) => {
    if (DIMENSIONS.some(d => d.id === id)) {
      return id;
    }
    return DIMENSIONS.find(d => 
      patient.icf[d.id]?.some(item => item.id === id)
    )?.id;
  };

  const getActiveRecord = () => {
    if (!activeId) return null;
    const container = findContainer(activeId);
    return patient.icf[container]?.find(item => item.id === activeId);
  };

  const activeRecord = getActiveRecord();
  const activeContainer = activeId ? findContainer(activeId) : null;

  return (
    <div className="flex-grow flex flex-col p-4 overflow-hidden h-full">
      <div className="flex gap-4 h-full overflow-x-auto custom-scrollbar pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {DIMENSIONS.map((dim) => (
            <KanbanColumn
              key={dim.id}
              id={dim.id}
              title={dim.title}
              records={patient.icf[dim.id] || []}
              patientId={patientId}
              onUpdate={updateIcfRecord}
              onDelete={deleteIcfRecord}
              onAdd={addIcfRecord}
            />
          ))}

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
                styles: {
                    active: {
                        opacity: '0.5',
                    },
                },
            }),
          }}>
            {activeId && activeRecord ? (
              <KanbanCard
                record={activeRecord}
                dimension={activeContainer}
                patientId={patientId}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
