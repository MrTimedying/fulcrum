import {createSlice } from "@reduxjs/toolkit";


export const exerciseSlice = createSlice({
    name: 'exercise',
    initialState: [],
    reducers:{
        addExercise: (state, action) =>{
            state.push(action);
        },
        editExercise: (state,action) =>{
            const index = state.findIndex(item => item.name === action.payload.name );

            if(index !== -1){
                state[index]= {...state[index], ...action.payload}
            }
        },
        deleteExercise: (state,action) => {
            return state.filter(item => item.name !== action.payload.name);
        }
    }
});


export const {addExercise, editExercise, deleteExercise} = exerciseSlice.actions;

export default exerciseSlice.reducer;