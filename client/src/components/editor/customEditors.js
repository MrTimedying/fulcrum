
import 'react-tabulator/lib/styles.css';
import 'react-tabulator/css/tabulator.min.css';

// Convert milliseconds to hh:mm:ss.ssss format
const formatDuration = (ms) => {
console.log('Formatting duration input:', ms, typeof ms); // <-- Add this log
  if (!ms && ms !== 0) return '';
  // Check if ms is actually a number before proceeding
  if (typeof ms !== 'number' || isNaN(ms)) {
      console.error("formatDuration received invalid input:", ms);
      return 'Invalid Duration'; // Or return '00:00:00.000' or ''
  }
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const fracSeconds = Math.round(ms % 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(fracSeconds).padStart(3, '0')}`;
};

export { formatDuration };

// Convert hh:mm:ss.ssss to milliseconds
const parseDuration = (str) => {
  if (!str) return 0;
  const regex = /^(?:[0-1]\d|2[0-3]):[0-5]\d:[0-5]\d\.(\d{1,4})$/;
  if (!regex.test(str)) return 0;
  const [hours, minutes, seconds, frac] = str.split(/[:.]/).map(Number);
  return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + (frac / Math.pow(10, frac.toString().length - 3));
};

// Custom editor for duration input
const durationEditor = (cell, onRendered, success, cancel, editorParams) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.style.width = '100%';
  input.style.boxSizing = 'border-box';
  
  // Display formatted value (from milliseconds)
  input.value = formatDuration(cell.getValue());
  
  input.addEventListener('blur', () => {
    const value = input.value.trim();
    const regex = /^(?:[0-1]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{1,4}$/;
    if (regex.test(value)) {
      success(parseDuration(value)); // Convert to milliseconds and save
    } else {
      cancel();
    }
  });
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') input.blur();
  });
  
  onRendered(() => input.focus());
  return input;
};

export { durationEditor };