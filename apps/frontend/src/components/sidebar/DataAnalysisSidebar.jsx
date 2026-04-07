import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useInterventionStore } from "../../state/core/useInterventionStore";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import useAnalyticsStore from "../../state/core/useAnalyticsStore";
import { getExerciseTags } from "../../utils/analytics/DataAggregator";
import {
  HiChevronRight,
  HiOutlineQueueList,
  HiOutlineAdjustmentsHorizontal
} from "react-icons/hi2";
import { TreeItem, TreeBranch } from "./TreeComponents";

const SidebarPanel = ({ title, children, defaultOpen = true, icon: Icon, compact = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-zinc-800/50 flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 ${compact ? 'py-1.5' : 'py-3'} flex items-center justify-between group hover:bg-zinc-800/20 transition-colors`}
      >
        <div className="flex items-center space-x-2.5">
          <HiChevronRight
            size={compact ? 10 : 12}
            className={`text-zinc-600 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          />
          {Icon && <Icon size={compact ? 12 : 14} className="text-zinc-500 group-hover:text-zinc-400" />}
          <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200`}>
            {title}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`pb-4 px-4 ${compact ? 'pb-2' : 'pb-4'}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DataAnalysisSidebar = () => {
  const { interventions, phases, microcycles, sessions, selectedInterventionId, setSelectedInterventionId } = useInterventionStore();
  const { patientId } = useNavigationStore();
  const { focusNodeId, selectedMetrics, setSelectedMetrics, selectedTags, setSelectedTags, toggleTag, setFocus } = useAnalyticsStore();

  const [expandedIds, setExpandedIds] = useState(new Set());

  const patientInterventions = useMemo(() =>
    Object.values(interventions).filter(i => i.patientId === patientId),
    [interventions, patientId]
  );

  const selectedIntervention = interventions[selectedInterventionId] || null;

  const toggleExpand = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = useCallback((id, type) => {
    setFocus(id, type === 'Micro' ? 'Microcycle' : type);
  }, [setFocus]);

  const allAvailableTags = useMemo(() => {
    const tags = new Set();
    Object.values(sessions).forEach(session => {
      if (session.interventionId === selectedInterventionId) {
        Object.values(session.exercises || {}).forEach(ex => {
          getExerciseTags(ex).forEach(tag => tags.add(tag));
        });
      }
    });
    return Array.from(tags).sort();
  }, [sessions, selectedInterventionId]);

  const metrics = ['Volume', 'Intensity', 'RPE', 'Workload'];

  const handleInterventionChange = (id) => {
    setSelectedInterventionId(id);
    setFocus(null, null);
    setExpandedIds(new Set([id]));
  };

  const renderExercise = (eid, session) => {
    const exercise = session.exercises[eid];
    if (!exercise) return null;
    
    // Ensure backwards compatibility for old UI schema formats that lack a direct 'name'
    const exerciseData = {
      ...exercise,
      name: exercise.name || eid.split('_').slice(0, -1).join('_') || eid
    };

    return (
      <TreeItem
        key={eid}
        id={eid}
        type="Exercise"
        data={exerciseData}
        isSelected={focusNodeId === eid}
        onSelect={handleSelect}
        compact={true}
      />
    );
  };

  const renderSession = (sid) => {
    const session = sessions[sid];
    if (!session) return null;
    const exerciseIds = Object.keys(session.exercises || {});
    return (
      <TreeItem
        key={sid}
        id={sid}
        type="Session"
        data={session}
        isExpanded={expandedIds.has(sid)}
        onToggle={toggleExpand}
        isSelected={focusNodeId === sid}
        onSelect={handleSelect}
        compact={true}
        hasChildren={exerciseIds.length > 0}
      >
        {expandedIds.has(sid) && (
          <TreeBranch>
            {exerciseIds.map(eid => renderExercise(eid, session))}
          </TreeBranch>
        )}
      </TreeItem>
    );
  };

  const renderMicro = (mid) => {
    const micro = microcycles[mid];
    if (!micro) return null;
    return (
      <TreeItem
        key={mid}
        id={mid}
        type="Micro"
        data={micro}
        isExpanded={expandedIds.has(mid)}
        onToggle={toggleExpand}
        isSelected={focusNodeId === mid}
        onSelect={handleSelect}
        compact={true}
        hasChildren={micro.sessionIds?.length > 0}
      >
        {expandedIds.has(mid) && (
          <TreeBranch>
            {micro.sessionIds?.map(renderSession)}
          </TreeBranch>
        )}
      </TreeItem>
    );
  };

  const renderPhase = (pid) => {
    const phase = phases[pid];
    if (!phase) return null;
    return (
      <TreeItem
        key={pid}
        id={pid}
        type="Phase"
        data={phase}
        isExpanded={expandedIds.has(pid)}
        onToggle={toggleExpand}
        isSelected={focusNodeId === pid}
        onSelect={handleSelect}
        compact={true}
        hasChildren={phase.microcycleIds?.length > 0}
      >
        {expandedIds.has(pid) && (
          <TreeBranch>
            {phase.microcycleIds?.map(renderMicro)}
          </TreeBranch>
        )}
      </TreeItem>
    );
  };

  const orphanedSessions = useMemo(() => {
    if (!selectedInterventionId) return [];
    const assignedIds = new Set();
    Object.values(phases).forEach(p => p.microcycleIds?.forEach(mid => microcycles[mid]?.sessionIds?.forEach(sid => assignedIds.add(sid))));
    return Object.values(sessions).filter(s => s.interventionId === selectedInterventionId && !assignedIds.has(s.id));
  }, [selectedInterventionId, phases, microcycles, sessions]);

  const renderInterventionNode = (intervention) => {
    const hasOrphaned = orphanedSessions.length > 0;
    const totalChildren = (intervention.phaseIds?.length || 0) + (hasOrphaned ? 1 : 0);
    
    return (
      <TreeItem
        key={intervention.id}
        id={intervention.id}
        type="Intervention"
        data={intervention}
        isExpanded={expandedIds.has(intervention.id)}
        onToggle={toggleExpand}
        isSelected={focusNodeId === intervention.id}
        onSelect={handleSelect}
        compact={true}
        hasChildren={totalChildren > 0}
      >
        {expandedIds.has(intervention.id) && (
          <TreeBranch>
            {intervention.phaseIds?.map(renderPhase)}
            {hasOrphaned && (
              <div className="mt-2">
                <div className="flex items-center px-2 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter opacity-70">
                  Unassigned
                </div>
                {orphanedSessions.map(s => renderSession(s.id))}
              </div>
            )}
          </TreeBranch>
        )}
      </TreeItem>
    );
  };

  return (
    <div className="h-full w-full bg-zinc-900 flex flex-col overflow-hidden select-none border-r border-zinc-800/50">
      {/* Structural Navigator */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="px-4 py-2 flex items-center space-x-2.5 border-b border-zinc-800/50 flex-none">
          <HiOutlineQueueList size={14} className="text-zinc-500" />
          <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">Explorer</span>
        </div>

        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          <select
            className="w-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-[10px] rounded px-2 py-1.5 outline-none focus:border-blue-500/50 transition-colors flex-none"
            value={selectedInterventionId || ""}
            onChange={(e) => handleInterventionChange(e.target.value)}
          >
            <option value="" disabled>Select Intervention...</option>
            {patientInterventions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>

          <div className="flex-1 overflow-y-auto relative custom-scrollbar-hover pr-2">
            {!selectedInterventionId ? (
              <div className="h-full flex items-center justify-center text-zinc-600 text-[11px] italic">
                Select an intervention to browse
              </div>
            ) : !selectedIntervention ? (
               <div className="h-full flex items-center justify-center text-zinc-600 text-[11px] italic text-center">
                Intervention not found.
              </div>
            ) : (
              <div className="space-y-0.5">
                {renderInterventionNode(selectedIntervention)}
                {(!selectedIntervention.phaseIds || selectedIntervention.phaseIds.length === 0) && orphanedSessions.length === 0 && (
                  <div className="px-4 py-8 text-center text-zinc-600 text-[11px] italic text-center">
                    Empty intervention. Add data in the Interventions tab.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Setup */}
      <div className="flex-none">
        <SidebarPanel title="Analytics Setup" icon={HiOutlineAdjustmentsHorizontal} defaultOpen={false} compact={true}>
          <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1 space-y-5 py-1">
            {/* Metrics Multi-select */}
            <div className="space-y-2.5">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Active Data Streams</span>
              <div className="grid grid-cols-2 gap-2">
                {metrics.map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      const next = selectedMetrics.includes(m)
                        ? selectedMetrics.filter(x => x !== m)
                        : [...selectedMetrics, m];
                      setSelectedMetrics(next);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded text-[10px] border transition-all ${selectedMetrics.includes(m)
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                      : 'bg-zinc-800/30 border-zinc-700/50 text-zinc-500 hover:border-zinc-600'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{m}</span>
                      {selectedMetrics.includes(m) && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Cloud Filter */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Semantic Filters</span>
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-[9px] text-zinc-600 hover:text-blue-400 transition-colors"
                >
                  Clear All
                </button>
              </div>
              {allAvailableTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 p-2 rounded bg-zinc-950/30 border border-zinc-800/50 shadow-inner">
                  {allAvailableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-0.5 rounded text-[9px] border transition-all ${selectedTags.includes(tag)
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center border border-dashed border-zinc-800 rounded">
                  <span className="text-[10px] text-zinc-600 italic">No exercise tags available</span>
                </div>
              )}
            </div>
          </div>
        </SidebarPanel>
      </div>
    </div>
  );
};

export default DataAnalysisSidebar;
