import React, { useState, useEffect, useRef } from 'react';
import { FiEdit3 } from "react-icons/fi";

export function InlineEdit({ value, onSave, inputClassName, displayClassName }) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef(null);
  
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);
  
    useEffect(() => {
      setCurrentValue(value);
    }, [value]);
  
    const handleSave = () => {
      if (currentValue.trim() === "") {
        setCurrentValue(value);
        setIsEditing(false);
      } else if (currentValue !== value) {
        onSave(currentValue);
        setIsEditing(false);
      } else {
        setIsEditing(false);
      }
    };
  
    const handleCancel = () => {
      setCurrentValue(value);
      setIsEditing(false);
    };
  
    const handleKeyDown = (event) => {
      if (event.key === "Enter") handleSave();
      else if (event.key === "Escape") handleCancel();
    };
  
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave} // Save on blur
            onKeyDown={handleKeyDown}
            className={`p-1 border border-blue-400 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputClassName}`}
          />
        </div>
      );
    }
  
    return (
      <span
        onClick={() => setIsEditing(true)}
        className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded inline-flex items-center gap-1 group ${displayClassName}`}
        title="Click to edit"
      >
        {value}
        <FiEdit3
          size={12}
          className="opacity-0 group-hover:opacity-50 transition-opacity"
        />
      </span>
    );
  }