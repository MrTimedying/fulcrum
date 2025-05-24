import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import useFlowStore from '../../state/flowState';

function InterventionNodeInspector({ node }) {
  const { nodes, edges } = useFlowStore();
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Find all phase nodes connected to this intervention node
  const phaseNodes = useMemo(() => {
    if (!node) return [];
    
    // Find all edges connected to this node
    const connectedEdges = edges.filter(
      edge => edge.source === node.id || edge.target === node.id
    );
    
    // Get the IDs of connected nodes
    const connectedNodeIds = connectedEdges.map(edge => 
      edge.source === node.id ? edge.target : edge.source
    );
    
    // Get the phase nodes
    return nodes.filter(n => 
      connectedNodeIds.includes(n.id) && 
      n.type === 'phase' && 
      n.data?.date
    ).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateA - dateB;
    });
  }, [node, nodes, edges]);
  
  // Find all connected micro and session nodes through the phases
  const { allMicroNodes, allSessionNodes } = useMemo(() => {
    const micros = [];
    const sessions = [];
    
    if (!phaseNodes.length) return { allMicroNodes: [], allSessionNodes: [] };
    
    // For each phase, find connected micro nodes
    phaseNodes.forEach(phaseNode => {
      const phaseId = phaseNode.id;
      const phaseName = phaseNode.label || `Phase ${phaseId.substr(0,4)}`;
      const phaseDate = phaseNode.data?.date;
      
      // Find edges connected to this phase
      const phaseEdges = edges.filter(
        edge => edge.source === phaseId || edge.target === phaseId
      );
      
      // Get connected micro node IDs
      const connectedMicroIds = phaseEdges.map(edge => 
        edge.source === phaseId ? edge.target : edge.source
      );
      
      // Get micro nodes with phase info
      const connectedMicros = nodes.filter(n => 
        connectedMicroIds.includes(n.id) && 
        n.type === 'micro' &&
        n.data?.date
      ).map(microNode => ({
        ...microNode,
        phaseId,
        phaseName,
        phaseDate
      }));
      
      micros.push(...connectedMicros);
      
      // For each micro, find connected sessions
      connectedMicros.forEach(microNode => {
        const microId = microNode.id;
        const microWeek = microNode.label || `Week ${microId.substr(0,4)}`;
        const microDate = microNode.data?.date;
        
        // Find edges connected to this micro
        const microEdges = edges.filter(
          edge => edge.source === microId || edge.target === microId
        );
        
        // Get connected session node IDs
        const connectedSessionIds = microEdges.map(edge => 
          edge.source === microId ? edge.target : edge.source
        );
        
        // Get session nodes with phase and micro info
        const connectedSessions = nodes.filter(n => 
          connectedSessionIds.includes(n.id) && 
          n.type === 'session' &&
          n.data?.exercises &&
          n.data?.date
        ).map(sessionNode => ({
          ...sessionNode,
          phaseId,
          phaseName,
          phaseDate,
          microId,
          microWeek,
          microDate
        }));
        
        sessions.push(...connectedSessions);
      });
    });
    
    // Sort by date
    return { 
      allMicroNodes: micros.sort((a, b) => new Date(a.data.date) - new Date(b.data.date)),
      allSessionNodes: sessions.sort((a, b) => new Date(a.data.date) - new Date(b.data.date))
    };
  }, [phaseNodes, nodes, edges]);
  
  // Extract and normalize all exercise data
  const allExercisesData = useMemo(() => {
    // Store exercises from all sessions
    const allExercises = [];
    
    allSessionNodes.forEach(sessionNode => {
      if (!sessionNode?.data?.exercises) return;
      
      const sessionDate = sessionNode.data.date;
      const formattedDate = new Date(sessionDate).toLocaleDateString();
      const sessionLabel = sessionNode.data?.label || sessionNode.id;
      const { phaseId, phaseName, microId, microWeek } = sessionNode;
      
      // Extract exercises from each session node
      const exercises = sessionNode.data.exercises;
      
      // Process each exercise container
      Object.keys(exercises).forEach(containerName => {
        const container = exercises[containerName];
        
        // Skip if fields aren't present
        if (!container?.fields || !Array.isArray(container.fields)) return;
        
        // Create an object to store parsed exercise data
        const exerciseInfo = {
          name: containerName,
          sessionId: sessionNode.id,
          sessionLabel,
          date: sessionDate,
          formattedDate,
          phaseId,
          phaseName,
          microId,
          microWeek,
          sets: 0,
          reps: 0,
          duration: 0,
          intensity: 0,
          volume: 0,
          tags: []
        };
        
        // Parse each field in the exercise
        container.fields.forEach(field => {
          if (!field || !field.name) return;
          
          switch(field.name) {
            case 'sets':
              exerciseInfo.sets = parseInt(field.value) || 0;
              break;
            case 'reps_constant':
              exerciseInfo.reps = parseInt(field.value) || 0;
              break;
            case 'reps_variant':
              // Parse variant reps and take the average
              if (field.value) {
                const repVariants = field.value.split(',')
                  .map(rep => parseInt(rep.trim()))
                  .filter(rep => !isNaN(rep));
                
                if (repVariants.length > 0) {
                  exerciseInfo.reps = repVariants.reduce((sum, rep) => sum + rep, 0) / repVariants.length;
                }
              }
              break;
            case 'duration_constant':
              exerciseInfo.duration = parseInt(field.value) || 0;
              break;
            case 'duration_variant':
              // Parse variant durations and take the average
              if (field.value) {
                const durationVariants = field.value.split(',')
                  .map(duration => parseInt(duration.trim()))
                  .filter(duration => !isNaN(duration));
                
                if (durationVariants.length > 0) {
                  exerciseInfo.duration = durationVariants.reduce((sum, duration) => sum + duration, 0) / durationVariants.length;
                }
              }
              break;
            case 'intensity_number':
              exerciseInfo.intensity = parseFloat(field.value) || 0;
              break;
            case 'intensity_string':
              // Extract number from strings like "RPE 8"
              if (field.value) {
                const match = field.value.match(/\d+(\.\d+)?/);
                if (match) {
                  exerciseInfo.intensity = parseFloat(match[0]) || 0;
                }
              }
              break;
            case 'tags':
              // Parse tags 
              if (field.value) {
                exerciseInfo.tags = field.value.split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag);
              }
              break;
          }
        });
        
        // Calculate volume (sets * reps)
        exerciseInfo.volume = exerciseInfo.sets * exerciseInfo.reps;
        
        allExercises.push(exerciseInfo);
      });
    });
    
    return allExercises;
  }, [allSessionNodes]);
  
  // Group exercise data by phase
  const exercisesByPhase = useMemo(() => {
    const groupedData = {};
    
    allExercisesData.forEach(exercise => {
      const { phaseId, phaseName } = exercise;
      
      if (!groupedData[phaseId]) {
        groupedData[phaseId] = {
          phaseName,
          exercises: [],
          totalVolume: 0,
          averageIntensity: 0,
          exerciseCount: 0,
          tagVolumes: {},
          distinctExercises: new Set(),
          sessions: new Set(),
          micros: new Set()
        };
      }
      
      groupedData[phaseId].exercises.push(exercise);
      groupedData[phaseId].totalVolume += exercise.volume;
      groupedData[phaseId].exerciseCount++;
      groupedData[phaseId].distinctExercises.add(exercise.name);
      groupedData[phaseId].sessions.add(exercise.sessionId);
      groupedData[phaseId].micros.add(exercise.microId);
      
      // Track volume by tag
      exercise.tags.forEach(tag => {
        if (!groupedData[phaseId].tagVolumes[tag]) {
          groupedData[phaseId].tagVolumes[tag] = 0;
        }
        groupedData[phaseId].tagVolumes[tag] += exercise.volume;
      });
    });
    
    // Calculate average intensity for each phase
    Object.values(groupedData).forEach(phase => {
      if (phase.exercises.length) {
        const intensitySum = phase.exercises.reduce((sum, ex) => sum + ex.intensity, 0);
        phase.averageIntensity = intensitySum / phase.exercises.length;
      }
    });
    
    return groupedData;
  }, [allExercisesData]);
  
  // Create data for phase comparison chart
  const phaseComparisonData = useMemo(() => {
    return Object.values(exercisesByPhase)
      .map(phase => ({
        name: phase.phaseName,
        totalVolume: phase.totalVolume,
        averageIntensity: phase.averageIntensity,
        sessionCount: phase.sessions.size,
        microCount: phase.micros.size,
        distinctExerciseCount: phase.distinctExercises.size
      }))
      .sort((a, b) => {
        // Try to extract phase number
        const phaseA = parseInt(a.name.match(/\d+/)?.[0] || '0');
        const phaseB = parseInt(b.name.match(/\d+/)?.[0] || '0');
        return phaseA - phaseB;
      });
  }, [exercisesByPhase]);
  
  // Create data for volume distribution by tag across all phases
  const tagDistributionData = useMemo(() => {
    const tagTotals = {};
    
    // Sum volumes by tag across all phases
    Object.values(exercisesByPhase).forEach(phase => {
      Object.entries(phase.tagVolumes).forEach(([tag, volume]) => {
        if (!tagTotals[tag]) {
          tagTotals[tag] = 0;
        }
        tagTotals[tag] += volume;
      });
    });
    
    // Convert to array for pie chart
    return Object.entries(tagTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [exercisesByPhase]);
  
  // Group exercises by name for longitudinal tracking
  const exercisesByName = useMemo(() => {
    const nameGroups = {};
    
    allExercisesData.forEach(exercise => {
      if (!nameGroups[exercise.name]) {
        nameGroups[exercise.name] = [];
      }
      nameGroups[exercise.name].push(exercise);
    });
    
    // Sort each group by date
    Object.keys(nameGroups).forEach(name => {
      nameGroups[name].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
    });
    
    return nameGroups;
  }, [allExercisesData]);
  
  // Get list of available exercises for selection
  const availableExercises = useMemo(() => {
    return Object.keys(exercisesByName)
      .filter(name => exercisesByName[name].length >= 5) // Only show exercises with at least 5 data points
      .sort();
  }, [exercisesByName]);
  
  // Create long-term progression data for the selected exercise
  const selectedExerciseData = useMemo(() => {
    if (!selectedExercise || !exercisesByName[selectedExercise]) {
      return [];
    }
    
    return exercisesByName[selectedExercise].map(ex => ({
      date: ex.formattedDate, 
      intensity: ex.intensity,
      volume: ex.volume,
      phase: ex.phaseName
    }));
  }, [selectedExercise, exercisesByName]);
  
  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

  // If there are no phase nodes, show a message
  if (!phaseNodes.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No phase nodes connected to this intervention.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Intervention Overview: {node.label || 'Unnamed Intervention'}</h3>
        
        {/* Intervention Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Phases</h4>
            <p className="text-xl font-semibold">{phaseNodes.length}</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Micro Cycles</h4>
            <p className="text-xl font-semibold">{allMicroNodes.length}</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Sessions</h4>
            <p className="text-xl font-semibold">{allSessionNodes.length}</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Date Range</h4>
            <p className="text-sm">
              {phaseNodes.length > 0 && (
                <>
                  {new Date(phaseNodes[0].data.date).toLocaleDateString()} to{' '}
                  {new Date(phaseNodes[phaseNodes.length - 1].data.date).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Phase Comparison Chart */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Phase Comparison</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={phaseComparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#aaa' }} 
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fill: '#aaa' }} 
                  label={{ value: 'Volume', angle: -90, position: 'insideLeft', fill: '#aaa' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fill: '#aaa' }} 
                  label={{ value: 'Count / Intensity', angle: 90, position: 'insideRight', fill: '#aaa' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#333', 
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#eee' 
                  }} 
                />
                <Legend wrapperStyle={{ color: '#ccc' }} />
                <Bar 
                  dataKey="totalVolume" 
                  name="Total Volume" 
                  fill="#8884d8" 
                  yAxisId="left" 
                />
                <Line 
                  type="monotone" 
                  dataKey="averageIntensity" 
                  name="Avg. Intensity" 
                  stroke="#ff7300" 
                  yAxisId="right" 
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sessionCount" 
                  name="Sessions" 
                  stroke="#82ca9d" 
                  yAxisId="right" 
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="distinctExerciseCount" 
                  name="Exercise Variety" 
                  stroke="#d0ed57" 
                  yAxisId="right" 
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Overall Training Focus (Pie Chart) */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Overall Training Focus Distribution</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tagDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {tagDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#333', 
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#eee' 
                  }} 
                  formatter={(value, name) => [`${value} volume units (${(value / allExercisesData.reduce((sum, ex) => sum + ex.volume, 0) * 100).toFixed(1)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Long Term Exercise Progression */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Long-Term Exercise Progression</h4>
          
          {/* Exercise Selector */}
          <div className="mb-4">
            <label className="block text-sm mb-2">Select an exercise:</label>
            <select 
              className="bg-zinc-700 text-white p-2 rounded w-full"
              value={selectedExercise || ''}
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              <option value="">Select an exercise</option>
              {availableExercises.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          
          {selectedExercise ? (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={selectedExerciseData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#aaa' }} 
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fill: '#aaa' }} 
                    label={{ value: 'Intensity', angle: -90, position: 'insideLeft', fill: '#aaa' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: '#aaa' }} 
                    label={{ value: 'Volume', angle: 90, position: 'insideRight', fill: '#aaa' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }} 
                    formatter={(value, name, props) => {
                      return [
                        value, 
                        name, 
                        `Phase: ${props.payload.phase}`
                      ];
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    name="Intensity" 
                    stroke="#ff7300" 
                    yAxisId="left" 
                    dot={{ r: 4 }}
                    connectNulls
                  />
                  <Bar 
                    dataKey="volume" 
                    name="Volume (Sets × Reps)" 
                    fill="#82ca9d" 
                    yAxisId="right"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 text-center">Long-term progression of {selectedExercise} across the intervention</p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>Select an exercise to view long-term progression data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterventionNodeInspector; 