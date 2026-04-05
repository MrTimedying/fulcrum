import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tauriAPI } from '../utils/tauri-api';

const usePersistentStore = create(
  persist(
    (set) => ({
      patients: {},
      interventions: {},
      tests: {},
      profiles: {},
      items: {},
      exercises: {},

      addIntervention: (patientID, interventionID, interventionDetails) => {
        set((state) => ({
          interventions: {
            ...state.interventions,
            [interventionID]: { ...interventionDetails },
          },
          patients: {
            ...state.patients,
            [patientID]: [...(state.patients[patientID] || []), interventionID], // Append instead of overwrite
          },
        }));
      },

      removeIntervention: (interventionID) => {
        set((state) => {
          const { [interventionID]: _, ...updatedInterventions } = state.interventions;
          return { interventions: updatedInterventions };
        });
      },

      addPatient: (patientId, patientDetails) => {
        set((state) => ({
          patients: { 
            ...state.patients, 
            [patientId]: { ...state.patients[patientId], ...patientDetails } 
          },
        }));
      },      

      removePatient: (patientId) => {
        set((state) => {
          const { [patientId]: _, ...updatedPatients } = state.patients;
          return { patients: updatedPatients };
        });
      },

      addProfile: (patientID, profileID, profileDetails) => {
        set((state) => ({
          profiles: { ...state.profiles, [profileID]: { ...profileDetails } },
          patients: {
            ...state.patients,
            [patientID]: [...(state.patients[patientID] || []), profileID],
          },
        }));
      },

      removeProfile: (profileID) => {
        set((state) => {
          const { [profileID]: _, ...updatedProfiles } = state.profiles;
          return { profiles: updatedProfiles };
        });
      },

      addExercise: (exerciseID, exerciseDetails) => {
        set((state) => ({
          exercises: { ...state.exercises, [exerciseID]: { ...exerciseDetails } },
        }));
      },

      removeExercise: (exerciseID) => {
        set((state) => {
          const { [exerciseID]: _, ...updatedExercises } = state.exercises;
          return { exercises: updatedExercises };
        });
      },

      addItem: (itemID, itemDetails) => {
        set((state) => ({
          items: { ...state.items, [itemID]: { ...itemDetails } },
        }));
      },

      removeItem: (itemID) => {
        set((state) => {
          const { [itemID]: _, ...updatedItems } = state.items;
          return { items: updatedItems };
        });
      },

      addTest: (testID, testDetails) => {
        set((state) => ({
          tests: { ...state.tests, [testID]: { ...testDetails } },
        }));
      },

      removeTest: (testID) => {
        set((state) => {
          const { [testID]: _, ...updatedTests } = state.tests;
          return { tests: updatedTests };
        });
      },

      hydrateState: (loadedState) => {
        console.log('Hydrating Zustand store with Tauri state:', loadedState);
        set(loadedState);
      },
    }),
    { name: "persistent-store" }
  )
);

async function tryLoadStateFromTauri() {
  try {
    console.log('Checking tauriAPI availability:', !!tauriAPI);
    if (tauriAPI && typeof tauriAPI.state.request === 'function') {
      console.log('Requesting state from Tauri...');
      const state = await tauriAPI.state.request();
      console.log('Received state from Tauri:', state);
      return state;
    } else {
      console.log('TauriAPI not available or requestState method not found');
      return null;
    }
  } catch (error) {
    console.error('Error requesting state from Tauri:', error);
    return null;
  }
}

// Initialize state loading with Tauri API
console.log('Checking tauriAPI availability:', !!tauriAPI);
tryLoadStateFromTauri()
  .then((loadedState) => {
    if (loadedState && Object.keys(loadedState).length > 0) {
      console.log('Loaded state:', loadedState);
      usePersistentStore.getState().hydrateState(loadedState);
    } else {
      console.log("No state loaded from Tauri, using default state");
    }
  })
  .catch((error) => {
    console.error("Failed to load the state from Tauri", error);
    console.log("Using default state");
  });

export default usePersistentStore;

