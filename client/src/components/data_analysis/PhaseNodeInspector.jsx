import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';
import useFlowStore from '../../state/flowState';

function PhaseNodeInspector({ node }) {
  const { nodes, edges } = useFlowStore();
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(true);
  
  // Find all micro nodes connected to this phase node
  const microNodes = useMemo(() => {
    if (!node) return [];
    
    // Find all edges connected to this node
    const connectedEdges = edges.filter(
      edge => edge.source === node.id || edge.target === node.id
    );
    
    // Get the IDs of connected nodes
    const connectedNodeIds = connectedEdges.map(edge => 
      edge.source === node.id ? edge.target : edge.source
    );
    
    // Get the micro nodes - don't require a date on micro nodes
    return nodes.filter(n => 
      connectedNodeIds.includes(n.id) && 
      n.type === 'micro'
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
  
  // Find all session nodes connected to the micro nodes
  const allSessionNodes = useMemo(() => {
    if (!microNodes.length) return [];
    
    const microNodeIds = microNodes.map(n => n.id);
    const sessionsList = [];
    
    // For each micro node, find connected session nodes
    microNodeIds.forEach(microNodeId => {
      // Find edges connected to this micro node
      const microEdges = edges.filter(
        edge => edge.source === microNodeId || edge.target === microNodeId
      );
      
      // Get connected session node IDs
      const connectedSessionIds = microEdges.map(edge => 
        edge.source === microNodeId ? edge.target : edge.source
      );
      
      // Get session nodes and add micro info
      const microNode = microNodes.find(n => n.id === microNodeId);
      const microWeek = microNode.data?.label || microNode.label || `Week ${microNodeId.substr(0,4)}`;
      
      const connectedSessions = nodes.filter(n => 
        connectedSessionIds.includes(n.id) && 
        n.type === 'session' && 
        n.data?.exercises &&
        n.data?.date // Dates are still required for session nodes
      ).map(sessionNode => ({
        ...sessionNode,
        microId: microNodeId,
        microWeek
      }));
      
      sessionsList.push(...connectedSessions);
    });
    
    // Sort all sessions by date
    return sessionsList.sort((a, b) => {
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateA - dateB;
    });
  }, [microNodes, nodes, edges]);
  
  // Extract and normalize exercise data from all session nodes and gather all tags
  const { allExercisesData, allTags } = useMemo(() => {
    // Store exercises from all sessions
    const allExercises = [];
    const tagSet = new Set();
    
    allSessionNodes.forEach(sessionNode => {
      if (!sessionNode?.data?.exercises) return;
      
      const sessionDate = sessionNode.data.date;
      const formattedDate = new Date(sessionDate).toLocaleDateString();
      const sessionLabel = sessionNode.data?.label || sessionNode.id;
      const { microId, microWeek } = sessionNode;
      
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
          microId,
          microWeek,
          sets: 0,
          reps: 0,
          duration: 0,
          intensity: 0,
          volume: 0, // Will calculate as sets * reps
          tags: [],
          // Add new properties to store arrays of values
          setRepsArray: [],
          setDurationsArray: [],
          setIntensitiesArray: []
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
              // Parse variant reps to get an array of values
              if (field.value) {
                // Split by semicolon based on validation schema
                const repVariants = field.value.split(';')
                  .filter(rep => rep.trim() !== '')
                  .map(rep => parseInt(rep.trim()))
                  .filter(rep => !isNaN(rep));
                
                // Store the array of reps
                exerciseInfo.setRepsArray = repVariants;
                
                // Calculate average for backward compatibility
                if (repVariants.length > 0) {
                  exerciseInfo.reps = repVariants.reduce((sum, rep) => sum + rep, 0) / repVariants.length;
                }
              }
              break;
            case 'duration_constant':
              exerciseInfo.duration = parseInt(field.value) || 0;
              break;
            case 'duration_variant':
              // Parse variant durations to get an array of values
              if (field.value) {
                // Split by semicolon based on validation schema
                const durationStrings = field.value.split(';')
                  .filter(dur => dur.trim() !== '');
                
                // Store the array of duration strings
                exerciseInfo.setDurationsArray = durationStrings;
                
                // Calculate average duration in seconds for backward compatibility
                const durationValues = durationStrings.map(durStr => {
                  const parts = durStr.split(':');
                  if (parts.length === 3) {
                    const hours = parseInt(parts[0]) || 0;
                    const minutes = parseInt(parts[1]) || 0;
                    const seconds = parseInt(parts[2]) || 0;
                    return hours * 3600 + minutes * 60 + seconds;
                  }
                  return 0;
                }).filter(dur => dur > 0);
                
                if (durationValues.length > 0) {
                  exerciseInfo.duration = durationValues.reduce((sum, dur) => sum + dur, 0) / durationValues.length;
                }
              }
              break;
            case 'intensity_number':
              exerciseInfo.intensity = parseFloat(field.value) || 0;
              break;
            case 'intensity_string':
              // Parse intensity string to get an array of values
              if (field.value) {
                // Extract numbers from the string (e.g., "RPE 8; RPE 9" -> [8, 9])
                const intensityStrings = field.value.split(';')
                  .filter(int => int.trim() !== '');
                
                // Extract numeric values using regex
                const intensityValues = intensityStrings.map(intStr => {
                  const match = intStr.match(/\d+(\.\d+)?/);
                  return match ? parseFloat(match[0]) : 0;
                }).filter(int => int > 0);
                
                // Store the array of intensity values
                exerciseInfo.setIntensitiesArray = intensityValues;
                
                // Calculate average for backward compatibility
                if (intensityValues.length > 0) {
                  exerciseInfo.intensity = intensityValues.reduce((sum, int) => sum + int, 0) / intensityValues.length;
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
                
                // Add tags to the set of all tags
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
    if (showAllTags) return allExercisesData;
    
    if (selectedTags.length === 0) {
      return allExercisesData.filter(ex => ex.tags.length === 0);
    }
    
    return allExercisesData.filter(exercise => 
      exercise.tags.some(tag => selectedTags.includes(tag))
    );
  }, [allExercisesData, selectedTags, showAllTags]);
  
  // Group exercise data by micro cycle week
  const exercisesByMicroCycle = useMemo(() => {
    const groupedData = {};
    
    filteredExercises.forEach(exercise => {
      const { microWeek, microId } = exercise;
      const microKey = microId;
      
      if (!groupedData[microKey]) {
        groupedData[microKey] = {
          microWeek,
          microId,
          exercises: [],
          totalVolume: 0,
          averageIntensity: 0,
          exerciseCount: 0,
          tagVolumes: {},
          distinctExercises: new Set()
        };
      }
      
      groupedData[microKey].exercises.push(exercise);
      groupedData[microKey].totalVolume += exercise.volume;
      groupedData[microKey].exerciseCount++;
      groupedData[microKey].distinctExercises.add(exercise.name);
      
      // Track volume by tag
      exercise.tags.forEach(tag => {
        if (!groupedData[microKey].tagVolumes[tag]) {
          groupedData[microKey].tagVolumes[tag] = 0;
        }
        groupedData[microKey].tagVolumes[tag] += exercise.volume;
      });
      
      // If no tags, track as "Untagged"
      if (exercise.tags.length === 0) {
        if (!groupedData[microKey].tagVolumes["Untagged"]) {
          groupedData[microKey].tagVolumes["Untagged"] = 0;
        }
        groupedData[microKey].tagVolumes["Untagged"] += exercise.volume;
      }
    });
    
    // Calculate average intensity for each micro cycle
    Object.values(groupedData).forEach(micro => {
      if (micro.exercises.length) {
        const intensitySum = micro.exercises.reduce((sum, ex) => sum + ex.intensity, 0);
        micro.averageIntensity = intensitySum / micro.exercises.length;
      }
    });
    
    return groupedData;
  }, [filteredExercises]);
  
  // Create data for micro cycle comparison chart
  const microComparisonData = useMemo(() => {
    return Object.values(exercisesByMicroCycle)
      .map(micro => ({
        name: micro.microWeek,
        totalVolume: micro.totalVolume,
        averageIntensity: micro.averageIntensity,
        exerciseCount: micro.exerciseCount,
        distinctExercises: micro.distinctExercises.size
      }))
      .sort((a, b) => {
        // Try to extract week number for sorting
        const weekA = parseInt(a.name.match(/\d+/)?.[0] || '0');
        const weekB = parseInt(b.name.match(/\d+/)?.[0] || '0');
        if (weekA !== weekB) return weekA - weekB;
        return a.name.localeCompare(b.name);
      });
  }, [exercisesByMicroCycle]);
  
  // Create volume by tag distribution data across all micro cycles
  const volumeByTagData = useMemo(() => {
    const tags = new Set();
    
    // First collect all tags used across micro cycles
    Object.values(exercisesByMicroCycle).forEach(micro => {
      Object.keys(micro.tagVolumes).forEach(tag => tags.add(tag));
    });
    
    // Format data for stacked bar chart
    return Object.values(exercisesByMicroCycle)
      .map(micro => {
        const data = { name: micro.microWeek };
        
        // Add volume for each tag
        Array.from(tags).forEach(tag => {
          data[tag] = micro.tagVolumes[tag] || 0;
        });
        
        return data;
      })
      .sort((a, b) => {
        // Try to sort by week number if available
        const weekA = parseInt(a.name.match(/\d+/)?.[0] || '0');
        const weekB = parseInt(b.name.match(/\d+/)?.[0] || '0');
        if (weekA !== weekB) return weekA - weekB;
        return a.name.localeCompare(b.name);
      });
  }, [exercisesByMicroCycle]);
  
  // Analyze exercise progression through the phase
  const exerciseProgression = useMemo(() => {
    const exercisesByName = {};
    
    filteredExercises.forEach(exercise => {
      if (!exercisesByName[exercise.name]) {
        exercisesByName[exercise.name] = [];
      }
      exercisesByName[exercise.name].push(exercise);
    });
    
    // Sort each exercise group by date
    Object.keys(exercisesByName).forEach(name => {
      exercisesByName[name].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
    });
    
    // Find most frequent exercises (for reporting)
    const exerciseFrequency = Object.entries(exercisesByName)
      .map(([name, instances]) => ({ 
        name, 
        count: instances.length,
        totalVolume: instances.reduce((sum, ex) => sum + ex.volume, 0)
      }))
      .sort((a, b) => b.count - a.count);
    
    return {
      exercisesByName,
      frequentExercises: exerciseFrequency.slice(0, 5) // Top 5 exercises
    };
  }, [filteredExercises]);

  // Create pie chart data for tag distribution across the phase
  const tagDistributionData = useMemo(() => {
    const tagVolumes = {};
    
    filteredExercises.forEach(exercise => {
      if (exercise.tags.length === 0) {
        tagVolumes["Untagged"] = (tagVolumes["Untagged"] || 0) + exercise.volume;
        return;
      }
      
      exercise.tags.forEach(tag => {
        tagVolumes[tag] = (tagVolumes[tag] || 0) + exercise.volume;
      });
    });
    
    return Object.entries(tagVolumes)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExercises]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF5733', '#C70039', '#900C3F', '#581845'];

  // If there are no session nodes, show a message
  if (!allSessionNodes.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No session data available for this phase.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Phase Overview: {node.data?.label || node.label || 'Unnamed Phase'}</h3>
        <p className="text-sm text-gray-400 mb-4">
          Micro Cycles: {microNodes.length} | Sessions: {allSessionNodes.length} | Date Range: {
            allSessionNodes.length > 0 
              ? `${new Date(allSessionNodes[0].data.date).toLocaleDateString()} - ${new Date(allSessionNodes[allSessionNodes.length-1].data.date).toLocaleDateString()}`
              : 'No date range'
          }
        </p>
        
        {/* Tag Filter Controls */}
        {allTags.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Filter and Visualize by Tags</h4>
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
            <div className="flex flex-wrap gap-2 mb-2">
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
              Click on tags to filter charts. Selected tags will also appear as separate data points in charts.
            </div>
          </div>
        )}
        
        {/* Micro Cycle Comparison Chart */}
        {microComparisonData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Micro Cycle Progression</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={microComparisonData}
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
                    yAxisId="left"
                    dataKey="totalVolume" 
                    name="Total Volume" 
                    fill="#8884d880" 
                    stroke="#8884d8" 
                  />
                  <Line 
                    type="monotone" 
                    yAxisId="right"
                    dataKey="averageIntensity" 
                    name="Avg. Intensity" 
                    stroke="#ff7300"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Volume by Tag Chart */}
        {volumeByTagData.length > 0 && Object.keys(volumeByTagData[0]).length > 1 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Volume Distribution by Tags</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={volumeByTagData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                  stackOffset="expand"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#aaa' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} 
                    tick={{ fill: '#aaa' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }}
                    formatter={(value, name, props) => [
                      `${value} (${(value/props.payload.total * 100).toFixed(0)}%)`, 
                      name
                    ]}
                    labelFormatter={(label) => `Week: ${label}`}
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                  {Object.keys(volumeByTagData[0] || {})
                    .filter(key => key !== 'name')
                    .map((tag, index) => (
                      <Bar 
                        key={tag}
                        dataKey={tag} 
                        stackId="a" 
                        fill={`hsl(${index * 30 % 360}, 70%, 50%)`} 
                      />
                    ))
                  }
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Overall Tag Distribution Pie Chart */}
        {tagDistributionData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Overall Training Volume by Tags</h4>
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
        
        {/* Top Exercises Table */}
        {exerciseProgression.frequentExercises.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Most Frequent Exercises</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-300">
                <thead className="bg-zinc-700">
                  <tr>
                    <th className="py-2 px-4 text-left">Exercise</th>
                    <th className="py-2 px-4 text-right">Occurrences</th>
                    <th className="py-2 px-4 text-right">Total Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {exerciseProgression.frequentExercises.map((exercise, index) => (
                    <tr key={index} className="hover:bg-zinc-700">
                      <td className="py-2 px-4">{exercise.name}</td>
                      <td className="py-2 px-4 text-right">{exercise.count}</td>
                      <td className="py-2 px-4 text-right">{exercise.totalVolume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhaseNodeInspector; 