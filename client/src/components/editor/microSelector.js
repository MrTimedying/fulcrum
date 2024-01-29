import React, { useEffect, useState } from 'react';

export const MicroSelector = ({ index, selectedPhase, middleware, microSelection }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Update isChecked when middleware.selectedMicro changes
    setIsChecked(
      middleware.selectedMicro === undefined || middleware.selectedMicro === null
        ? index === 2
        : middleware.selectedMicro === index
    );
  }, [middleware.selectedMicro, index]);

  return (
    <div key={index}>
      <input
        type="radio"
        name={`phase-${selectedPhase}-week`}
        value={index}
        checked={isChecked}
        onChange={microSelection}
        // Add your onChange event handler here if needed
      />
      Week {index + 1}
    </div>
  );
};
