import { createSlice } from "@reduxjs/toolkit";

export const interventionSlice = createSlice({
  name: "intervention",
  initialState: {},
  reducers: {
    addIntervention: {
      reducer: (state, action) => {
        const { patientId, interventionDetails } = action.payload;
        if (!state[patientId]) {
          state[patientId] = [];
        }

        let isDuplicate = state[patientId].find(
          (intervention) =>
            intervention.intervention.interventionName ===
            interventionDetails.intervention.interventionName
        );

        if (isDuplicate) {
          let updatedIntervention = state[patientId].filter(
            (intervention) =>
              intervention.intervention.interventionName !==
              interventionDetails.intervention.interventionName
          );
          updatedIntervention.push(interventionDetails);
          return { ...state, [patientId]: updatedIntervention };
        } else if (!isDuplicate) {
          state[patientId].push(interventionDetails);
        }
      },
      prepare: (patientId, interventionDetails) => {
        return {
          payload: { patientId, interventionDetails },
        };
      },
    },
    cancelIntervention: (state, action) => {
      const { patientId, interventionName } = action.payload;
      if (state[patientId]) {
        state[patientId] = state[patientId].filter(
          (item) => item.intervention.interventionName !== interventionName
        );
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { addIntervention, cancelIntervention } =
  interventionSlice.actions;

export default interventionSlice.reducer;
