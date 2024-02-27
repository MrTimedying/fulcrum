import React from 'react';

function DayView({ selectedEvent }) {
  // Parse the exercises JSON string into an object
  const exercises = selectedEvent && selectedEvent.exercises ? JSON.parse(selectedEvent.exercises) : null;

  return (
    <div className="font-mono text-slate-300 text-sm bg-zinc-900 h-full p-2">
      <h1>Day View</h1>
      {selectedEvent && (
        <div>
          <h2>Selected Event: {selectedEvent.title}</h2>
          {exercises && (
            <ul>
              {Object.entries(exercises).map(([key, exercise]) => (
                <li key={key}>
                  {exercise.name} - {exercise.type} - {exercise.volume} sets of {exercise.repetitions} reps at {exercise.intensity}%
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

DayView.title = (date) => `Day View: ${date.toLocaleDateString()}`;

export default DayView;
