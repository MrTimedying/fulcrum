import React, { useState, useEffect, useRef } from 'react';

const MultiListBox = ({ options, value, onChange, size = 5 }) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listboxRef = useRef(null);

  // Determine the actual height based on the size prop and option height
  // Assuming a standard line height/padding for options, adjust as needed
  const optionHeight = 30; // Estimated height per option including padding
  const calculatedHeight = size * optionHeight;

  const handleOptionClick = (optionValue) => {
    // For single selection, just set the value
    onChange(optionValue);
  };

  // Basic styling using Tailwind classes
  // Container for the listbox
  const containerClasses = `
    border border-zinc-600 rounded-lg bg-zinc-800 text-gray-300
    overflow-y-auto focus:outline-none
  `;

  // Styling for individual options
  const optionClasses = (isSelected, isHighlighted) => `
    px-3 py-1 cursor-pointer text-sm
    ${isSelected ? 'bg-zinc-500 text-white' : 'hover:bg-zinc-700'}
    ${isHighlighted ? 'bg-zinc-500 outline outline-1 outline-blue-500' : ''}
  `;

  // Add keyboard navigation and accessibility later

  return (
    <div
      ref={listboxRef}
      className={containerClasses}
      style={{ maxHeight: `${calculatedHeight}px` }}
      tabIndex={0} // Make the div focusable for keyboard events
      role="listbox"
      aria-multiselectable="false" // Changed to false for single selection
      aria-labelledby="bulk-edit-fields-label" // assuming the label has this ID
    >
      {options.length > 0 ? (
        options.map((option, index) => (
          <div
            key={option} // Assuming options are unique strings
            className={optionClasses(value === option, highlightedIndex === index)} // Check value === option for selection
            onClick={() => handleOptionClick(option)}
            role="option"
            aria-selected={value === option} // Check value === option for aria-selected
            data-value={option} // Custom attribute to easily get value if needed
          >
            {option}
          </div>
        ))
      ) : (
        <div className="px-3 py-1 text-sm text-gray-400">
          No options available.
        </div>
      )}
    </div>
  );
};

export default MultiListBox; 