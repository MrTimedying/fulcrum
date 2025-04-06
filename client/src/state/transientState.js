import { create } from 'zustand';
import * as R from 'ramda';
import { DateObject, getAllDatesInRange } from 'react-multi-date-picker';

const useTransientStore = create(
  (set) => ({
    // Store state
    patientID: "",
    interventions: [],
    phases: [],
    micros: [],
    wods: [],
    toaster: {
      type: "",
      message: "",
      show: false,
    },
    data: [],
    columns: [],



    // Setter for patientID
    setPatientID: (id) => set((state) => ({ patientID: id })),

    // --- Interventions ---
    updateIntervention: (newData) =>
      set((state) => {
        const existingIndex = state.interventions.findIndex(
          (intervention) => intervention.interventionID === newData.interventionID
        );

        if (existingIndex !== -1) {
          const updatedInterventions = [...state.interventions];
          updatedInterventions[existingIndex] = newData;
          return { interventions: updatedInterventions };
        } else {
          return { interventions: [...state.interventions, newData] };
        }
      }),
    deleteIntervention: (interventionID) =>
      set((state) => ({
        interventions: state.interventions.filter(
          (intervention) => intervention.interventionID !== interventionID
        ),
      })),

    // --- Phases ---
    updatePhase: (newData) =>
      set((state) => {
        const existingIndex = state.phases.findIndex(
          (phase) => phase.phaseID === newData.phaseID
        );

        if (existingIndex !== -1) {
          const updatedPhases = [...state.phases];
          updatedPhases[existingIndex] = newData;
          return { phases: updatedPhases };
        } else {
          return { phases: [...state.phases, newData] };
        }
      }),
    deletePhase: (phaseID) =>
      set((state) => ({
        phases: state.phases.filter((phase) => phase.phaseID !== phaseID),
      })),

    // --- Micros ---
    updateMicro: (newData) =>
      set((state) => {
        const existingIndex = state.micros.findIndex(
          (micro) => micro.microID === newData.microID
        );

        if (existingIndex !== -1) {
          const updatedMicros = [...state.micros];
          updatedMicros[existingIndex] = newData;
          return { micros: updatedMicros };
        } else {
          return { micros: [...state.micros, newData] };
        }
      }),
    deleteMicro: (microID) =>
      set((state) => ({
        micros: state.micros.filter((micro) => micro.microID !== microID),
      })),

    // --- Wods ---
    updateWod: (newData) =>
      set((state) => {
        const existingIndex = state.wods.findIndex(
          (wod) => wod.wodID === newData.wodID
        );

        if (existingIndex !== -1) {
          const updatedWods = [...state.wods];
          updatedWods[existingIndex] = newData;
          return { wods: updatedWods };
        } else {
          return { wods: [...state.wods, newData] };
        }
      }),
    deleteWod: (wodID) =>
      set((state) => ({
        wods: state.wods.filter((wod) => wod.wodID !== wodID),
      })),

      // --- GRID ---
    
    setData: (data) => set((state) => ({data})),
    setColumns: (newColumns) =>
      set((state) => ({
        ...state, // ensure the rest of the state is preserved
        columns: newColumns,
      })),
    



    

    // Toaster setter
    setToaster: ({ type, message, show }) =>
      set((state) => ({
        toaster: { ...state.toaster, type, message, show },
      })),
  }),
  { name: "transient-store" }
);

export default useTransientStore;
