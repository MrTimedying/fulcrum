import React, { useMemo, useState, useEffect, useCallback } from "react";
import { 
  DndContext, 
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useInterventionStore } from "../../state/core/useInterventionStore";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import { 
  HiOutlineQueueList,
  HiOutlineCalendarDays,
  HiPlus,
  HiTrash,
  HiOutlineSquare2Stack,
  HiOutlineRectangleStack
} from "react-icons/hi2";
import TemplaterModal from "../TemplaterModal";
import TreeContextMenu from "./TreeContextMenu";
import { AnimatePresence, motion } from "motion/react";
import { TreeItem, SortableTreeItem, TreeBranch } from "./TreeComponents";

const InterventionsSidebar = () => {
  const { 
    sessions, interventions, phases, microcycles,
    selectedInterventionId, setSelectedInterventionId,
    selectedSessionId, selectedStructuralNodeId,
    addIntervention, addPhase, addMicrocycle, addSession,
    moveSession, moveMicrocycle, movePhase, removeIntervention,
    setSelectedNode, renameNode, duplicateNode, addTemplateFromNode,
    deletePhase, deleteMicrocycle, deleteSession
  } = useInterventionStore();
  
  const { patientId } = useNavigationStore();
  const [isAddingIntervention, setIsAddingIntervention] = useState(false);
  const [newInterventionName, setNewInterventionName] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [renamingId, setRenamingId] = useState(null);
  const [isTemplaterOpen, setIsTemplaterOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [activeDragId, setActiveDragId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeInterventions = useMemo(() => 
    Object.values(interventions).filter(i => i.patientId === patientId),
    [interventions, patientId]
  );

  const selectedIntervention = interventions[selectedInterventionId] || null;

  useEffect(() => {
    if (!selectedInterventionId && activeInterventions.length > 0) {
      setSelectedInterventionId(activeInterventions[0].id);
    }
  }, [activeInterventions, selectedInterventionId, setSelectedInterventionId]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((id, type) => {
    setSelectedNode(id, type === 'Session' ? 'Session' : type);
  }, [setSelectedNode]);

  const handleContextMenu = useCallback((e, id, type, data) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: id,
      nodeType: type,
      data
    });
  }, []);

  const handleRenameComplete = useCallback((id, type, newName) => {
    if (newName && newName !== (interventions[id]?.name || phases[id]?.name || microcycles[id]?.name || sessions[id]?.name)) {
      renameNode(id, type, newName);
    }
    setRenamingId(null);
  }, [renameNode, interventions, phases, microcycles, sessions]);

  // --- Addition Actions ---
  const handleAddPhase = () => {
    if (selectedInterventionId) {
      const id = addPhase(selectedInterventionId);
      setExpandedIds(prev => new Set(prev).add(id));
      setSelectedNode(id, 'Phase');
    }
  };

  const handleAddMicro = () => {
    if (!selectedInterventionId) return;
    let targetPhaseId = null;
    if (selectedStructuralNodeId && phases[selectedStructuralNodeId]) {
      targetPhaseId = selectedStructuralNodeId;
    } else if (selectedStructuralNodeId && microcycles[selectedStructuralNodeId]) {
      targetPhaseId = Object.keys(phases).find(pid => phases[pid].microcycleIds?.includes(selectedStructuralNodeId));
    } else if (selectedSessionId) {
      const mid = Object.keys(microcycles).find(mid => microcycles[mid].sessionIds?.includes(selectedSessionId));
      if (mid) targetPhaseId = Object.keys(phases).find(pid => phases[pid].microcycleIds?.includes(mid));
    }

    if (!targetPhaseId && selectedIntervention.phaseIds?.length > 0) {
      targetPhaseId = selectedIntervention.phaseIds[0];
    }

    if (targetPhaseId) {
      const id = addMicrocycle(targetPhaseId);
      setExpandedIds(prev => new Set(prev).add(targetPhaseId).add(id));
      setSelectedNode(id, 'Micro');
    } else {
      const pid = addPhase(selectedInterventionId);
      const mid = addMicrocycle(pid);
      setExpandedIds(prev => new Set(prev).add(pid).add(mid));
      setSelectedNode(mid, 'Micro');
    }
  };

  const handleAddSessionAction = () => {
    if (!selectedInterventionId) return;
    let targetMicroId = null;
    if (selectedStructuralNodeId && microcycles[selectedStructuralNodeId]) {
      targetMicroId = selectedStructuralNodeId;
    } else if (selectedSessionId) {
      targetMicroId = Object.keys(microcycles).find(mid => microcycles[mid].sessionIds?.includes(selectedSessionId));
    }

    const sid = addSession(selectedInterventionId, {}, targetMicroId);
    if (targetMicroId) setExpandedIds(prev => new Set(prev).add(targetMicroId));
    setSelectedNode(sid, 'Session');
  };

  // --- DnD Handlers ---
  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;
    const activeType = active.data.current.type;

    if (activeType === 'Phase') {
      const oldIndex = selectedIntervention.phaseIds.indexOf(activeId);
      const newIndex = selectedIntervention.phaseIds.indexOf(overId);
      if (newIndex !== -1) movePhase(selectedInterventionId, activeId, newIndex);
    } 
    else if (activeType === 'Micro') {
      const sourcePhaseId = Object.keys(phases).find(pid => phases[pid].microcycleIds?.includes(activeId));
      if (!sourcePhaseId) return;
      let targetPhaseId = Object.keys(phases).find(pid => phases[pid].microcycleIds?.includes(overId)) || (phases[overId] ? overId : null);
      if (!targetPhaseId) return;
      const overIndex = phases[targetPhaseId].microcycleIds?.indexOf(overId) ?? 0;
      const newIndex = overIndex === -1 ? phases[targetPhaseId].microcycleIds.length : overIndex;
      moveMicrocycle(sourcePhaseId, targetPhaseId, activeId, newIndex);
    } 
    else if (activeType === 'Session') {
      const sourceMicroId = Object.keys(microcycles).find(mid => microcycles[mid].sessionIds?.includes(activeId));
      let targetMicroId = Object.keys(microcycles).find(mid => microcycles[mid].sessionIds?.includes(overId)) || (microcycles[overId] ? overId : null);
      if (overId === 'folder-orphaned') targetMicroId = null;
      const overIndex = targetMicroId ? microcycles[targetMicroId].sessionIds?.indexOf(overId) : -1;
      const newIndex = overIndex === -1 ? (targetMicroId ? microcycles[targetMicroId].sessionIds.length : 0) : overIndex;
      moveSession(sourceMicroId || null, targetMicroId || null, activeId, newIndex);
    }
  };

  // --- Rendering ---

  const renderSession = (sid) => {
    const session = sessions[sid];
    if (!session) return null;
    return (
      <SortableTreeItem
        key={sid}
        id={sid}
        type="Session"
        data={session}
        isSelected={selectedSessionId === sid}
        onSelect={handleSelect}
        onContextMenu={handleContextMenu}
        renamingId={renamingId}
        onRenameComplete={handleRenameComplete}
        compact={true}
      />
    );
  };

  const renderMicro = (mid) => {
    const micro = microcycles[mid];
    if (!micro) return null;
    return (
      <SortableTreeItem
        key={mid}
        id={mid}
        type="Micro"
        data={micro}
        isExpanded={expandedIds.has(mid)}
        onToggle={toggleExpand}
        isSelected={selectedStructuralNodeId === mid}
        onSelect={handleSelect}
        onContextMenu={handleContextMenu}
        renamingId={renamingId}
        onRenameComplete={handleRenameComplete}
        hasChildren={true}
        compact={true}
      >
        <TreeBranch items={micro.sessionIds || []} sortable={true}>
          {micro.sessionIds?.map(renderSession)}
          {(!micro.sessionIds || micro.sessionIds.length === 0) && (
            <div className="px-6 py-2 text-[10px] text-zinc-600 italic">No sessions</div>
          )}
        </TreeBranch>
      </SortableTreeItem>
    );
  };

  const renderPhase = (pid) => {
    const phase = phases[pid];
    if (!phase) return null;
    return (
      <SortableTreeItem
        key={pid}
        id={pid}
        type="Phase"
        data={phase}
        isExpanded={expandedIds.has(pid)}
        onToggle={toggleExpand}
        isSelected={selectedStructuralNodeId === pid}
        onSelect={handleSelect}
        onContextMenu={handleContextMenu}
        renamingId={renamingId}
        onRenameComplete={handleRenameComplete}
        hasChildren={true}
        compact={true}
      >
        <TreeBranch items={phase.microcycleIds || []} sortable={true}>
          {phase.microcycleIds?.map(renderMicro)}
          {(!phase.microcycleIds || phase.microcycleIds.length === 0) && (
            <div className="px-6 py-2 text-[10px] text-zinc-600 italic">No microcycles</div>
          )}
        </TreeBranch>
      </SortableTreeItem>
    );
  };

  const orphanedSessions = useMemo(() => {
    if (!selectedInterventionId) return [];
    const assignedIds = new Set();
    Object.values(phases).forEach(p => p.microcycleIds?.forEach(mid => microcycles[mid]?.sessionIds?.forEach(sid => assignedIds.add(sid))));
    return Object.values(sessions).filter(s => s.interventionId === selectedInterventionId && !assignedIds.has(s.id));
  }, [selectedInterventionId, phases, microcycles, sessions]);

  const activeDragNode = useMemo(() => {
    if (!activeDragId) return null;
    return phases[activeDragId] || microcycles[activeDragId] || sessions[activeDragId];
  }, [activeDragId, phases, microcycles, sessions]);

  const activeDragType = useMemo(() => {
    if (!activeDragId) return null;
    if (phases[activeDragId]) return 'Phase';
    if (microcycles[activeDragId]) return 'Micro';
    if (sessions[activeDragId]) return 'Session';
    return null;
  }, [activeDragId, phases, microcycles, sessions]);

  return (
    <div className="h-full w-full bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-zinc-800/50 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Interventions</h2>
          <div className="flex items-center gap-2">
            {selectedInterventionId && (
              <button 
                onClick={() => removeIntervention(patientId, selectedInterventionId)} 
                className="text-zinc-600 hover:text-red-400 transition-colors" 
                title="Delete Intervention"
              >
                <HiTrash size={14} />
              </button>
            )}
            <button 
              onClick={() => setIsAddingIntervention(!isAddingIntervention)} 
              className={`transition-colors ${isAddingIntervention ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`} 
              title="Add Intervention"
            >
              <HiPlus size={14} />
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {isAddingIntervention && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <input
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] rounded px-2 py-1 outline-none mb-2"
                placeholder="New intervention name..."
                value={newInterventionName}
                onChange={(e) => setNewInterventionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newInterventionName.trim()) {
                    const id = addIntervention(patientId, newInterventionName);
                    setSelectedInterventionId(id);
                    setIsAddingIntervention(false);
                    setNewInterventionName("");
                  }
                  if (e.key === 'Escape') setIsAddingIntervention(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <select 
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] rounded px-2 py-1.5 outline-none cursor-pointer hover:border-zinc-600 transition-colors"
          value={selectedInterventionId || ""}
          onChange={(e) => setSelectedInterventionId(e.target.value)}
        >
          <option value="" disabled>Select Intervention</option>
          {activeInterventions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar-hover">
        {!selectedInterventionId ? (
          <div className="px-4 py-8 text-center text-zinc-600 text-[11px] italic">Select or create an intervention</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-0.5">
              <TreeBranch items={selectedIntervention.phaseIds || []} sortable={true}>
                {selectedIntervention.phaseIds?.map(renderPhase)}
              </TreeBranch>
              
              {orphanedSessions.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter opacity-70">
                    Unassigned Sessions
                  </div>
                  <TreeBranch items={orphanedSessions.map(s => s.id)} sortable={true}>
                    <div id="folder-orphaned">
                      {orphanedSessions.map(s => renderSession(s.id))}
                    </div>
                  </TreeBranch>
                </div>
              )}
              
              {(!selectedIntervention.phaseIds || selectedIntervention.phaseIds.length === 0) && orphanedSessions.length === 0 && (
                <div className="px-4 py-8 text-center text-zinc-600 text-[11px] italic text-center">
                  Empty intervention. Add a phase to get started.
                </div>
              )}
            </div>

            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.4' } }
              })
            }}>
              {activeDragId && activeDragNode ? (
                <div className="pointer-events-none">
                  <TreeItem 
                    id={activeDragId} 
                    type={activeDragType} 
                    data={activeDragNode} 
                    isOverlay 
                    isExpanded={expandedIds.has(activeDragId)}
                    compact={true}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-1.5 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-around">
        <button 
          onClick={handleAddPhase} 
          disabled={!selectedInterventionId}
          className={`flex items-center justify-center p-1.5 rounded transition-all ${!selectedInterventionId ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 active:scale-95'}`}
          title="Add Phase"
        >
          <HiOutlineQueueList size={16} />
        </button>
        
        <button 
          onClick={handleAddMicro} 
          disabled={!selectedInterventionId}
          className={`flex items-center justify-center p-1.5 rounded transition-all ${!selectedInterventionId ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 active:scale-95'}`}
          title="Add Microcycle"
        >
          <HiOutlineSquare2Stack size={16} />
        </button>

        <button 
          onClick={handleAddSessionAction} 
          disabled={!selectedInterventionId}
          className={`flex items-center justify-center p-1.5 rounded transition-all ${!selectedInterventionId ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 active:scale-95'}`}
          title="Add Session"
        >
          <HiOutlineCalendarDays size={16} />
        </button>

        <div className="w-px h-4 bg-zinc-800 mx-1" />

        <button 
          onClick={() => setIsTemplaterOpen(true)} 
          disabled={!selectedInterventionId}
          className={`flex items-center justify-center p-1.5 rounded transition-all ${!selectedInterventionId ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-500 hover:text-green-400 hover:bg-zinc-800 active:scale-95'}`}
          title="Open Templater"
        >
          <HiOutlineRectangleStack size={16} />
        </button>
      </div>

      <TemplaterModal 
        isOpen={isTemplaterOpen} 
        onClose={() => setIsTemplaterOpen(false)} 
      />

      <AnimatePresence>
        {contextMenu && (
          <TreeContextMenu
            {...contextMenu}
            onClose={() => setContextMenu(null)}
            onDuplicate={() => duplicateNode(contextMenu.nodeId, contextMenu.nodeType)}
            onDelete={() => {
              const { nodeId, nodeType } = contextMenu;
              if (nodeType === 'Phase') deletePhase(selectedInterventionId, nodeId);
              else if (nodeType === 'Micro') {
                const pid = Object.keys(phases).find(p => phases[p].microcycleIds?.includes(nodeId));
                if (pid) deleteMicrocycle(pid, nodeId);
              }
              else if (nodeType === 'Session') {
                const mid = Object.keys(microcycles).find(m => microcycles[m].sessionIds?.includes(nodeId));
                deleteSession(nodeId, mid);
              }
            }}
            onSaveTemplate={() => {
              addTemplateFromNode(contextMenu.nodeId, contextMenu.nodeType, contextMenu.data.name);
            }}
            onRename={() => {
              setRenamingId(contextMenu.nodeId);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterventionsSidebar;
