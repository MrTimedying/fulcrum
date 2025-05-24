import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area, AreaChart
} from 'recharts';
import useFlowStore from '../../state/flowState';

function PhaseNodeInspector({ node }) {
  const { nodes, edges } = useFlowStore();
  
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
    
    // Get the micro nodes
    return nodes.filter(n => 
      connectedNodeIds.includes(n.id) && 
      n.type === 'micro' && 
      n.data?.date
    ).sort((a, b) => {
      // Sort by date
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
      const microWeek = microNode.label || `Week ${microNodeId.substr(0,4)}`;
      const microDate = microNode.data?.date;
      
      const connectedSessions = nodes.filter(n => 
        connectedSessionIds.includes(n.id) && 
        n.type === 'session' && 
        n.data?.exercises &&
        n.data?.date
      ).map(sessionNode => ({
        ...sessionNode,
        microId: microNodeId,
        microWeek,
        microDate
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
  
  // Extract and normalize exercise data from all session nodes
  const allExercisesData = useMemo(() => {
    // Store exercises from all sessions
    const allExercises = [];
    
    allSessionNodes.forEach(sessionNode => {
      if (!sessionNode?.data?.exercises) return;
      
      const sessionDate = sessionNode.data.date;
      const formattedDate = new Date(sessionDate).toLocaleDateString();
      const sessionLabel = sessionNode.data?.label || sessionNode.id;
      const { microId, microWeek, microDate } = sessionNode;
      
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
          microDate,
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
  }, [allSessionNodes]);
  
  // Group exercise data by micro cycle week
  const exercisesByMicroCycle = useMemo(() => {
    const groupedData = {};
    
    allExercisesData.forEach(exercise => {
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
    });
    
    // Calculate average intensity for each micro cycle
    Object.values(groupedData).forEach(micro => {
      if (micro.exercises.length) {
        const intensitySum = micro.exercises.reduce((sum, ex) => sum + ex.intensity, 0);
        micro.averageIntensity = intensitySum / micro.exercises.length;
      }
    });
    
    return groupedData;
  }, [allExercisesData]);
  
  // Create data for micro cycle comparison chart
  const microComparisonData = useMemo(() => {
    return Object.values(exercisesByMicroCycle)
      .map(micro => ({
        name: micro.microWeek,
        totalVolume: micro.totalVolume,
        averageIntensity: micro.averageIntensity,
        exerciseCount: micro.exerciseCount,
        distinctExerciseCount: micro.distinctExercises.size
      }))
      .sort((a, b) => {
        // Extract week number (assuming format "Week X")
        const weekA = parseInt(a.name.replace(/\D/g, '')) || 0;
        const weekB = parseInt(b.name.replace(/\D/g, '')) || 0;
        return weekA - weekB;
      });
  }, [exercisesByMicroCycle]);
  
  // Create data for cumulative volume area chart
  const cumulativeVolumeData = useMemo(() => {
    let cumulativeVolume = 0;
    
    return microComparisonData.map(micro => {
      cumulativeVolume += micro.totalVolume;
      return {
        name: micro.name,
        volume: micro.totalVolume,
        cumulativeVolume
      };
    });
  }, [microComparisonData]);
  
  // Create data for tag volume distribution by micro cycle
  const tagVolumeByMicroData = useMemo(() => {
    const allTags = new Set();
    
    // First collect all unique tags
    Object.values(exercisesByMicroCycle).forEach(micro => {
      Object.keys(micro.tagVolumes).forEach(tag => {
        allTags.add(tag);
      });
    });
    
    // Then create data for each micro cycle with all tags
    return Object.values(exercisesByMicroCycle)
      .map(micro => {
        const dataPoint = { name: micro.microWeek };
        
        // Add each tag's volume
        allTags.forEach(tag => {
          dataPoint[tag] = micro.tagVolumes[tag] || 0;
        });
        
        return dataPoint;
      })
      .sort((a, b) => {
        // Extract week number (assuming format "Week X")
        const weekA = parseInt(a.name.replace(/\D/g, '')) || 0;
        const weekB = parseInt(b.name.replace(/\D/g, '')) || 0;
        return weekA - weekB;
      });
  }, [exercisesByMicroCycle]);

  // If there are no micro nodes, show a message
  if (!microNodes.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No micro cycle nodes connected to this phase.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Phase Overview: {node.label || 'Unnamed Phase'}</h3>
        
        {/* Phase Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Micro Cycles</h4>
            <p className="text-xl font-semibold">{microNodes.length}</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Sessions</h4>
            <p className="text-xl font-semibold">{allSessionNodes.length}</p>
          </div>
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-1 text-gray-300">Date Range</h4>
            <p className="text-sm">
              {microNodes.length > 0 && (
                <>
                  {new Date(microNodes[0].data.date).toLocaleDateString()} to{' '}
                  {new Date(microNodes[microNodes.length - 1].data.date).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Micro Cycle Comparison Chart */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Micro Cycle Comparison</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={microComparisonData}
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
                  label={{ value: 'Intensity', angle: 90, position: 'insideRight', fill: '#aaa' }}
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
                  dot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="distinctExerciseCount" 
                  name="Exercise Variety" 
                  stroke="#82ca9d" 
                  yAxisId="left" 
                  dot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Cumulative Volume Chart */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Cumulative Training Volume</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cumulativeVolumeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#aaa' }} 
                />
                <YAxis 
                  tick={{ fill: '#aaa' }}
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
                <Area 
                  type="monotone" 
                  dataKey="cumulativeVolume" 
                  name="Cumulative Volume" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
                <Bar 
                  dataKey="volume" 
                  name="Weekly Volume" 
                  fill="#82ca9d" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Volume By Category Across Micro Cycles */}
        <div className="bg-zinc-800 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium mb-3 text-gray-300">Volume Distribution by Category</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tagVolumeByMicroData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                barCategoryGap={15}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#aaa' }} 
                />
                <YAxis 
                  tick={{ fill: '#aaa' }} 
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
                {Object.keys(tagVolumeByMicroData[0] || {})
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
      </div>
    </div>
  );
}

export default PhaseNodeInspector; 