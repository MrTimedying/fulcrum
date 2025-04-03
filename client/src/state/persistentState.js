import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        console.log('Hydrating Zustand store with Electron state:', loadedState);
        set(loadedState);
      },
    }),
    { name: "persistent-store" }
  )
);

console.log('Checking electronAPI availability:', window.electronAPI);
if (window.electronAPI && typeof window.electronAPI.requestState === 'function') {
  console.log('electronAPI is available, requesting state...');
  window.electronAPI.requestState()
    .then((loadedState) => {
      console.log('Loaded state:', loadedState);
      persistentStore.getState().hydrateState(loadedState); // ✅ Correct Zustand hydration
    })
    .catch((error) => {
      console.error("Failed to load the state", error);
    });
} else {
  console.log("Running outside of Electron or electronAPI not available, using default state");
}

export default usePersistentStore;

