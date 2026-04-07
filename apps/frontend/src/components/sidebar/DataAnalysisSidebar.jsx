import React, { useMemo, useState, useEffect } from "react";
import { Tree } from "react-arborist";
import { motion, AnimatePresence } from "motion/react";
import { useInterventionStore } from "../../state/core/useInterventionStore";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import useAnalyticsStore from "../../state/core/useAnalyticsStore";
import { getAnalyticsTree } from "../../utils/tagTreeUtils.js";
import { getExerciseTags } from "../../utils/analytics/DataAggregator";
import {
  HiChevronRight,
  HiChevronDown,
  HiOutlineQueueList,
  HiOutlineCalendarDays,
  HiOutlinePlay,
  HiOutlineTag,
  HiOutlineSquare2Stack,
  HiOutlineHome,
  HiOutlineFunnel,
  HiOutlineAdjustmentsHorizontal
} from "react-icons/hi2";

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

const NodeRenderer = ({ node, style, dragHandle }) => {
  const Icon = useMemo(() => {
    switch (node.data.type) {
      case 'intervention': return HiOutlineHome;
      case 'phase': return HiOutlineQueueList;
      case 'microcycle': return HiOutlineSquare2Stack;
      case 'session': return HiOutlineCalendarDays;
      case 'exercise': return HiOutlinePlay;
      default: return HiOutlineTag;
    }
  }, [node.data.type]);

  const setFocus = useAnalyticsStore(state => state.setFocus);

  return (
    <div
      style={style}
      className={`flex items-center space-x-1.5 py-0.5 cursor-pointer group hover:bg-zinc-800/50 rounded px-1 transition-colors ${node.isSelected ? 'bg-zinc-700/50' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        node.select();

        let focusType = null;
        switch (node.data.type) {
          case 'intervention': focusType = 'Intervention'; break;
          case 'phase': focusType = 'Phase'; break;
          case 'microcycle': focusType = 'Microcycle'; break;
          case 'session': focusType = 'Session'; break;
          case 'exercise': focusType = 'Exercise'; break;
        }
        setFocus(node.id, focusType);
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

        <Icon size={14} className={`flex-shrink-0 mr-1.5 ${node.data.type === 'intervention' ? 'text-blue-400' : 'text-zinc-500'}`} />

        <div className="flex flex-col min-w-0 flex-1">
          <div className="text-[11px] truncate leading-tight text-zinc-300">
            {node.data.name}
          </div>
        </div>
      </div>
    </div>
  );
};

const DataAnalysisSidebar = () => {
  const { interventions, phases, microcycles, sessions, selectedInterventionId, setSelectedInterventionId } = useInterventionStore();
  const { patientId } = useNavigationStore();
  const { focusNodeId, selectedMetrics, setSelectedMetrics, selectedTags, setSelectedTags, toggleTag, setFocus } = useAnalyticsStore();

  const [treeContainerRef, setTreeContainerRef] = useState(null);
  const [treeHeight, setTreeHeight] = useState(400);

  useEffect(() => {
    if (!treeContainerRef) return;
    const observer = new ResizeObserver(([entry]) => {
      setTreeHeight(entry.contentRect.height);
    });
    observer.observe(treeContainerRef);
    return () => observer.disconnect();
  }, [treeContainerRef]);

  const patientInterventions = useMemo(() =>
    Object.values(interventions).filter(i => i.patientId === patientId),
    [interventions, patientId]
  );

  const treeData = useMemo(() => {
    const selected = patientInterventions.filter(i => i.id === selectedInterventionId);
    return getAnalyticsTree(selected, phases, microcycles, sessions);
  }, [patientInterventions, selectedInterventionId, phases, microcycles, sessions]);

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
    setFocus(null, null); // Reset focus so user must explicitly pick a focus level in the tree
  };

  return (
    <div className="h-full w-full bg-zinc-900 flex flex-col overflow-hidden select-none border-r border-zinc-800/50">
      {/* 1. Structural Navigator (Explorer) - FIXED & EXPANDED */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="px-4 pt-1 flex items-center space-x-2.5 border-b border-zinc-800/50 flex-none">
          <HiOutlineQueueList size={14} className="text-zinc-500" />
          <span className="text-[11px] font-bold tracking-widest text-zinc-400">Explorer</span>
        </div>

        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          <select
            className="w-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-[10px] rounded px-2 py-0.5 outline-none focus:border-blue-500/50 transition-colors flex-none"
            value={selectedInterventionId || ""}
            onChange={(e) => handleInterventionChange(e.target.value)}
          >
            <option value="" disabled>Select Intervention...</option>
            {patientInterventions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>

          <div
            ref={setTreeContainerRef}
            className="flex-1 overflow-hidden relative"
          >
            {treeData.length > 0 ? (
              <Tree
                data={treeData}
                selection={focusNodeId}
                openByDefault={true}
                width="100%"
                height={treeHeight}
                indent={12}
                rowHeight={24}
                onSelect={(nodes) => {
                  if (nodes.length > 0) {
                    const node = nodes[0];
                    let focusType = null;
                    switch (node.data.type) {
                      case 'intervention': focusType = 'Intervention'; break;
                      case 'phase': focusType = 'Phase'; break;
                      case 'microcycle': focusType = 'Microcycle'; break;
                      case 'session': focusType = 'Session'; break;
                      case 'exercise': focusType = 'Exercise'; break;
                    }
                    setFocus(node.id, focusType);
                  }
                }}
              >
                {NodeRenderer}
              </Tree>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 text-[11px] italic">
                Select an intervention to browse
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Filtering & Metrics - COLLAPSIBLE AT BOTTOM */}
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
