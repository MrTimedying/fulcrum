import { createSlice } from '@reduxjs/toolkit';


export const interventionSlice = createSlice({
  name: 'intervention',
  initialState: {},
  reducers:{
    addIntervention: {
        reducer: (state, action) => {
            const { patientId, interventionDetails } = action.payload;
            if (!state[patientId]) {
              state[patientId] = [];
            }
            state[patientId].push(interventionDetails);
          },
        prepare: (patientId, interventionDetails) =>{
          return {
              payload: {patientId, interventionDetails}
          }
      }
    },
    cancelIntervention: (state,action) => {
        const { patientId, interventionName} = action.payload;
        if (state[patientId]) {
            state[patientId] = state[patientId].filter(intervention => intervention[intervention].interventionName !== interventionName);
        }
    }
  }
});

// Action creators are generated for each case reducer function
export const { addIntervention, cancelIntervention} = interventionSlice.actions;

export default interventionSlice.reducer;
