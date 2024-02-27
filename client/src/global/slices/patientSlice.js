import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export const patientSlice = createSlice({
  name: 'patients',
  initialState: [],
  reducers: {
    newPatient: {
      reducer: (state, action) => {
        // The action.payload now includes the id generated in prepare
        state.push(action.payload);
      },
      prepare: (patientData) => {
        // Generate a unique ID for the new patient
        const id = uuidv4();
        return { payload: { id, ...patientData } };
      }
    },
    editPatient: (state, action) => {
      const index = state.findIndex(patient => patient.id === action.payload.id);
      if (index !== -1) { // Make sure this checks for -1, not 1
        state[index] = { ...state[index], ...action.payload };
      }
    },
    deletePatient: (state, action) => {
      return state.filter(patient => patient.id !== action.payload.id);
    },
  }
});

// Correct the export to use patientSlice, not counterSlice
export const { newPatient, editPatient, deletePatient } = patientSlice.actions;

export default patientSlice.reducer;

