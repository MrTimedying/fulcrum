import React, { useMemo, useState, useEffect } from 'react';
import { useInterventionStore } from '../../state/core/useInterventionStore';
import useAnalyticsStore from '../../state/core/useAnalyticsStore';
import { getMetricsForNode } from '../../utils/analytics/DataAggregator';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const AnalysisDashboard = () => {
  const { interventions, phases, microcycles, sessions } = useInterventionStore();
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
    return focusNodeId;
  }, [focusNodeId, focusNodeType, interventions, phases, microcycles, sessions]);

  // 2. Aggregate Real Data (Async)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!focusNodeId || !focusNodeType) {
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
  }, [focusNodeId, focusNodeType, interventions, phases, microcycles, sessions, selectedTags]);

  if (!focusNodeId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
          <span className="text-2xl">📊</span>
        </div>
        <div className="text-center">
          <h3 className="text-zinc-300 font-medium">Select a Focus for Analysis</h3>
          <p className="text-sm">Pick a Phase, Microcycle, or Session from the sidebar tree.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-sm animate-pulse">Calculating metrics in Rust...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
        <div className="text-center">
          <h3 className="text-zinc-300 font-medium">No Data Available</h3>
          <p className="text-sm">The selected focus node has no session data to analyze.</p>
        </div>
      </div>
    );
  }

  const { summary, trendData, distributionData } = analyticsData;

  return (
    <div className="h-full w-full bg-zinc-950 overflow-y-auto custom-scrollbar p-6 space-y-6">
      <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-zinc-100">{focusNodeName || 'Analysis Focus'}</h1>
            <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              FOCUS TYPE: {focusNodeType}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: summary.totalVolume, color: 'text-blue-400', metric: 'Volume' },
          { label: 'Avg Intensity', value: summary.avgIntensity, color: 'text-emerald-400', metric: 'Intensity' },
          { label: 'Avg RPE', value: summary.avgRpe || '0.0', color: 'text-rose-400', metric: 'RPE' },
          { label: 'Workload Ratio', value: summary.workloadRatio, color: 'text-purple-400', metric: 'Workload' },
          { label: 'Session Count', value: summary.sessionCount, color: 'text-amber-400' },
        ]
        .filter(card => !card.metric || selectedMetrics.includes(card.metric))
        .map((card, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      {selectedMetrics.includes('Volume') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend View */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300">Workload Progression (Volume)</h3>
            <div className="h-64 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
          <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl space-y-4">
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
        <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl space-y-4">
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
