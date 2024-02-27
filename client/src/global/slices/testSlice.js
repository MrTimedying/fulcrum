import {createSlice } from "@reduxjs/toolkit";


export const testSlice = createSlice({
    name: 'test',
    initialState: [],
    reducers:{
        addTest: (state, action) =>{
            state.push(action.payload);
        },
        editTest: (state,action) =>{
            const index = state.findIndex(item => item.name === action.payload.name );

            if(index !== -1){
                state[index]= {...state[index], ...action.payload}
            }
        },
        deleteTest: (state,action) => {
            return state.filter(item => item.name !== action.payload.name);
        }
    }
});


export const {addTest, editTest, deleteTest} = testSlice.actions;

export default testSlice.reducer;