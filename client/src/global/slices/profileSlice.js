import { createSlice } from '@reduxjs/toolkit';

export const profileSlice = createSlice({
  name: 'profile',
  initialState: [],
  reducers:{
    newProfile: (state, action) => {
      state.push(action.payload);
    },
    editProfile: (state,action) => {
      const index = state.findIndex(profile => profile.id === action.payload.id);
      if(index !== -1) {
        state[index] = {...state[index], ...action.payload};
      }
    },
    deleteProfile: (state, action) => {
      return state.filter(profile => profile.id !== action.payload.id)
    },
  }
});

// Action creators are generated for each case reducer function
export const { newProfile, editProfile, deleteProfile } = profileSlice.actions;

export default profileSlice.reducer;
