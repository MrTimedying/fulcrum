import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area
} from 'recharts';
import useFlowStore from '../../state/flowState';

function MicroNodeInspector({ node }) {
  const { nodes, edges } = useFlowStore();
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(true);
  
  // Find all session nodes connected to this micro node
  const sessionNodes = useMemo(() => {
    if (!node) return [];
    
    // Find all edges connected to this node
    const connectedEdges = edges.filter(
      edge => edge.source === node.id || edge.target === node.id
    );
    
    // Get the IDs of connected nodes
    const connectedNodeIds = connectedEdges.map(edge => 
      edge.source === node.id ? edge.target : edge.source
    );
    
    // Get the session nodes
    return nodes.filter(n => 
      connectedNodeIds.includes(n.id) && 
      n.type === 'session' && 
      n.data?.exercises && 
      n.data?.date // Only sessions with date and exercises
    ).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateA - dateB;
    });
  }, [node, nodes, edges]);
  
  // Parse exercise data from all session nodes and extract all tags
  const { allExercisesData, allTags } = useMemo(() => {
    // Store exercises from all sessions
    const allExercises = [];
    const tagSet = new Set();
    
    sessionNodes.forEach(sessionNode => {
      if (!sessionNode?.data?.exercises) return;
      
      const sessionDate = sessionNode.data.date;
      const formattedDate = new Date(sessionDate).toLocaleDateString();
      const sessionLabel = sessionNode.data?.label || sessionNode.id;
      
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
          
          // Use field.subtype instead of field.name for reliable identification
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
  }, [sessionNodes]);
  
  // Handle tag selection/filtering
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
  
  // Group exercises by name to track progression
  const exercisesByName = useMemo(() => {
    const groupedExercises = {};
    
    filteredExercises.forEach(exercise => {
      if (!groupedExercises[exercise.name]) {
        groupedExercises[exercise.name] = [];
      }
      groupedExercises[exercise.name].push(exercise);
    });
    
    // Sort each exercise group by date
    Object.keys(groupedExercises).forEach(name => {
      groupedExercises[name].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
    });
    
    return groupedExercises;
  }, [filteredExercises]);
  
  // Generate data for overall volume chart by session
  const volumeBySessionData = useMemo(() => {
    const sessionVolumes = {};
    
    filteredExercises.forEach(exercise => {
      const { sessionId, formattedDate, volume } = exercise;
      if (!sessionVolumes[sessionId]) {
        sessionVolumes[sessionId] = {
          name: formattedDate,
          totalVolume: 0,
          exerciseCount: 0
        };
      }
      sessionVolumes[sessionId].totalVolume += volume;
      sessionVolumes[sessionId].exerciseCount++;
    });
    
    return Object.values(sessionVolumes).sort((a, b) => {
      return new Date(a.name) - new Date(b.name);
    });
  }, [filteredExercises]);
  
  // Generate data for volume by exercise category
  const volumeByTagData = useMemo(() => {
    if (filteredExercises.length === 0) return [];
    
    // Organize data by session date for the left side
    const sessionData = {};
    const sessionsInOrder = [];
    
    // Get unique sessions and initialize structure
    filteredExercises.forEach(exercise => {
      const { formattedDate, sessionId } = exercise;
      if (!sessionData[formattedDate]) {
        sessionData[formattedDate] = {
          name: formattedDate,
          category: "session",
          total: 0
        };
        sessionsInOrder.push(formattedDate);
      }
      sessionData[formattedDate].total += exercise.volume;
    });
    
    // Build data array with sessions on the left
    const data = Object.values(sessionData);
    
    // If we have selected tags, add tag-based aggregates on the right
    if (selectedTags.length > 0 && !showAllTags) {
      // Add a divider
      data.push({
        name: "──────",
        category: "divider",
        total: null
      });
      
      // Add volume by tag
      selectedTags.forEach(tag => {
        const tagData = {
          name: `#${tag}`,
          category: "tag"
        };
        
        // Calculate volume for each session date for this tag
        sessionsInOrder.forEach(date => {
          const exercisesWithTagOnDate = filteredExercises.filter(ex => 
            ex.formattedDate === date && ex.tags.includes(tag)
          );
          
          const tagVolumeOnDate = exercisesWithTagOnDate.reduce((sum, ex) => sum + ex.volume, 0);
          tagData[date] = tagVolumeOnDate;
          tagData.total = (tagData.total || 0) + tagVolumeOnDate;
        });
        
        data.push(tagData);
      });
    } else {
      // Otherwise, add tag distribution within each session (original behavior)
      filteredExercises.forEach(exercise => {
        const { formattedDate, volume, tags } = exercise;
        
        if (!tags.length) {
          // Handle exercises with no tags
          if (!sessionData[formattedDate].Untagged) {
            sessionData[formattedDate].Untagged = 0;
          }
          sessionData[formattedDate].Untagged += volume;
          return;
        }
        
        tags.forEach(tag => {
          if (!sessionData[formattedDate][tag]) {
            sessionData[formattedDate][tag] = 0;
          }
          sessionData[formattedDate][tag] += volume;
        });
      });
    }
    
    return data;
  }, [filteredExercises, selectedTags, showAllTags]);
  
  // Custom bar colors based on category (session vs tag)
  const getBarFill = (dataKey, entry) => {
    if (!entry || entry.category === 'divider') return 'transparent';
    
    // Use color from the COLORS array for each tag/category
    if (entry.category === 'tag') {
      // Find the index of this tag in selectedTags
      const tagIndex = selectedTags.indexOf(entry.name.substring(1)); // Remove # prefix
      return `hsl(${(tagIndex * 30 + 180) % 360}, 70%, 50%)`;
    }
    
    return `hsl(${parseInt(dataKey.length * 7) % 360}, 70%, 50%)`;
  };
  
  // List of available exercises for the selection dropdown
  const availableExercises = useMemo(() => {
    return Object.keys(exercisesByName);
  }, [exercisesByName]);

  // If there are no session nodes, show a message
  if (!sessionNodes.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No session nodes connected to this micro cycle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Micro Cycle Overview: {node.data?.label || node.label || 'Unnamed Micro Cycle'}</h3>
        <p className="text-sm text-gray-400 mb-4">
          Sessions: {sessionNodes.length} | Date Range: {
            sessionNodes.length > 0 
              ? `${new Date(sessionNodes[0].data.date).toLocaleDateString()} - ${new Date(sessionNodes[sessionNodes.length-1].data.date).toLocaleDateString()}`
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
        
        {/* Volume Progress Chart */}
        {volumeBySessionData.length > 1 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Volume Progression</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={volumeBySessionData}
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
                  <YAxis tick={{ fill: '#aaa' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }} 
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                  <Line 
                    type="monotone" 
                    dataKey="totalVolume" 
                    name="Total Volume" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Volume by Tag Chart */}
        {volumeByTagData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Volume Distribution by Tags</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={volumeByTagData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="name" 
                    tick={props => {
                      const { x, y, payload } = props;
                      if (payload.value === "──────") {
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text x={0} y={0} dy={16} textAnchor="middle" fill="#666"></text>
                          </g>
                        );
                      }
                      
                      // Use different styling for session dates vs tag names
                      const isTag = payload.value.startsWith('#');
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text 
                            x={0} 
                            y={0} 
                            dy={16} 
                            textAnchor="end" 
                            fill={isTag ? "#afd5ff" : "#aaa"} 
                            fontWeight={isTag ? "500" : "normal"}
                            transform="rotate(-45)"
                          >
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                    height={70}
                  />
                  <YAxis 
                    label={{ value: 'Volume', angle: -90, position: 'insideLeft', fill: '#aaa' }}
                    tick={{ fill: '#aaa' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }}
                    formatter={(value, name, props) => {
                      if (props.payload.category === 'divider' || value === 0 || !value) return ['-', ''];
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                      if (label === "──────") return "──────";
                      return label;
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                  
                  {/* For sessions, show total volume */}
                  <Bar 
                    dataKey="total" 
                    name="Total Volume" 
                    fill="#8884d8"
                    shape={(props) => {
                      if (props.payload.category === 'divider') return null;
                      // Destructure to remove dataKey, D1, D2, tooltipPayload, tooltipPosition, and any other non-DOM props
                      const { dataKey, D1, D2, tooltipPayload, tooltipPosition, ...domProps } = props;
                      return <rect {...domProps} fill={getBarFill('total', props.payload)} />;
                    }}
                  />
                  
                  {/* When showing specific tags, render session-by-session breakdown for tag data */}
                  {selectedTags.length > 0 && !showAllTags && volumeByTagData.filter(d => d.category === 'session').map(session => (
                    <Bar 
                      key={session.name}
                      dataKey={session.name} 
                      name={session.name} 
                      fill={`hsl(${session.name.length * 10 % 360}, 70%, 50%)`}
                      // Only show these bars for tag data points
                      shape={(props) => {
                        if (props.payload.category !== 'tag') return null;
                        // Destructure to remove dataKey, D1, D2, tooltipPayload, tooltipPosition, and any other non-DOM props
                        const { dataKey, D1, D2, tooltipPayload, tooltipPosition, ...domProps } = props;
                        return <rect {...domProps} fill={getBarFill(session.name, props.payload)} />;
                      }}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {selectedTags.length > 0 && !showAllTags && (
              <div className="mt-3 text-xs text-gray-400">
                <div className="flex items-center">
                  <span className="flex-1">Session volume (left)</span>
                  <span className="border-t border-gray-500 flex-grow mx-2"></span>
                  <span className="flex-1 text-right">Volume by tag (right)</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Exercise Progression Charts */}
        {availableExercises.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Exercise Progression</h4>
            <div className="space-y-8">
              {availableExercises.map(exerciseName => {
                const exerciseInstances = exercisesByName[exerciseName];
                if (exerciseInstances.length < 2) return null; // Only show progression if exercise appears multiple times
                
                return (
                  <div key={exerciseName} className="border-t border-zinc-700 pt-4">
                    <h5 className="text-sm font-medium mb-3">{exerciseName}</h5>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={exerciseInstances}
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
                            labelFormatter={(label) => `Session: ${label}`}
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
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MicroNodeInspector;