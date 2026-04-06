import React, { useMemo, useState, useEffect } from "react";
import { Tree } from "react-arborist";
import { useInterventionStore } from "../../state/core/useInterventionStore";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import { getStructureTree } from "../../utils/tagTreeUtils.js";
import { 
  HiChevronRight, 
  HiChevronDown,
  HiOutlineQueueList,
  HiOutlineCalendarDays,
  HiOutlinePlay,
  HiOutlineTag,
  HiPlus,
  HiTrash,
  HiOutlineSquare2Stack,
  HiOutlinePencilSquare
} from "react-icons/hi2";
import { format } from "date-fns";
import { InlineEdit } from "../icf-dashboard/icf_modal/InlineEdit";

const NodeRenderer = ({ node, style, dragHandle, tree }) => {
  const { deletePhase, deleteMicrocycle, deleteSession, updatePhase, updateMicrocycle, updateSession } = useInterventionStore();

  const Icon = useMemo(() => {
    if (node.data.type === 'folder') return HiOutlineQueueList;
    if (node.data.type === 'session') return HiOutlineCalendarDays;
    if (node.data.type === 'exercise') return HiOutlinePlay;
    return HiOutlineTag;
  }, [node.data.type]);

  const dateRange = useMemo(() => {
    if (node.data.type === 'folder' && node.data.startDate && node.data.endDate) {
      return `${format(node.data.startDate, 'MMM d')} - ${format(node.data.endDate, 'MMM d')}`;
    }
    if (node.data.type === 'session' && node.data.originalNode?.date) {
      return format(new Date(node.data.originalNode.date), 'MMM d, yyyy');
    }
    return null;
  }, [node.data]);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (node.data.type === 'session') {
      deleteSession(node.id, node.data.parentId);
    } else if (node.data.tagKey === 'Phase') {
      deletePhase(tree.props.interventionId, node.id);
    } else if (node.data.tagKey === 'Micro') {
      deleteMicrocycle(node.data.parentId, node.id);
    }
  };

  const handleRename = (newName) => {
    if (node.data.type === 'session') {
      updateSession(node.id, { name: newName });
    } else if (node.data.tagKey === 'Phase') {
      updatePhase(node.id, { name: newName });
    } else if (node.data.tagKey === 'Micro') {
      updateMicrocycle(node.id, { name: newName });
    }
  };

  return (
    <div 
      style={style} 
      className={`flex items-center space-x-1.5 py-1 cursor-pointer group hover:bg-zinc-800/50 rounded px-1 transition-colors ${node.isSelected ? 'bg-blue-900/20 border-l-2 border-blue-500' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        node.select();
        if (node.isInternal) node.toggle();
      }}
      ref={dragHandle}
    >
      <div className="flex items-center w-full min-w-0">
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {node.children && node.children.length > 0 && (
            <div className="text-zinc-600 group-hover:text-zinc-400">
              {node.isOpen ? <HiChevronDown size={14} /> : <HiChevronRight size={14} />}
            </div>
          )}
        </div>
        
        <Icon size={14} className={`flex-shrink-0 mr-1.5 ${node.data.type === 'folder' ? 'text-blue-400' : 'text-zinc-500'}`} />
        
        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-[11px] truncate leading-tight text-zinc-300">
            <InlineEdit 
              value={node.data.name} 
              onSave={handleRename} 
              className="hover:bg-zinc-700/50 rounded px-1 -ml-1"
            />
          </div>
          {dateRange && <span className="text-[9px] text-zinc-600 font-mono">{dateRange}</span>}
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
          <button onClick={handleDelete} className="p-1 hover:text-red-400 text-zinc-500" title="Delete">
            <HiTrash size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const InterventionsSidebar = () => {
  const { 
    sessions, interventions, phases, microcycles,
    selectedInterventionId, setSelectedInterventionId, setSelectedSessionId,
    addIntervention, addPhase, addMicrocycle, addSession,
    moveSession, moveMicrocycle, movePhase, cloneSessions, removeIntervention
  } = useInterventionStore();
  
  const { patientId } = useNavigationStore();
  const [isAddingIntervention, setIsAddingIntervention] = useState(false);
  const [newInterventionName, setNewInterventionName] = useState("");
  const [treeRef, setTreeRef] = useState(null);

  const activeInterventions = useMemo(() => 
    Object.values(interventions).filter(i => i.patientId === patientId),
    [interventions, patientId]
  );

  const selectedIntervention = useMemo(() => 
    selectedInterventionId ? interventions[selectedInterventionId] : null,
    [interventions, selectedInterventionId]
  );

  const treeData = useMemo(() => 
    getStructureTree(selectedIntervention, phases, microcycles, sessions),
    [selectedIntervention, phases, microcycles, sessions]
  );

  const handleMove = ({ dragIds, parentId, index }) => {
    const draggedId = dragIds[0];
    const findNode = (tree, id) => {
      for (const n of tree) {
        if (n.id === id) return n;
        if (n.children) {
          const found = findNode(n.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const draggedNode = findNode(treeData, draggedId);
    const targetParent = parentId ? findNode(treeData, parentId) : null;

    if (!draggedNode) return;

    // Hierarchy Validation
    if (draggedNode.type === 'session') {
      if (targetParent?.tagKey === 'Micro') {
        moveSession(draggedNode.parentId, targetParent.id, draggedId, index);
      }
    } else if (draggedNode.tagKey === 'Micro') {
      if (targetParent?.tagKey === 'Phase') {
        moveMicrocycle(draggedNode.parentId, targetParent.id, draggedId, index);
      }
    } else if (draggedNode.tagKey === 'Phase') {
      if (!targetParent) {
        movePhase(selectedInterventionId, draggedId, index);
      }
    }
  };

  const handleClone = () => {
    if (!treeRef) return;
    const selectedNodes = treeRef.selectedNodes;
    if (selectedNodes.length === 0) return;
    
    const sessionIds = selectedNodes
      .filter(n => n.data.type === 'session')
      .map(n => n.id);
    
    const firstSession = selectedNodes.find(n => n.data.type === 'session');
    if (sessionIds.length > 0 && firstSession && firstSession.data.parentId !== 'orphaned') {
      cloneSessions(sessionIds, firstSession.data.parentId);
    }
  };

  const handleAddPhase = () => {
    if (selectedInterventionId) addPhase(selectedInterventionId);
  };

  const handleAddMicro = (phaseId) => {
    // If phaseId is an object (from tree), try to get id
    const targetPhaseId = typeof phaseId === 'string' ? phaseId : phaseId?.id || treeRef?.selectedNodes.find(n => n.data.tagKey === 'Phase')?.id || selectedIntervention?.phaseIds?.[0];
    if (targetPhaseId) addMicrocycle(targetPhaseId);
  };

  const handleDeleteIntervention = () => {
    if (selectedInterventionId) removeIntervention(selectedInterventionId);
  };

  const handleAddSessionAction = (microId) => {
    const targetMicroId = typeof microId === 'string' ? microId : microId?.id || treeRef?.selectedNodes.find(n => n.data.tagKey === 'Micro')?.id;
    const newSessionId = addSession(selectedInterventionId, {}, targetMicroId);
    setSelectedSessionId(newSessionId);
  };

  return (
    <div className="h-full w-full bg-zinc-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Interventions</h2>
          <div className="flex items-center gap-2">
            {selectedInterventionId && (
              <button onClick={handleDeleteIntervention} className="text-zinc-600 hover:text-red-400" title="Delete Intervention">
                <HiTrash size={14} />
              </button>
            )}
            <button onClick={() => setIsAddingIntervention(!isAddingIntervention)} className="text-zinc-500 hover:text-zinc-300" title="Add Intervention">
              <HiPlus size={14} />
            </button>
          </div>
        </div>
        
        {isAddingIntervention && (
          <div className="flex items-center space-x-2">
            <input
              autoFocus
              className="flex-1 bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] rounded px-2 py-1 outline-none"
              placeholder="Name..."
              value={newInterventionName}
              onChange={(e) => setNewInterventionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (addIntervention(patientId, newInterventionName), setIsAddingIntervention(false))}
            />
          </div>
        )}

        <select 
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] rounded px-2 py-1 outline-none"
          value={selectedInterventionId || ""}
          onChange={(e) => setSelectedInterventionId(e.target.value)}
        >
          <option value="" disabled>Select Intervention</option>
          {activeInterventions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-hidden py-2 px-2">
        {selectedInterventionId ? (
          <Tree
            ref={setTreeRef}
            data={treeData}
            openByDefault={true}
            width="100%"
            height={600}
            indent={12}
            rowHeight={36}
            onMove={handleMove}
            interventionId={selectedInterventionId}
            onAddMicro={handleAddMicro}
            onAddSession={handleAddSessionAction}
            multiSelect={true}
            onSelect={(nodes) => {
              const session = nodes.find(n => n.data.type === 'session');
              if (session) setSelectedSessionId(session.id);
            }}
          >
            {NodeRenderer}
          </Tree>
        ) : (
          <div className="px-4 py-8 text-center text-zinc-600 text-[11px] italic">Select or create an intervention</div>
        )}
      </div>

      {/* Bottom IconBar */}
      {selectedInterventionId && (
        <div className="p-2 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-around">
          <button 
            onClick={handleAddPhase} 
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-blue-400 transition-colors group"
            title="Add Phase"
          >
            <HiOutlineQueueList size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[8px] uppercase font-bold">Phase</span>
          </button>
          
          <button 
            onClick={() => handleAddMicro()} 
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-blue-400 transition-colors group"
            title="Add Microcycle"
          >
            <HiOutlineSquare2Stack size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[8px] uppercase font-bold">Micro</span>
          </button>

          <button 
            onClick={() => handleAddSessionAction()} 
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-blue-400 transition-colors group"
            title="Add Session"
          >
            <HiOutlineCalendarDays size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[8px] uppercase font-bold">Session</span>
          </button>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          <button 
            onClick={handleClone} 
            className="flex flex-col items-center gap-1 text-zinc-500 hover:text-green-400 transition-colors group"
            title="Clone Selected"
          >
            <HiOutlineSquare2Stack size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[8px] uppercase font-bold">Clone</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default InterventionsSidebar;
