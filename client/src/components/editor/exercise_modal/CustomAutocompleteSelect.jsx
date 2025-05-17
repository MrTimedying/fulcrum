
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from "uuid";

const CustomAutocompleteSelect = ({ options, onSelect, onDelete }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const containerRef = useRef(null);

  // Theme colors (Tailwind CSS classes will be preferred where possible)
  const colors = {
    primary: 'indigo-600',       // A nice primary color
    secondary: 'indigo-200',     // A lighter shade for focus/hover
    background: 'neutral-900',       // Light background for the page
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

  const handleDeleteOption = (option) => {
    if (onDelete) {
      onDelete(option.name);
    }
  }

  // Basic styling using Tailwind CSS classes
  return (
    <div className={`flex items-start w-1/3 flex-1 justify-start bg-\${colors.background}`}>
      <div ref={containerRef} className={`relative w-full max-w-xs p-6 rounded-2xl bg-\${colors.cardBackground}`}>
        <label htmlFor="autocomplete-input" className={`block text-sm font-medium mb-2 text-\${colors.textPrimary}`}>
          Exercise templates
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
          className={`w-full px-4 py-1 rounded-xl text-sm focus:outline-none border border-\${colors.border} focus:ring-1 focus:ring-\${colors.focusRing} transition-all duration-200 dark:bg-neutral-700 dark:text-white dark:border-neutral-600 dark:focus:ring-zinc-700`}
        />

        {isDropdownVisible && filteredOptions.length > 0 && (
          <ul
            id="autocomplete-list"
            role="listbox"
            className={`absolute z-10 w-full mt-2 bg-\${colors.cardBackground} border border-\${colors.border} rounded-xl shadow-lg max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600`}
          >
            {filteredOptions.map((option, index) => (
             <div key={option.id} className="bg-zinc-900 hover:bg-\${colors.secondary} dark:text-white dark:hover:bg-neutral-700 transition-colors duration-150 flex flex-row justify-between"> 
             <li
                key={index}
                role="option"
                aria-selected={inputValue.toLowerCase() === option.name.toLowerCase()} // Basic aria-selected
                onClick={() => handleOptionClick(option)}
                className={`flex flex-auto flex-col px-4 py-3 cursor-pointer text-sm text-\${colors.textPrimary}   `}
              >
                <p className='text-zinc-400 font-thin text-lg'>@{option.name}</p>
                <p className='text-zinc-400 text-xs'>Fields:</p>
                <ul>
                {option.fields.map((field) => (
                  <li className='text-zinc-200 text-xs ml-4 border border-zinc-400 rounded-md p-1 m-1 w-fit' key={field.id}>{field.label}</li>
                ))}
                </ul>
              </li>
              <button className='flex w-8 text-xs h-4 mt-3 mr-2 px-2 items-center border-solid border border-neutral-400 rounded-md'
              onClick={() => handleDeleteOption(option)}
              >del</button></div>
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

