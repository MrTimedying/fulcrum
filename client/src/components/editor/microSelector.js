import React from 'react';
import { useEditorContext } from './editorContext';

export const MicroSelector = ({microSelection}) => {
  
 
  const { selectedPhase, selectedMicro, PhaseData} = useEditorContext();


  // Create an array using Array.from outside the return statement
  const microElements = Array.from({ length: PhaseData.weeksnumber }, (_, index) => (
    <div key={index}>
      <input
        type="radio"
        className="custom-radio"
        name={`phase-${selectedPhase}-week`}
        value={index}
        checked={selectedMicro === index}
        onChange={microSelection}
        // Add your onChange event handler here if needed
      />
      Week {index + 1}
    </div>
  ));

  return (
    <>{microElements}</> // Render the array of elements here
  );
};

