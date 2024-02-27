import React from 'react';

const CustomEvent = ({ event }) => {
  let content;

  // Determine the content based on event properties
  if (event.interventionName !== undefined) {
    content = (
      <div>
        <div>Intervention: {event.interventionName}</div>
      </div>
    );
  } else if (event.phasename !== undefined) {
    content = (
      <div> 
        <div>Phase: {event.phasename}</div>
      </div>
    );
  } else if (event.phaseID !== undefined && event.microID !== undefined && event.wodID === undefined) {
    content = (
      <div>
        <div>Microcycle</div>
      </div>
    );
  } else if (event.phaseID !== undefined && event.microID !== undefined && event.wodID !== undefined) {
    content = (
      <div>
        <div>Workout of the Day</div>
      </div>
    );
  } else {
    content = (
      <div>
        <strong>{event.title}</strong>
      </div>
    );
  }

  return (
    <div className="custom-event text-xs font-mono text-slate-800">
      {content}
    </div>
  );
};

export default CustomEvent;
