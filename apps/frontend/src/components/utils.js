import { v4 as uuidv4 } from 'uuid';

function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
}

// Export all functions as named exports
export { 
  debounce,
};
