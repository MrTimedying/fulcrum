import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from "uuid";
import { getExerciseContainerDisplayName } from '../../../utils/exerciseUtils';
import { FiSearch, FiTrash2 } from 'react-icons/fi';

const CustomAutocompleteSelect = ({ options, onSelect, onDelete, compact = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (inputValue) {
      setFilteredOptions(
        options.filter(option =>
          option.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    } else {
      setFilteredOptions([]);
    }
  }, [inputValue, options]);

  useEffect(() => {
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
    setIsDropdownVisible(true);
  };

  const handleOptionClick = (option) => {
    const optionNewId = { ...option, id: uuidv4() };
    optionNewId.name = getExerciseContainerDisplayName(option.name);

    if (onSelect) {
      onSelect(optionNewId);
    }
    setInputValue('');
    setIsDropdownVisible(false);
  };

  const handleDeleteOption = (e, option) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(option.name);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <FiSearch className="h-3 w-3 text-zinc-500" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownVisible(true)}
          placeholder="Search templates..."
          className="w-full pl-8 pr-2 py-1.5 bg-zinc-800/40 border border-zinc-800 rounded text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/30 transition-all"
        />
      </div>

      {isDropdownVisible && (inputValue || filteredOptions.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <ul id="autocomplete-list" role="listbox">
              {filteredOptions.map((option, index) => (
                <div 
                  key={option.id} 
                  className="bg-zinc-900 hover:bg-zinc-800 transition-colors duration-150 flex flex-row justify-between border-b border-zinc-800 last:border-0"
                > 
                  <li
                    role="option"
                    aria-selected={inputValue.toLowerCase() === option.name.toLowerCase()}
                    onClick={() => handleOptionClick(option)}
                    className="flex flex-auto flex-col px-4 py-3 cursor-pointer text-sm text-zinc-200"
                  >
                    <p className='text-zinc-400 font-thin text-lg'>@{getExerciseContainerDisplayName(option.name)}</p>
                    <p className='text-zinc-400 text-xs'>Fields:</p>
                    <ul className="flex flex-wrap">
                      {option.fields.map((field) => (
                        <li className='text-zinc-200 text-xs ml-4 border border-zinc-400 rounded-md p-1 m-1 w-fit' key={field.id}>
                          {field.label}
                        </li>
                      ))}
                    </ul>
                  </li>
                  <button 
                    className='flex w-8 text-[10px] h-6 mt-4 mr-2 px-1 items-center justify-center border border-zinc-500 text-zinc-400 hover:text-red-400 hover:border-red-400 rounded transition-colors'
                    onClick={(e) => handleDeleteOption(e, option)}
                  >
                    del
                  </button>
                </div>
              ))}
            </ul>
          ) : inputValue ? (
            <div className="px-4 py-3 text-sm text-zinc-500">
              No results found for "{inputValue}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CustomAutocompleteSelect;
