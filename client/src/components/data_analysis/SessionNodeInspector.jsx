import React, { useMemo, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getExerciseContainerDisplayName } from '../../utils/exerciseUtils';

function SessionNodeInspector({ node }) {
  // State for selected tags for filtering charts
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(true); // Default to showing all tags
  // New state for tracking the selected exercise for set-by-set analysis
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Parse and normalize exercise data from the node
  const { exerciseData, allTags } = useMemo(() => {
    if (!node?.data?.exercises) return { exerciseData: [], allTags: [] };

    // Extract exercises from the node data
    const exercises = node.data.exercises;
    const normalizedExercises = [];
    const tagSet = new Set();

    // Iterate through each container in the exercises object
    Object.keys(exercises).forEach(containerName => {
      const container = exercises[containerName];
      
      // Skip if fields aren't present
      if (!container?.fields || !Array.isArray(container.fields)) return;
      
      // Create an object to store parsed exercise data
      const exerciseInfo = {
        name: getExerciseContainerDisplayName(containerName),
        originalMangledKey: containerName,
        sets: 0,
        reps: 0,
        duration: 0,
        intensity: 0,
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
              // Split by semicolon (not comma) based on validation schema
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
      
      normalizedExercises.push(exerciseInfo);
    });
    
    return { 
      exerciseData: normalizedExercises,
      allTags: Array.from(tagSet).sort()
    };
  }, [node]);

  // Handle tag selection
  const handleTagSelection = useCallback((tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    // When user starts selecting specific tags, turn off "show all" mode
    if (showAllTags) setShowAllTags(false);
  }, [showAllTags]);

  // Toggle "show all tags" mode
  const toggleShowAllTags = useCallback(() => {
    setShowAllTags(prev => !prev);
    if (!showAllTags) {
      // When turning on "show all", clear specific selections
      setSelectedTags([]);
    }
  }, [showAllTags]);

  // Handle exercise selection for set-by-set analysis
  const handleExerciseSelection = useCallback((exerciseName) => {
    setSelectedExercise(exerciseName === selectedExercise ? null : exerciseName);
  }, [selectedExercise]);

  // Filter exercises based on selected tags
  const filteredExerciseData = useMemo(() => {
    if (showAllTags) return exerciseData;
    
    if (selectedTags.length === 0) {
      // When no tags are selected but "show all" is off, show exercises with no tags
      return exerciseData.filter(ex => ex.tags.length === 0);
    }
    
    return exerciseData.filter(exercise => 
      exercise.tags.some(tag => selectedTags.includes(tag))
    );
  }, [exerciseData, selectedTags, showAllTags]);

  // Get the selected exercise data for set-by-set analysis
  const selectedExerciseData = useMemo(() => {
    if (!selectedExercise) return null;
    
    return filteredExerciseData.find(ex => ex.originalMangledKey === selectedExercise);
  }, [filteredExerciseData, selectedExercise]);

  // Create data for set-by-set analysis charts
  const setBySetChartData = useMemo(() => {
    if (!selectedExerciseData) return { repsData: [], intensityData: [] };
    
    const exercise = selectedExerciseData;
    
    // Prepare data for reps chart
    const repsData = exercise.setRepsArray.map((reps, index) => ({
      set: `Set ${index + 1}`,
      reps
    }));
    
    // Prepare data for intensity chart
    const intensityData = exercise.setIntensitiesArray.map((intensity, index) => ({
      set: `Set ${index + 1}`,
      intensity
    }));
    
    return { repsData, intensityData };
  }, [selectedExerciseData]);

  // Create data for bar chart showing key metrics for each exercise
  const barChartData = useMemo(() => {
    const data = [];
    
    // Add exercise-based data points first (LEFT SIDE)
    filteredExerciseData.forEach(exercise => {
      data.push({
        name: exercise.name,
        category: "exercise", // Mark as exercise for styling
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        intensity: exercise.intensity,
        volume: exercise.volume
      });
    });
    
    // If we have any selected tags and not showing all tags, add tag-based aggregates (RIGHT SIDE)
    if (selectedTags.length > 0 && !showAllTags) {
      // Add a gap between exercises and tags
      data.push({
        name: "──────",
        category: "divider",
        sets: null,
        reps: null,
        duration: null,
        intensity: null,
        volume: null
      });
      
      // Calculate metrics per tag
      selectedTags.forEach(tag => {
        // Filter exercises that have this tag
        const exercisesWithTag = filteredExerciseData.filter(ex => 
          ex.tags.includes(tag)
        );
        
        if (exercisesWithTag.length > 0) {
          // Calculate aggregates
          const totalSets = exercisesWithTag.reduce((sum, ex) => sum + ex.sets, 0);
          const totalReps = exercisesWithTag.reduce((sum, ex) => sum + ex.reps, 0) / exercisesWithTag.length;
          const totalDuration = exercisesWithTag.reduce((sum, ex) => sum + ex.duration, 0);
          const avgIntensity = exercisesWithTag.reduce((sum, ex) => sum + ex.intensity, 0) / exercisesWithTag.length;
          const totalVolume = exercisesWithTag.reduce((sum, ex) => sum + ex.volume, 0);
          
          // Add tag-based data point
          data.push({
            name: `#${tag}`,
            category: "tag", // Mark as tag for styling
            sets: totalSets,
            reps: totalReps,
            duration: totalDuration,
            intensity: avgIntensity,
            volume: totalVolume
          });
        }
      });
    }
    
    return data;
  }, [filteredExerciseData, selectedTags, showAllTags]);

  // Create data for pie chart showing exercise distribution by tags
  const pieChartData = useMemo(() => {
    // When showing all or with specific tag selections
    let tagsToUse = showAllTags ? allTags : selectedTags;
    
    // If no tags are selected and not showing all, count untagged exercises
    if (!showAllTags && selectedTags.length === 0) {
      return [{ name: 'Untagged', value: filteredExerciseData.length }];
    }
    
    const tagCounts = {};
    
    // Initialize all selected tags with zero count
    tagsToUse.forEach(tag => {
      tagCounts[tag] = 0;
    });
    
    // Count exercises by tag
    filteredExerciseData.forEach(exercise => {
      exercise.tags.forEach(tag => {
        if (tagsToUse.includes(tag)) {
          tagCounts[tag]++;
        }
      });
    });
    
    // Convert to array format for the pie chart
    return Object.keys(tagCounts)
      .filter(tag => tagCounts[tag] > 0) // Only include tags with exercises
      .map(tag => ({
        name: tag,
        value: tagCounts[tag]
      }));
  }, [filteredExerciseData, allTags, selectedTags, showAllTags]);

  // Create volume distribution data
  const volumeDistributionData = useMemo(() => {
    if (filteredExerciseData.length === 0) return [];
    
    // When showing all or with specific tag selections
    let tagsToUse = showAllTags ? allTags : selectedTags;
    
    // If no tags are selected and not showing all, show volume for untagged exercises
    if (!showAllTags && selectedTags.length === 0) {
      const totalVolume = filteredExerciseData.reduce((sum, ex) => sum + ex.volume, 0);
      return [{ name: 'Untagged', value: totalVolume }];
    }
    
    const tagVolumes = {};
    
    // Initialize all selected tags with zero volume
    tagsToUse.forEach(tag => {
      tagVolumes[tag] = 0;
    });
    
    // Sum volume by tag
    filteredExerciseData.forEach(exercise => {
      const exerciseVolume = exercise.volume;
      if (exercise.tags.length === 0) {
        // Handle untagged exercises if needed
        if (!showAllTags && selectedTags.length === 0) {
          tagVolumes['Untagged'] = (tagVolumes['Untagged'] || 0) + exerciseVolume;
        }
        return;
      }
      
      exercise.tags.forEach(tag => {
        if (tagsToUse.includes(tag)) {
          tagVolumes[tag] += exerciseVolume;
        }
      });
    });
    
    // Convert to array format for the pie chart
    return Object.keys(tagVolumes)
      .filter(tag => tagVolumes[tag] > 0) // Only include tags with volume
      .map(tag => ({
        name: tag,
        value: tagVolumes[tag]
      }));
  }, [filteredExerciseData, allTags, selectedTags, showAllTags]);
  
  // Create intensity distribution data by tags
  const intensityByTagData = useMemo(() => {
    if (filteredExerciseData.length === 0) return [];
    
    let tagsToUse = showAllTags ? allTags : selectedTags;
    
    if (!showAllTags && selectedTags.length === 0) {
      // Handle when showing only untagged exercises
      const intensities = filteredExerciseData.map(ex => ex.intensity).filter(i => i > 0);
      if (intensities.length === 0) return [];
      
      const avgIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
      return [{ name: 'Untagged', value: avgIntensity }];
    }
    
    const tagIntensities = {};
    const tagCounts = {};
    
    // Initialize
    tagsToUse.forEach(tag => {
      tagIntensities[tag] = 0;
      tagCounts[tag] = 0;
    });
    
    // Sum intensities by tag
    filteredExerciseData.forEach(exercise => {
      if (exercise.intensity <= 0) return; // Skip exercises with no intensity
      
      if (exercise.tags.length === 0) {
        // Handle untagged
        if (!showAllTags && selectedTags.length === 0) {
          tagIntensities['Untagged'] = (tagIntensities['Untagged'] || 0) + exercise.intensity;
          tagCounts['Untagged'] = (tagCounts['Untagged'] || 0) + 1;
        }
        return;
      }
      
      exercise.tags.forEach(tag => {
        if (tagsToUse.includes(tag)) {
          tagIntensities[tag] += exercise.intensity;
          tagCounts[tag]++;
        }
      });
    });
    
    // Calculate averages and format for chart
    return Object.keys(tagIntensities)
      .filter(tag => tagCounts[tag] > 0)
      .map(tag => ({
        name: tag,
        value: tagIntensities[tag] / tagCounts[tag]
      }));
  }, [filteredExerciseData, allTags, selectedTags, showAllTags]);

  // Predefined colors for the chart segments
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF5733', '#C70039', '#900C3F', '#581845'];

  // Custom bar colors based on category (exercise vs tag)
  const getBarFill = (dataKey, entry) => {
    if (!entry || entry.category === 'divider') return 'transparent';
    
    const baseColors = {
      sets: '#8884d8',
      reps: '#82ca9d',
      intensity: '#ffc658',
      volume: '#ff7300',
      duration: '#ff5733'
    };
    
    // Brighten colors for tag-based bars
    if (entry.category === 'tag') {
      switch(dataKey) {
        case 'sets': return '#a09be0';
        case 'reps': return '#9fe0bc';
        case 'intensity': return '#ffd17b';
        case 'volume': return '#ff9640';
        case 'duration': return '#ff7a5c';
        default: return baseColors[dataKey];
      }
    }
    
    return baseColors[dataKey];
  };

  // If there are no exercises, show a message
  if (!exerciseData.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No exercise data found for this session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Session Overview: {node.data?.label || node.label || 'Unnamed Session'}</h3>
        <p className="text-sm text-gray-400 mb-4">
          Date: {new Date(node.data.date).toLocaleDateString()}
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
        
        {/* Exercise Selection for Set-by-Set Analysis */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Exercise Set-by-Set Analysis</h4>
          <div className="mb-4">
            <select
              className="w-full p-2 rounded bg-zinc-700 text-white border border-zinc-600"
              value={selectedExercise || ''}
              onChange={(e) => handleExerciseSelection(e.target.value)}
            >
              <option value="">Select an exercise to view set-by-set data</option>
              {filteredExerciseData.map(exercise => (
                <option key={exercise.originalMangledKey} value={exercise.originalMangledKey}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedExerciseData && (
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                <p>Exercise: <span className="font-medium">{selectedExerciseData.name}</span></p>
                <p>Sets: {selectedExerciseData.sets} | 
                   Average Reps: {selectedExerciseData.reps.toFixed(1)} | 
                   Average Intensity: {selectedExerciseData.intensity.toFixed(1)}</p>
              </div>
              
              {/* Reps per Set Chart */}
              {setBySetChartData.repsData.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2 text-gray-400">Repetitions by Set</h5>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={setBySetChartData.repsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="set" tick={{ fill: '#aaa' }} />
                        <YAxis tick={{ fill: '#aaa' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#333', 
                            border: '1px solid #555',
                            borderRadius: '4px',
                            color: '#eee' 
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="reps" 
                          name="Repetitions" 
                          stroke="#82ca9d"
                          strokeWidth={2}
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {/* Intensity per Set Chart */}
              {setBySetChartData.intensityData.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2 text-gray-400">Intensity by Set</h5>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={setBySetChartData.intensityData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="set" tick={{ fill: '#aaa' }} />
                        <YAxis tick={{ fill: '#aaa' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#333', 
                            border: '1px solid #555',
                            borderRadius: '4px',
                            color: '#eee' 
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="intensity" 
                          name="Intensity" 
                          stroke="#ff7300"
                          strokeWidth={2}
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!selectedExercise && (
            <div className="text-sm text-gray-400 text-center py-4">
              Select an exercise from the dropdown to view set-by-set analysis.
            </div>
          )}
        </div>
        
        {/* Bar Chart for Exercise Metrics Comparison */}
        {barChartData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Exercise Metrics</h4>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
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
                      
                      // Use different styling for exercise names vs tag names
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
                  <YAxis tick={{ fill: '#aaa' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }}
                    formatter={(value, name, props) => {
                      if (props.payload.category === 'divider') return ['-', ''];
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                      if (label === "──────") return "──────";
                      return label;
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
                  
                  {/* Render bars with custom colors based on category */}
                  <Bar 
                    dataKey="sets" 
                    name="Sets" 
                    fill="#8884d8" 
                    shape={(props) => {
                      if (props.payload.category === 'divider') return null;
                      // Destructure to remove Recharts-specific props
                      const { dataKey, D1, D2, tooltipPayload, tooltipPosition, ...domProps } = props;
                      return <rect {...domProps} fill={getBarFill('sets', props.payload)} />;
                    }}
                  />
                  <Bar 
                    dataKey="reps" 
                    name="Reps" 
                    fill="#82ca9d" 
                    shape={(props) => {
                      if (props.payload.category === 'divider') return null;
                      // Destructure to remove Recharts-specific props
                      const { dataKey, D1, D2, tooltipPayload, tooltipPosition, ...domProps } = props;
                      return <rect {...domProps} fill={getBarFill('reps', props.payload)} />;
                    }}
                  />
                  <Bar 
                    dataKey="intensity" 
                    name="Intensity" 
                    fill="#ffc658" 
                    shape={(props) => {
                      if (props.payload.category === 'divider') return null;
                      // Destructure to remove Recharts-specific props
                      const { dataKey, D1, D2, tooltipPayload, tooltipPosition, ...domProps } = props;
                      return <rect {...domProps} fill={getBarFill('intensity', props.payload)} />;
                    }}
                  />
                  <Bar 
                    dataKey="volume" 
                    name="Volume (Sets×Reps)" 
                    fill="#ff7300" 
                    shape={(props) => {
                      if (props.payload.category === 'divider') return null;
                      // Destructure to remove Recharts-specific props
                      const { dataKey, D1, D2, tooltipPayload, tooltipPosition, ...domProps } = props;
                      return <rect {...domProps} fill={getBarFill('volume', props.payload)} />;
                    }}
                  />
                  <Bar 
                    dataKey="duration" 
                    name="Duration (s)" 
                    fill="#ff5733" 
                    shape={(props) => {
                      if (props.payload.category === 'divider') return null;
                      // Destructure to remove Recharts-specific props
                      const { dataKey, D1, D2, tooltipPayload, tooltipPosition, ...domProps } = props;
                      return <rect {...domProps} fill={getBarFill('duration', props.payload)} />;
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {selectedTags.length > 0 && !showAllTags && (
              <div className="mt-3 text-xs text-gray-400">
                <div className="flex items-center">
                  <span className="flex-1">Exercise metrics (left)</span>
                  <span className="border-t border-gray-500 flex-grow mx-2"></span>
                  <span className="flex-1 text-right">Tag aggregated metrics (right)</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Pie Chart for Exercise Distribution by Tags */}
        {pieChartData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Exercise Count by Tags</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `#${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        style={{ 
                          opacity: !showAllTags && selectedTags.includes(entry.name) ? 1 : 0.7,
                          filter: !showAllTags && selectedTags.includes(entry.name) ? 'brightness(1.2)' : 'none'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }} 
                    formatter={(value, name) => [`${value} exercises`, `#${name}`]}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#ccc' }} 
                    formatter={(value) => `#${value}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Pie Chart for Volume Distribution by Tags */}
        {volumeDistributionData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Training Volume by Tags</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={volumeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `#${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {volumeDistributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        style={{ 
                          opacity: !showAllTags && selectedTags.includes(entry.name) ? 1 : 0.7,
                          filter: !showAllTags && selectedTags.includes(entry.name) ? 'brightness(1.2)' : 'none'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }} 
                    formatter={(value, name) => [`Volume: ${value}`, `#${name}`]}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#ccc' }} 
                    formatter={(value) => `#${value}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Pie Chart for Intensity Distribution by Tags */}
        {intensityByTagData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Average Intensity by Tags</h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={intensityByTagData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `#${name}: ${value.toFixed(1)}`}
                  >
                    {intensityByTagData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[(index + 5) % COLORS.length]} 
                        style={{ 
                          opacity: !showAllTags && selectedTags.includes(entry.name) ? 1 : 0.7,
                          filter: !showAllTags && selectedTags.includes(entry.name) ? 'brightness(1.2)' : 'none'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#333', 
                      border: '1px solid #555',
                      borderRadius: '4px',
                      color: '#eee' 
                    }} 
                    formatter={(value, name) => [`Intensity: ${value.toFixed(1)}`, `#${name}`]}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#ccc' }} 
                    formatter={(value) => `#${value}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      
      {/* Exercise Details Table */}
      <div className="bg-zinc-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-3 text-gray-300">Exercise Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-300">
            <thead className="bg-zinc-700">
              <tr>
                <th className="py-2 px-4 text-left">Exercise</th>
                <th className="py-2 px-4 text-right">Sets</th>
                <th className="py-2 px-4 text-right">Reps</th>
                <th className="py-2 px-4 text-right">Volume</th>
                <th className="py-2 px-4 text-right">Duration</th>
                <th className="py-2 px-4 text-right">Intensity</th>
                <th className="py-2 px-4 text-left">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {filteredExerciseData.map((exercise, index) => (
                <tr key={exercise.originalMangledKey} className="hover:bg-zinc-700">
                  <td className="py-2 px-4">{exercise.name}</td>
                  <td className="py-2 px-4 text-right">{exercise.sets}</td>
                  <td className="py-2 px-4 text-right">{exercise.reps.toFixed(1)}</td>
                  <td className="py-2 px-4 text-right">{exercise.volume}</td>
                  <td className="py-2 px-4 text-right">{exercise.duration}s</td>
                  <td className="py-2 px-4 text-right">{exercise.intensity}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-1">
                      {exercise.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            selectedTags.includes(tag) || showAllTags 
                              ? 'bg-indigo-600/70 text-white' 
                              : 'bg-zinc-700 text-gray-300'
                          }`}
                        >
                          <span className="mr-1">#</span>
                          {tag}
                        </span>
                      ))}
                      {exercise.tags.length === 0 && (
                        <span className="text-xs text-gray-500">No tags</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SessionNodeInspector;