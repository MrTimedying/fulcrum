import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

function SessionNodeInspector({ node }) {
  // Parse and normalize exercise data from the node
  const exerciseData = useMemo(() => {
    if (!node?.data?.exercises) return [];

    // Extract exercises from the node data
    const exercises = node.data.exercises;
    const normalizedExercises = [];

    // Iterate through each container in the exercises object
    Object.keys(exercises).forEach(containerName => {
      const container = exercises[containerName];
      
      // Skip if fields aren't present
      if (!container?.fields || !Array.isArray(container.fields)) return;
      
      // Create an object to store parsed exercise data
      const exerciseInfo = {
        name: containerName,
        sets: 0,
        reps: 0,
        duration: 0,
        intensity: 0,
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
            // Parse variant reps (e.g. "10, 8, 6") and take the average
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
            // Extract number from strings like "RPE 8" or "80% 1RM"
            if (field.value) {
              const match = field.value.match(/\d+(\.\d+)?/);
              if (match) {
                exerciseInfo.intensity = parseFloat(match[0]) || 0;
              }
            }
            break;
          case 'tags':
            // Parse tags from a comma-separated list
            if (field.value) {
              exerciseInfo.tags = field.value.split(',')
                .map(tag => tag.trim())
                .filter(tag => tag);
            }
            break;
        }
      });
      
      normalizedExercises.push(exerciseInfo);
    });
    
    return normalizedExercises;
  }, [node]);

  // Create data for bar chart showing key metrics for each exercise
  const barChartData = useMemo(() => {
    return exerciseData.map(exercise => ({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      duration: exercise.duration,
      intensity: exercise.intensity
    }));
  }, [exerciseData]);

  // Create data for pie chart showing exercise distribution by tags
  const pieChartData = useMemo(() => {
    const tagCounts = {};
    
    // Count exercises by tag
    exerciseData.forEach(exercise => {
      exercise.tags.forEach(tag => {
        if (!tagCounts[tag]) tagCounts[tag] = 0;
        tagCounts[tag]++;
      });
    });
    
    // Convert to array format for the pie chart
    return Object.keys(tagCounts).map(tag => ({
      name: tag,
      value: tagCounts[tag]
    }));
  }, [exerciseData]);

  // Predefined colors for the pie chart segments
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // If there are no exercises, show a message
  if (!exerciseData.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No exercise data found for this session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Session Overview: {node.label || 'Unnamed Session'}</h3>
        
        {/* Bar Chart for Exercise Metrics Comparison */}
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
                <Bar dataKey="sets" name="Sets" fill="#8884d8" />
                <Bar dataKey="reps" name="Reps" fill="#82ca9d" />
                <Bar dataKey="intensity" name="Intensity" fill="#ffc658" />
                <Bar dataKey="duration" name="Duration (s)" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Pie Chart for Exercise Distribution by Tags */}
        {pieChartData.length > 0 && (
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-3 text-gray-300">Exercise Distribution by Tags</h4>
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
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
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
                    formatter={(value, name) => [`${value} exercises`, name]}
                  />
                  <Legend wrapperStyle={{ color: '#ccc' }} />
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
                <th className="py-2 px-4 text-right">Duration</th>
                <th className="py-2 px-4 text-right">Intensity</th>
                <th className="py-2 px-4 text-left">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {exerciseData.map((exercise, index) => (
                <tr key={index} className="hover:bg-zinc-700">
                  <td className="py-2 px-4">{exercise.name}</td>
                  <td className="py-2 px-4 text-right">{exercise.sets}</td>
                  <td className="py-2 px-4 text-right">{exercise.reps.toFixed(1)}</td>
                  <td className="py-2 px-4 text-right">{exercise.duration}s</td>
                  <td className="py-2 px-4 text-right">{exercise.intensity}</td>
                  <td className="py-2 px-4">
                    <div className="flex flex-wrap gap-1">
                      {exercise.tags.map((tag, i) => (
                        <span key={i} className="bg-zinc-600 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
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