import {createSlice } from "@reduxjs/toolkit";


export const itemSlice = createSlice({
    name: 'item',
    initialState: [],
    reducers:{
        addItem: (state, action) =>{
            state.push(action.payload);
        },
        editItem: (state,action) =>{
            const index = state.findIndex(item => item.name === action.payload.name );

            if(index !== -1){
                state[index]= {...state[index], ...action.payload}
            }
        },
        deleteItem: (state,action) => {
            return state.filter(item => item.name !== action.payload.name);
        }
    }
});


export const {addItem, editItem, deleteItem} = itemSlice.actions;

export default itemSlice.reducer;