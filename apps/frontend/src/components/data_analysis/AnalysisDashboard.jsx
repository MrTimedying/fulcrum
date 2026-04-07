import React, { useMemo, useState, useEffect } from 'react';
import { useInterventionStore } from '../../state/core/useInterventionStore';
import useAnalyticsStore from '../../state/core/useAnalyticsStore';
import { getMetricsForNode } from '../../utils/analytics/DataAggregator';
import { getExerciseContainerDisplayName } from '../../utils/exerciseUtils';
import { motion } from "motion/react";
import { FiCheck } from "react-icons/fi";
import {
  HiOutlineHome,
  HiOutlineQueueList,
  HiOutlineAdjustmentsHorizontal
} from "react-icons/hi2";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const STEPS = [
  {
    key: 'intervention',
    icon: HiOutlineHome,
    label: 'Select Intervention',
    description: 'Choose an intervention from the explorer to begin analysis.',
    color: 'blue',
  },
  {
    key: 'focus',
    icon: HiOutlineQueueList,
    label: 'Select Focus',
    description: 'Pick a Phase, Microcycle, or Session to analyze its metrics.',
    color: 'violet',
  },
  {
    key: 'metrics',
    icon: HiOutlineAdjustmentsHorizontal,
    label: 'Setup Analytics',
    description: 'Enable one or more data streams in the Analytics Setup panel.',
    color: 'emerald',
  },
];

const colorMap = {
  blue: { ring: 'ring-blue-500/40', bg: 'bg-blue-500/10', icon: 'text-blue-400', dot: 'bg-blue-500', label: 'text-blue-300', line: 'bg-blue-500/30' },
  violet: { ring: 'ring-violet-500/40', bg: 'bg-violet-500/10', icon: 'text-violet-400', dot: 'bg-violet-500', label: 'text-violet-300', line: 'bg-violet-500/30' },
  emerald: { ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', dot: 'bg-emerald-500', label: 'text-emerald-300', line: 'bg-emerald-500/30' },
};

const AnalysisWorkflowPlaceholder = ({ activeStep }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-900 select-none px-8">
      <div className="mb-10 text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600 font-semibold">Analysis Workflow</p>
        <h2 className="text-zinc-300 text-lg font-light">Follow these steps to generate insights</h2>
      </div>

      <div className="flex flex-col items-center gap-0 w-full max-w-xs">
        {STEPS.map((step, idx) => {
          const c = colorMap[step.color];
          const isDone = idx < activeStep;
          const isActive = idx === activeStep;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12, duration: 0.4, ease: 'easeOut' }}
                className={`
                  relative flex items-center gap-4 w-full rounded-xl px-4 py-3.5
                  border transition-all duration-300
                  ${isActive
                    ? `${c.bg} border-transparent ring-1 ${c.ring} shadow-lg shadow-black/30`
                    : isDone
                      ? 'bg-zinc-800/30 border-zinc-700/30'
                      : 'bg-transparent border-transparent opacity-35'
                  }
                `}
              >
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ring-1 transition-all duration-300
                  ${isActive ? `${c.bg} ${c.ring}` : isDone ? 'bg-zinc-700/60 ring-zinc-700' : 'bg-zinc-800/40 ring-zinc-800'}
                `}>
                  {isDone ? (
                    <FiCheck size={16} className="text-zinc-400" />
                  ) : (
                    <Icon size={18} className={isActive ? c.icon : 'text-zinc-600'} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug transition-colors duration-300 ${isActive ? c.label : isDone ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-[11px] text-zinc-500 leading-relaxed mt-0.5"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>

                {isActive && (
                  <span className="flex-shrink-0 relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-50`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
                  </span>
                )}

                {isDone && (
                  <span className="flex-shrink-0 text-[9px] font-bold text-zinc-600 font-mono">✓</span>
                )}
              </motion.div>

              {idx < STEPS.length - 1 && (
                <div className={`w-px h-5 transition-all duration-500 ${idx < activeStep ? c.line : 'bg-zinc-800'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-[10px] text-zinc-700 text-center max-w-[220px] leading-relaxed"
      >
        Use the sidebar on the left to complete the highlighted step.
      </motion.p>
    </div>
  );
};

const AnalysisDashboard = () => {
  const { interventions, phases, microcycles, sessions, selectedInterventionId } = useInterventionStore();
  const { focusNodeId, focusNodeType, selectedTags, selectedMetrics } = useAnalyticsStore();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Resolve Focus Node Name
  const focusNodeName = useMemo(() => {
    if (!focusNodeId || !focusNodeType) return null;
    if (focusNodeType === 'Intervention') return interventions[focusNodeId]?.name;
    if (focusNodeType === 'Phase') return phases[focusNodeId]?.name;
    if (focusNodeType === 'Microcycle') return microcycles[focusNodeId]?.name;
    if (focusNodeType === 'Session') return sessions[focusNodeId]?.name;
    if (focusNodeType === 'Exercise') return getExerciseContainerDisplayName(focusNodeId);
    return focusNodeId;
  }, [focusNodeId, focusNodeType, interventions, phases, microcycles, sessions]);

  // 2. Aggregate Real Data (Async)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!focusNodeId || !focusNodeType || selectedMetrics.length === 0) {
        setAnalyticsData(null);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getMetricsForNode(
          focusNodeId,
          focusNodeType,
          { interventions, phases, microcycles, sessions },
          { selectedTags }
        );
        if (isMounted) setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [focusNodeId, focusNodeType, interventions, phases, microcycles, sessions, selectedTags, selectedMetrics]);

  // Workflow validation
  if (!selectedInterventionId) return <AnalysisWorkflowPlaceholder activeStep={0} />;
  if (!focusNodeId) return <AnalysisWorkflowPlaceholder activeStep={1} />;
  if (selectedMetrics.length === 0) return <AnalysisWorkflowPlaceholder activeStep={2} />;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-zinc-500 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-sm animate-pulse">Calculating metrics in Rust...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-zinc-500 space-y-4">
        <div className="text-center">
          <h3 className="text-zinc-300 font-medium">No Data Available</h3>
          <p className="text-sm">The selected focus node has no session data to analyze.</p>
        </div>
      </div>
    );
  }

  const { summary, trendData, distributionData } = analyticsData;

  return (
    <div className="h-full w-full bg-zinc-900 overflow-y-auto custom-scrollbar p-6 space-y-6">
      <header className="flex items-center justify-between border-b border-zinc-800/50 pb-2 bg-zinc-900/50 backdrop-blur-sm -m-6 mb-0 pl-6 sticky top-0 z-10">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-l text-zinc-100">{focusNodeName || 'Analysis Focus'}</h1>
            <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Focus Type: {focusNodeType}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">Aggregating workload across all child elements</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors">
            Export JSON
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {[
          { label: 'Total Volume', value: summary.totalVolume, color: 'text-blue-400', metric: 'Volume' },
          { label: 'Avg Intensity', value: summary.avgIntensity, color: 'text-emerald-400', metric: 'Intensity' },
          { label: 'Avg RPE', value: summary.avgRpe || '0.0', color: 'text-rose-400', metric: 'RPE' },
          { label: 'Workload Ratio', value: summary.workloadRatio, color: 'text-purple-400', metric: 'Workload' },
          { label: 'Session Count', value: summary.sessionCount, color: 'text-amber-400' },
        ]
          .filter(card => !card.metric || selectedMetrics.includes(card.metric))
          .map((card, i) => (
            <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 p-4 rounded-lg backdrop-blur-sm transition-all hover:bg-zinc-800/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
            </div>
          ))}
      </div>

      {/* Main Charts */}
      {selectedMetrics.includes('Volume') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend View */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl space-y-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-zinc-300">Workload Progression (Volume)</h3>
            <div className="h-64 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }}
                      itemStyle={{ color: '#e4e4e7' }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVol)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-700 italic text-[11px]">Insufficient data for trends</div>
              )}
            </div>
          </div>

          {/* Tag View */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl space-y-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-zinc-300">Volume Distribution by Tag</h3>
            <div className="h-64 w-full flex items-center justify-center">
              {distributionData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col space-y-1.5 ml-4 min-w-[100px]">
                    {distributionData.slice(0, 6).map((tag, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] text-zinc-400 truncate w-20" title={tag.name}>{tag.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-700 italic text-[11px]">No tagged data found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart for Intensity Comparison */}
      {selectedMetrics.includes('Intensity') && (
        <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-xl space-y-4 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-zinc-300">Relative Intensity Average</h3>
          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Bar dataKey="intensity" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-700 italic text-[11px]">No sessions to compare</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;
