import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area
} from 'recharts';
import useFlowStore from '../../state/flowState';

function MicroNodeInspector({ node }) {
  const { nodes, edges } = useFlowStore();
  
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
      n.data?.date
    ).sort((a, b) => {
      // Sort by date
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateA - dateB;
    });
  }, [node, nodes, edges]);
  
  // Parse exercise data from all session nodes
  const allExercisesData = useMemo(() => {
    // Store exercises from all sessions
    const allExercises = [];
    
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
  }, [sessionNodes]);
  
  // Group exercises by name to track progression
  const exercisesByName = useMemo(() => {
    const groupedExercises = {};
    
    allExercisesData.forEach(exercise => {
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
  }, [allExercisesData]);
  
  // Generate data for overall volume chart by session
  const volumeBySessionData = useMemo(() => {
    const sessionVolumes = {};
    
    allExercisesData.forEach(exercise => {
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
  }, [allExercisesData]);
  
  // Generate data for volume by exercise category
  const volumeByTagData = useMemo(() => {
    const tagVolumes = {};
    
    allExercisesData.forEach(exercise => {
      const { formattedDate, volume, tags } = exercise;
      
      if (!tags.length) {
        // Handle exercises with no tags
        if (!tagVolumes['Untagged']) {
          tagVolumes['Untagged'] = {};
        }
        if (!tagVolumes['Untagged'][formattedDate]) {
          tagVolumes['Untagged'][formattedDate] = 0;
        }
        tagVolumes['Untagged'][formattedDate] += volume;
        return;
      }
      
      tags.forEach(tag => {
        if (!tagVolumes[tag]) {
          tagVolumes[tag] = {};
        }
        if (!tagVolumes[tag][formattedDate]) {
          tagVolumes[tag][formattedDate] = 0;
        }
        tagVolumes[tag][formattedDate] += volume;
      });
    });
    
    // Convert to format suitable for stacked bar chart
    const sessions = [...new Set(allExercisesData.map(ex => ex.formattedDate))].sort((a, b) => {
      return new Date(a) - new Date(b);
    });
    
    return sessions.map(session => {
      const dataPoint = { name: session };
      Object.keys(tagVolumes).forEach(tag => {
        dataPoint[tag] = tagVolumes[tag][session] || 0;
      });
      return dataPoint;
    });
  }, [allExercisesData]);
  
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
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Micro Cycle Overview: {node.label || 'Unnamed Micro Cycle'}</h3>
        
        {/* Session Count and Date Range */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Sessions</h4>
            <p className="text-xl font-semibold">{sessionNodes.length}</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Date Range</h4>
            <p className="text-sm">
              {sessionNodes.length > 0 && (
                <>
                  {new Date(sessionNodes[0].data.date).toLocaleDateString()} to{' '}
                  {new Date(sessionNodes[sessionNodes.length - 1].data.date).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Weekly Volume Chart */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Total Volume by Session</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeBySessionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#aaa' }} 
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
                <Bar dataKey="totalVolume" name="Total Volume (Sets × Reps)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Volume By Exercise Category (Tags) */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Volume Distribution by Category</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeByTagData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                stackOffset="expand"
                barCategoryGap={15}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#aaa' }} 
                />
                <YAxis 
                  tick={{ fill: '#aaa' }} 
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#333', 
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#eee' 
                  }} 
                  formatter={(value, name) => [`${value} volume units`, name]}
                />
                <Legend wrapperStyle={{ color: '#ccc' }} />
                {Object.keys(volumeByTagData[0] || {})
                  .filter(key => key !== 'name')
                  .map((key, index) => {
                    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];
                    return (
                      <Bar 
                        key={key} 
                        dataKey={key} 
                        stackId="a" 
                        fill={colors[index % colors.length]} 
                      />
                    );
                  })
                }
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Exercise Progression */}
        {availableExercises.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Exercise Progression</h4>
            {availableExercises.map(exerciseName => {
              const exerciseData = exercisesByName[exerciseName];
              // Only show exercises that appear in at least 2 sessions
              if (exerciseData.length < 2) return null;
              
              return (
                <div key={exerciseName} className="mb-8 last:mb-0">
                  <h5 className="text-sm font-medium mb-2">{exerciseName}</h5>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={exerciseData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="formattedDate" 
                          tick={{ fill: '#aaa' }} 
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
                        />
                        <Legend wrapperStyle={{ color: '#ccc' }} />
                        <Line 
                          type="monotone" 
                          dataKey="intensity" 
                          name="Intensity" 
                          yAxisId="left" 
                          stroke="#ff7300" 
                          dot={{ r: 5 }} 
                        />
                        <Bar 
                          dataKey="volume" 
                          name="Volume (Sets × Reps)" 
                          yAxisId="right" 
                          fill="#82ca9d" 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MicroNodeInspector; 