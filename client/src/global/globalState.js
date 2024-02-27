import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { HYDRATE } from './actions';
 

const store = configureStore({
  reducer: rootReducer,
});

console.log('Checking electronAPI availability:', window.electronAPI);
if (window.electronAPI && typeof window.electronAPI.requestState === 'function') {
  console.log('electronAPI is available, requesting state...');
  window.electronAPI.requestState().then((loadedState) => {
    console.log('Loaded state:', loadedState);
    store.dispatch({ type: HYDRATE, payload: loadedState });
  }).catch((error) => {
    console.error("Failed to load the state", error);
  });
} else { 
  console.log("Running outside of Electron or electronAPI not available, using default state");
}



export default store;
