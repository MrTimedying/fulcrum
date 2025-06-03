import React, { useState, useEffect } from 'react';
import { Chip, TextField, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a dark theme for Material UI components to match our design
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Blue color
    },
    background: {
      default: '#27272a', // zinc-800
      paper: '#18181b', // zinc-900
    },
    text: {
      primary: '#e4e4e7', // zinc-200
      secondary: '#a1a1aa', // zinc-400
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#27272a', // zinc-800
            '& fieldset': {
              borderColor: '#52525b', // zinc-600
            },
            '&:hover fieldset': {
              borderColor: '#71717a', // zinc-500
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6', // blue-500
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#3f3f46', // zinc-700
          color: '#e4e4e7', // zinc-200
          '&:hover': {
            backgroundColor: '#52525b', // zinc-600
          },
          '& .MuiChip-deleteIcon': {
            color: '#a1a1aa', // zinc-400
            '&:hover': {
              color: '#e4e4e7', // zinc-200
            },
          },
        },
      },
    },
  },
});

// Utility functions for tag parsing
const parseTagsToArray = (tagString) => {
  if (!tagString || typeof tagString !== 'string') return [];
  
  // Split by semicolon and filter out empty strings
  return tagString
    .split(';')
    .map(tag => tag.trim())
    .filter(tag => tag && tag.startsWith('#'))
    .map(tag => tag.substring(1)); // Remove the # prefix for display
};

const formatArrayToTagString = (tagArray) => {
  if (!Array.isArray(tagArray) || tagArray.length === 0) return '';
  
  // Add # prefix and join with semicolons, then add trailing semicolon
  return tagArray.map(tag => `#${tag}`).join(';') + ';';
};

const TagInput = ({ value, onChange, placeholder, disabled = false }) => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // Parse initial value into tags array
  useEffect(() => {
    const parsedTags = parseTagsToArray(value);
    setTags(parsedTags);
  }, [value]);

  // Handle adding a new tag
  const handleAddTag = (newTag) => {
    const trimmedTag = newTag.trim().toLowerCase().replace(/[^a-z0-9]/g, ''); // Clean tag
    
    if (!trimmedTag) return;
    
    // Check if tag already exists
    if (tags.includes(trimmedTag)) {
      setInputValue('');
      return;
    }

    const updatedTags = [...tags, trimmedTag];
    setTags(updatedTags);
    setInputValue('');
    
    // Convert back to string format and call onChange
    const tagString = formatArrayToTagString(updatedTags);
    onChange(tagString);
  };

  // Handle removing a tag
  const handleDeleteTag = (tagToDelete) => {
    const updatedTags = tags.filter(tag => tag !== tagToDelete);
    setTags(updatedTags);
    
    // Convert back to string format and call onChange
    const tagString = formatArrayToTagString(updatedTags);
    onChange(tagString);
  };

  // Handle keyboard input
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ';' || event.key === ',') {
      event.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (event.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag if backspace is pressed on empty input
      handleDeleteTag(tags[tags.length - 1]);
    }
  };

  // Handle paste event to parse multiple tags
  const handlePaste = (event) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData('text');
    
    // Parse pasted data as tag string or comma-separated values
    let newTags = [];
    if (pasteData.includes('#') && pasteData.includes(';')) {
      // Parse as tag string format
      newTags = parseTagsToArray(pasteData);
    } else {
      // Parse as comma or space separated values
      newTags = pasteData
        .split(/[,\s;]+/)
        .map(tag => tag.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter(tag => tag && !tags.includes(tag));
    }
    
    if (newTags.length > 0) {
      const updatedTags = [...tags, ...newTags];
      setTags(updatedTags);
      
      const tagString = formatArrayToTagString(updatedTags);
      onChange(tagString);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box 
        sx={{ 
          border: '1px solid #52525b', // zinc-600
          borderRadius: '6px',
          backgroundColor: '#27272a', // zinc-800
          padding: '4px',
          minHeight: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          '&:focus-within': {
            borderColor: '#3b82f6', // blue-500
          }
        }}
      >
        {/* Tags Display */}
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
            {tags.map((tag, index) => (
              <Chip
                key={`${tag}-${index}`}
                label={`#${tag}`}
                onDelete={disabled ? undefined : () => handleDeleteTag(tag)}
                size="small"
                variant="filled"
                sx={{
                  height: '20px',
                  fontSize: '10px',
                  '& .MuiChip-label': {
                    padding: '0 4px',
                  },
                  '& .MuiChip-deleteIcon': {
                    fontSize: '12px',
                    width: '12px',
                    height: '12px',
                  }
                }}
              />
            ))}
          </Box>
        )}
        
        {/* Input Field */}
        <TextField
          variant="outlined"
          size="small"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={tags.length === 0 ? placeholder : "Add another tag..."}
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '10px',
              minHeight: '20px',
              '& input': {
                padding: '2px 4px',
                fontSize: '10px',
              },
              '& fieldset': {
                border: 'none',
              },
            },
          }}
        />
      </Box>
      
      {/* Help Text */}
      <Box sx={{ mt: 0.5 }}>
        <p className="text-xs text-gray-400">
          Type a tag and press Enter, semicolon, or comma to add. Use only letters and numbers.
        </p>
      </Box>
    </ThemeProvider>
  );
};

export default TagInput; 