import React, { useState, useEffect } from 'react';

// Component to handle inline editing
const EditableCell = ({
  initialValue,
  rowId,
  columnId,
  updateDataFunction,
  dataType = 'node',
  displayFormatter = (value) => String(value ?? ''),
  inputType = 'text',
  valueParser = (value) => value,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // State to hold the value currently in the input field
  const [editValue, setEditValue] = useState('');

  // Effect to reset editValue if the underlying initialValue changes externally
  // while not editing. This might be less common for inline edits.
  useEffect(() => {
      if (!isEditing) {
          // Optional: Sync editValue placeholder if needed, but focus is on editing cycle
      }
  }, [initialValue, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    try {
      const parsedValue = valueParser(editValue);
      const hasChanged = parsedValue !== initialValue;

      if (hasChanged) {
        // Adjust the update call based on dataType
        if (dataType === 'node') {
          // For node, we don't need rowId since it's always the selected node
          updateDataFunction(columnId, parsedValue);
        } else {
          // For exercise, use the original structure with rowId
          updateDataFunction(rowId, columnId, parsedValue);
        }
      } else {
        console.log(` No update triggered.`);
      }
    } catch (error) {
      console.error(`Error parsing input value for ${columnId}:`, error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
       event.target.blur();
    } else if (event.key === 'Escape') {
        // Don't parse or save, just exit edit mode
        setIsEditing(false);
    }
  };

  const handleDoubleClick = () => {
    // *** FIX: Set input value to the FORMATTED string for text inputs ***
    // Use the display formatter to get the user-friendly string ("1m 30s")
    // For number inputs, use the raw value.
    const valueForEditing = inputType === 'text' ? displayFormatter(initialValue) : initialValue;
    console.log(`[EditableCell DoubleClick] Column: ${columnId}, Initial: ${initialValue}, InputType: ${inputType}, Value for Editing: "${valueForEditing}"`);
    setEditValue(valueForEditing);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <input
        type={inputType}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full px-1 py-0.5 caret-white bg-zinc-700 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
        step={inputType === 'number' ? 'any' : undefined}
        // Optional: Add placeholder based on expected format for text inputs like duration
        placeholder={columnId === 'duration' ? 'e.g., 1m 30s' : ''}
      />
    );
  }

  // Display mode: Always format the raw initialValue from props
  return (
    <div onDoubleClick={handleDoubleClick} className="cursor-pointer min-h-[24px] py-0.5 px-1">
      {displayFormatter(initialValue)}
    </div>
  );
};

export default EditableCell;
