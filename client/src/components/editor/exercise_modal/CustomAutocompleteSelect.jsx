
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from "uuid";

const CustomAutocompleteSelect = ({ options, onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const containerRef = useRef(null);

  // Theme colors (Tailwind CSS classes will be preferred where possible)
  const colors = {
    primary: 'indigo-600',       // A nice primary color
    secondary: 'indigo-200',     // A lighter shade for focus/hover
    background: 'gray-50',       // Light background for the page
    cardBackground: 'white',     // Card background
    textPrimary: 'gray-800',     // Primary text color
    textSecondary: 'gray-500',   // Secondary text color
    border: 'gray-300',          // Border color
    focusRing: 'indigo-500',     // Focus ring color
  };

  useEffect(() => {
    // Filter options based on input value
    if (inputValue) {
      setFilteredOptions(
        options.filter(option =>
          option.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, options]);

  useEffect(() => {
    // Handle clicks outside to close the dropdown
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    setIsDropdownVisible(true); // Show dropdown when typing
  };

  const handleOptionClick = (option) => {
    
    const optionNewId = {...option, id: uuidv4()};

    if (onSelect) {
      onSelect(optionNewId);
    }
    // Clear input and hide dropdown
    setInputValue('');
    setIsDropdownVisible(false);
    setFilteredOptions(options); // Reset filtered options
  };

  const handleInputFocus = () => {
    setIsDropdownVisible(true);
  };

  // Basic styling using Tailwind CSS classes
  return (
    <div className={`flex items-center justify-center bg-\${colors.background}`}>
      <div ref={containerRef} className={`relative w-full max-w-xs p-6 rounded-2xl shadow-lg bg-\${colors.cardBackground}`}>
        <label htmlFor="autocomplete-input" className={`block text-sm font-medium mb-2 text-\${colors.textPrimary}`}>
          Select an Option
        </label>
        <input
          id="autocomplete-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Type to search..."
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
          className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none border border-\${colors.border} focus:ring-2 focus:ring-\${colors.focusRing} transition-all duration-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-indigo-700`}
        />

        {isDropdownVisible && filteredOptions.length > 0 && (
          <ul
            id="autocomplete-list"
            role="listbox"
            className={`absolute z-10 w-full mt-2 bg-\${colors.cardBackground} border border-\${colors.border} rounded-xl shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600`}
          >
            {filteredOptions.map((option, index) => (
             <div key={option.id} className="bg-black flex flex-row justify-between"> 
             <li
                key={index}
                role="option"
                aria-selected={inputValue.toLowerCase() === option.name.toLowerCase()} // Basic aria-selected
                onClick={() => handleOptionClick(option)}
                className={`px-4 py-3 cursor-pointer text-sm text-\${colors.textPrimary} hover:bg-\${colors.secondary} transition-colors duration-150 dark:text-white dark:hover:bg-gray-600`}
              >
                {option.name}
              </li>
              <button className='p-1'>x</button></div>
            ))}
          </ul>
        )}

        {isDropdownVisible && filteredOptions.length === 0 && inputValue && (
           <div className={`absolute z-10 w-full mt-2 px-4 py-3 text-sm text-\${colors.textSecondary} bg-\${colors.cardBackground} border border-\${colors.border} rounded-xl shadow-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400`}>
              No results found for "{inputValue}"
           </div>
        )}
      </div>
    </div>
  );
};

export default CustomAutocompleteSelect;

