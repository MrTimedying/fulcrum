import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import useFlowStore from '../../state/flowState';

function InterventionNodeInspector({ node }) {
  const { nodes, edges } = useFlowStore();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(true);
  
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
    
    // Get the phase nodes - no date requirement
    return nodes.filter(n => 
      connectedNodeIds.includes(n.id) && 
      n.type === 'phase'
    ).sort((a, b) => {
      // Sort by id if no date
      if (!a.data?.date || !b.data?.date) {
        return a.id.localeCompare(b.id);
      }
      // Sort by date if available
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
      const phaseName = phaseNode.data?.label || phaseNode.label || `Phase ${phaseId.substr(0,4)}`;
      
      // Find edges connected to this phase
      const phaseEdges = edges.filter(
        edge => edge.source === phaseId || edge.target === phaseId
      );
      
      // Get connected micro node IDs
      const connectedMicroIds = phaseEdges.map(edge => 
        edge.source === phaseId ? edge.target : edge.source
      );
      
      // Get micro nodes with phase info - no date requirement
      const connectedMicros = nodes.filter(n => 
        connectedMicroIds.includes(n.id) && 
        n.type === 'micro'
      ).map(microNode => ({
        ...microNode,
        phaseId,
        phaseName
      }));
      
      micros.push(...connectedMicros);
      
      // For each micro, find connected sessions
      connectedMicros.forEach(microNode => {
        const microId = microNode.id;
        const microWeek = microNode.data?.label || microNode.label || `Week ${microId.substr(0,4)}`;
        
        // Find edges connected to this micro
        const microEdges = edges.filter(
          edge => edge.source === microId || edge.target === microId
        );
        
        // Get connected session node IDs
        const connectedSessionIds = microEdges.map(edge => 
          edge.source === microId ? edge.target : edge.source
        );
        
        // Get session nodes with phase and micro info - sessions still need dates
        const connectedSessions = nodes.filter(n => 
          connectedSessionIds.includes(n.id) && 
          n.type === 'session' &&
          n.data?.exercises &&
          n.data?.date
        ).map(sessionNode => ({
          ...sessionNode,
          phaseId,
          phaseName,
          microId,
          microWeek
        }));
        
        sessions.push(...connectedSessions);
      });
    });
    
    // Sort by date (for sessions) or id (for micros without date)
    return { 
      allMicroNodes: micros.sort((a, b) => {
        if (!a.data?.date || !b.data?.date) return a.id.localeCompare(b.id);
        return new Date(a.data.date) - new Date(b.data.date);
      }),
      allSessionNodes: sessions.sort((a, b) => new Date(a.data.date) - new Date(b.data.date))
    };
  }, [phaseNodes, nodes, edges]);
  
  // Extract and normalize all exercise data and gather tags
  const { allExercisesData, allTags } = useMemo(() => {
    // Store exercises from all sessions
    const allExercises = [];
    const tagSet = new Set();
    
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
          if (!field || field.value === undefined) return;
          
          // Use field.subtype for reliable identification instead of field.name
          switch(field.subtype) {
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
              // Parse tags from a semicolon-separated list with # prefix
              if (field.value) {
                // Split by semicolon and handle both formats: "#tag" or "tag"
                const tags = field.value.split(';')
                  .map(tag => tag.trim())
                  .filter(tag => tag)
                  .map(tag => tag.startsWith('#') ? tag.substring(1) : tag); // Remove # prefix if present
                  
                exerciseInfo.tags = tags;
                
                // Add to our set of all tags
                tags.forEach(tag => tagSet.add(tag));
              }
              break;
          }
        });
        
        // Calculate volume (sets * reps)
        exerciseInfo.volume = exerciseInfo.sets * exerciseInfo.reps;
        
        allExercises.push(exerciseInfo);
      });
    });
    
    return {
      allExercisesData: allExercises,
      allTags: Array.from(tagSet).sort()
    };
  }, [allSessionNodes]);
  
  // Handle tag selection
  const handleTagSelection = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    if (showAllTags) setShowAllTags(false);
  };
  
  // Toggle show all tags
  const toggleShowAllTags = () => {
    setShowAllTags(prev => !prev);
    if (!showAllTags) {
      setSelectedTags([]);
    }
  };
  
  // Filter exercises based on selected tags
  const filteredExercises = useMemo(() => {
    // First filter by selected exercise if any
    let filtered = selectedExercise 
      ? allExercisesData.filter(ex => ex.name === selectedExercise)
      : allExercisesData;
    
    // Then filter by tags
    if (!showAllTags) {
      if (selectedTags.length === 0) {
        // When no tags are selected but "show all" is off, show exercises with no tags
        filtered = filtered.filter(ex => ex.tags.length === 0);
      } else {
        // Show exercises with at least one of the selected tags
        filtered = filtered.filter(exercise => 
          exercise.tags.some(tag => selectedTags.includes(tag))
        );
      }
    }
    
    return filtered;
  }, [allExercisesData, selectedExercise, selectedTags, showAllTags]);
  
  // Group exercises by phase for analysis
  const exercisesByPhase = useMemo(() => {
    const groupedData = {};
    
    filteredExercises.forEach(exercise => {
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
      if (exercise.tags.length === 0) {
        // Handle untagged exercises
        if (!groupedData[phaseId].tagVolumes["Untagged"]) {
          groupedData[phaseId].tagVolumes["Untagged"] = 0;
        }
        groupedData[phaseId].tagVolumes["Untagged"] += exercise.volume;
      } else {
        // Track each tag's volume
        exercise.tags.forEach(tag => {
          if (!groupedData[phaseId].tagVolumes[tag]) {
            groupedData[phaseId].tagVolumes[tag] = 0;
          }
          groupedData[phaseId].tagVolumes[tag] += exercise.volume;
        });
      }
    });
    
    // Calculate average intensity for each phase
    Object.values(groupedData).forEach(phase => {
      if (phase.exercises.length) {
        const intensitySum = phase.exercises.reduce((sum, ex) => sum + ex.intensity, 0);
        phase.averageIntensity = intensitySum / phase.exercises.length;
      }
    });
    
    return groupedData;
  }, [filteredExercises]);
  
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
        if (phaseA !== phaseB) return phaseA - phaseB;
        return a.name.localeCompare(b.name);
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
    
    filteredExercises.forEach(exercise => {
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
  }, [filteredExercises]);
  
  // Get list of available exercises for selection
  const availableExercises = useMemo(() => {
    return Object.keys(exercisesByName).sort();
  }, [exercisesByName]);
  
  // Select an exercise to track
  const handleExerciseSelection = (exerciseName) => {
    setSelectedExercise(exerciseName === selectedExercise ? null : exerciseName);
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF5733', '#C70039', '#900C3F', '#581845'];

  // If there are no session nodes, show a message
  if (!allSessionNodes.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No session data available for this intervention.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Intervention Overview: {node.data?.label || node.label || 'Unnamed Intervention'}</h3>
        <p className="text-sm text-gray-400 mb-4">
          Phases: {phaseNodes.length} | Micro Cycles: {allMicroNodes.length} | Sessions: {allSessionNodes.length} | 
          Date Range: {
            allSessionNodes.length > 0 
              ? `${new Date(allSessionNodes[0].data.date).toLocaleDateString()} - ${new Date(allSessionNodes[allSessionNodes.length-1].data.date).toLocaleDateString()}`
              : 'No date range'
          }
        </p>
        
        {/* Filter Controls */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium mb-3 text-gray-300">Exercise Selection</h4>
              <select 
                className="bg-zinc-700 text-white border-zinc-600 rounded-md p-2 w-full"
                value={selectedExercise || ''}
                onChange={(e) => handleExerciseSelection(e.target.value || null)}
              >
                <option value="">All Exercises</option>
                {availableExercises.map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
            </div>
            
            {allTags.length > 0 && (
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-3 text-gray-300">Tag Filtering</h4>
                <div className="flex items-center mb-3">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={showAllTags}
                      onChange={toggleShowAllTags}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Show all tags
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {allTags.map(tag => (
                    <div 
                      key={tag} 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                        selectedTags.includes(tag) 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                      } ${showAllTags ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => !showAllTags && handleTagSelection(tag)}
                    >
                      <span className="mr-1">#</span>
                      {tag}
                      {selectedTags.includes(tag) && !showAllTags && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Click on tags to filter charts. Selected tags will appear in visualizations.
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Phase Comparison Chart */}
        {phaseComparisonData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Phase Comparison</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={phaseComparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#aaa' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis yAxisId="left" tick={{ fill: '#aaa' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#aaa' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }} 
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                  <Area 
                    type="monotone" 
                    dataKey="totalVolume" 
                    name="Total Volume" 
                    fill="#8884d880" 
                    stroke="#8884d8" 
                    yAxisId="left" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="averageIntensity" 
                    name="Avg. Intensity" 
                    stroke="#ff7300" 
                    yAxisId="right" 
                    strokeWidth={2}
                  />
                  <Bar 
                    dataKey="distinctExerciseCount" 
                    name="Exercise Variety" 
                    fill="#82ca9d" 
                    yAxisId="left" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Volume Distribution by Tag Pie Chart */}
        {tagDistributionData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">
              {selectedExercise ? `${selectedExercise} - Volume by Tags` : 'Overall Volume Distribution by Tags'}
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tagDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
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
                    formatter={(value, name) => [`Volume: ${value}`, name]}
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Exercise Progression Chart */}
        {selectedExercise && exercisesByName[selectedExercise]?.length > 1 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">{selectedExercise} Progression</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={exercisesByName[selectedExercise]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fill: '#aaa' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis yAxisId="left" tick={{ fill: '#aaa' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#aaa' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    name="Volume" 
                    fill="#8884d880" 
                    stroke="#8884d8" 
                    yAxisId="left" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="intensity" 
                    name="Intensity" 
                    stroke="#ff7300" 
                    yAxisId="right" 
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Intervention Summary Table */}
        <div className="bg-zinc-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Intervention Summary</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-300">
              <thead className="bg-zinc-700">
                <tr>
                  <th className="py-2 px-4 text-left">Phase</th>
                  <th className="py-2 px-4 text-right">Sessions</th>
                  <th className="py-2 px-4 text-right">Exercise Types</th>
                  <th className="py-2 px-4 text-right">Total Volume</th>
                  <th className="py-2 px-4 text-right">Avg. Intensity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {Object.values(exercisesByPhase).map((phase, index) => (
                  <tr key={index} className="hover:bg-zinc-700">
                    <td className="py-2 px-4">{phase.phaseName}</td>
                    <td className="py-2 px-4 text-right">{phase.sessions.size}</td>
                    <td className="py-2 px-4 text-right">{phase.distinctExercises.size}</td>
                    <td className="py-2 px-4 text-right">{phase.totalVolume.toFixed(0)}</td>
                    <td className="py-2 px-4 text-right">{phase.averageIntensity.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterventionNodeInspector; 