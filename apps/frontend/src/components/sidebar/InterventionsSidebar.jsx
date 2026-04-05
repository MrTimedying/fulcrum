import React, { useMemo, useState } from "react";
import { Tree } from "react-arborist";
import useFlowStore from "../../state/flowState.js";
import { 
  getDynamicTagTree, 
  validateNConsistency, 
  validateKConsistency 
} from "../../utils/tagTreeUtils.js";
import { 
  HiChevronRight, 
  HiChevronDown,
  HiOutlineQueueList,
  HiOutlineCalendarDays,
  HiOutlinePlay,
  HiOutlineTag,
  HiOutlineExclamationTriangle,
  HiPlus,
  HiTrash
} from "react-icons/hi2";
import { format } from "date-fns";

const NodeRenderer = ({ node, style, dragHandle }) => {
  const Icon = useMemo(() => {
    if (node.data.type === 'folder') return HiOutlineQueueList;
    if (node.data.type === 'session') return HiOutlineCalendarDays;
    if (node.data.type === 'exercise') return HiOutlinePlay;
    return HiOutlineTag;
  }, [node.data.type]);

  const textColorClass = useMemo(() => {
    if (node.data.type === 'folder') return 'text-indigo-300 font-medium';
    if (node.data.type === 'session') return 'text-zinc-300';
    if (node.data.type === 'exercise') return 'text-zinc-500 italic';
    return 'text-zinc-400';
  }, [node.data.type]);

  const dateRange = useMemo(() => {
    if (node.data.type === 'folder' && node.data.startDate && node.data.endDate) {
      const start = format(node.data.startDate, 'MMM d');
      const end = format(node.data.endDate, 'MMM d');
      return `${start} - ${end}`;
    }
    if (node.data.type === 'session' && node.data.originalNode?.date) {
      return format(new Date(node.data.originalNode.date), 'MMM d, yyyy');
    }
    return null;
  }, [node.data]);

  return (
    <div 
      style={style} 
      className={`flex items-center space-x-1.5 py-0.5 cursor-pointer group hover:bg-zinc-800/50 rounded px-1 transition-colors ${node.isSelected ? 'bg-indigo-500/20' : ''}`}
      onClick={() => node.isInternal ? node.toggle() : node.select()}
      ref={dragHandle}
    >
      <div className="flex items-center w-full min-w-0">
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {node.children && node.children.length > 0 && (
            <div className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
              {node.isOpen ? <HiChevronDown size={14} /> : <HiChevronRight size={14} />}
            </div>
          )}
        </div>
        
        <Icon size={14} className={`flex-shrink-0 mr-1.5 ${node.data.type === 'folder' ? 'text-indigo-500' : 'text-zinc-500 group-hover:text-zinc-300 transition-colors'}`} />
        
        <div className="flex flex-col min-w-0 flex-1">
          <span className={`text-[11px] truncate leading-tight ${textColorClass}`}>
            {node.data.name}
          </span>
          {dateRange && (
            <span className="text-[9px] text-zinc-600 font-mono">
              {dateRange}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const InterventionsSidebar = () => {
  const { 
    sessions, 
    interventions, 
    patientId, 
    updateSession, 
    addSession, 
    addIntervention,
    selectedInterventionId,
    setSelectedInterventionId,
    setSelectedSessionId
  } = useFlowStore();
  
  const [groupingKeys] = useState(['Phase', 'Micro']);
  const [pendingMove, setPendingMove] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const activeInterventions = useMemo(() => {
    return Object.values(interventions).filter(i => i.patientId === patientId);
  }, [interventions, patientId]);

  const activeSessions = useMemo(() => {
    if (!selectedInterventionId) return [];
    return Object.values(sessions).filter(s => s.interventionId === selectedInterventionId);
  }, [sessions, selectedInterventionId]);

  const treeData = useMemo(() => {
    return getDynamicTagTree(activeSessions, groupingKeys);
  }, [activeSessions, groupingKeys]);

  const handleMove = ({ dragIds, parentId, index }) => {
    const draggedId = dragIds[0];
    const draggedSession = sessions[draggedId];
    if (!draggedSession) return;
    
    const findFolder = (tree, targetId) => {
      for (const node of tree) {
        if (node.id === targetId) return node;
        if (node.children) {
          const found = findFolder(node.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    const targetFolder = parentId ? findFolder(treeData, parentId) : null;
    
    const siblings = targetFolder ? targetFolder.children : treeData;
    const prevSibling = index > 0 ? siblings[index - 1] : null;
    const nextSibling = index < siblings.length ? siblings[index] : null;

    const nCheck = validateNConsistency(draggedSession, prevSibling?.originalNode, nextSibling?.originalNode);
    const kCheck = validateKConsistency(draggedSession, targetFolder);

    if (!nCheck.valid || !kCheck.valid) {
      setPendingMove({
        nodeId: draggedId,
        targetFolder,
        nCheck,
        kCheck,
        targetIndex: index
      });
      setShowConflictModal(true);
      return;
    }

    applyMove(draggedId, targetFolder, nCheck.suggestedDate);
  };

  const applyMove = (sessionId, targetFolder, suggestedDate) => {
    const session = sessions[sessionId];
    if (!session) return;

    const updates = {};
    if (targetFolder && targetFolder.type === 'folder') {
      updates.tags = { ...session.tags, ...targetFolder.tags };
    }

    if (suggestedDate) {
      updates.date = suggestedDate.toISOString();
    }

    updateSession(sessionId, updates);
  };

  const handleAddIntervention = () => {
    const name = prompt("Enter intervention name:");
    if (name) {
      const id = addIntervention(patientId, name);
      setSelectedInterventionId(id);
    }
  };

  const handleAddSession = () => {
    if (!selectedInterventionId) return;
    const id = addSession(selectedInterventionId);
    setSelectedSessionId(id);
  };

  return (
    <div className="h-full w-full bg-zinc-900 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800/50 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Interventions</h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleAddIntervention} className="text-zinc-500 hover:text-indigo-400 transition-colors">
              <HiPlus size={14} />
            </button>
          </div>
        </div>
        
        <select 
          className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] rounded px-2 py-1 outline-none"
          value={selectedInterventionId || ""}
          onChange={(e) => setSelectedInterventionId(e.target.value)}
        >
          <option value="" disabled>Select Intervention</option>
          {activeInterventions.map(i => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>

        {selectedInterventionId && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter">Sessions</span>
            <button onClick={handleAddSession} className="text-zinc-600 hover:text-zinc-400">
              <HiPlus size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden py-2 relative">
        {!patientId ? (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-600 text-[11px] italic">Select a patient to see the structure</p>
          </div>
        ) : !selectedInterventionId ? (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-600 text-[11px] italic">Select or create an intervention</p>
          </div>
        ) : treeData.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-zinc-600 text-[11px] italic">No sessions found. Add one above.</p>
          </div>
        ) : (
          <div className="h-full px-2">
            <Tree
              data={treeData}
              openByDefault={true}
              width="100%"
              height={800}
              indent={12}
              rowHeight={32}
              onMove={handleMove}
              onSelect={(nodes) => {
                if (nodes[0] && nodes[0].data.type === 'session') {
                  setSelectedSessionId(nodes[0].id);
                }
              }}
              className="react-arborist-tree"
            >
              {NodeRenderer}
            </Tree>
          </div>
        )}

        {/* Conflict Resolution Modal Overlay */}
        {showConflictModal && pendingMove && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-xs overflow-hidden flex flex-col">
              <div className="bg-red-500/10 px-3 py-2 border-b border-red-500/20 flex items-center space-x-2">
                <HiOutlineExclamationTriangle className="text-red-500" size={16} />
                <span className="text-[11px] font-bold text-red-200 uppercase tracking-tight">System Conflict Detected</span>
              </div>
              
              <div className="p-3 space-y-3">
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  The move breaks chronological or periodization integrity.
                </p>

                {!pendingMove.nCheck.valid && (
                  <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Chronological Conflict</span>
                    <p className="text-[10px] text-zinc-300">Proposed position breaks date sequence.</p>
                  </div>
                )}

                {!pendingMove.kCheck.valid && (
                  <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Taxonomic Conflict</span>
                    <p className="text-[10px] text-zinc-300">
                      Target requires: <span className="text-indigo-400">{pendingMove.targetFolder.tagValue}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="p-2 bg-zinc-950/50 flex flex-col space-y-1">
                <button 
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-medium rounded transition-colors"
                  onClick={() => {
                    applyMove(pendingMove.nodeId, pendingMove.targetFolder, pendingMove.nCheck.suggestedDate);
                    setShowConflictModal(false);
                    setPendingMove(null);
                  }}
                >
                  Mutate Data & Confirm
                </button>
                <button 
                  className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-medium rounded transition-colors"
                  onClick={() => {
                    setShowConflictModal(false);
                    setPendingMove(null);
                  }}
                >
                  Revert Move
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterventionsSidebar;
