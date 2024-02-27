import { combineReducers } from '@reduxjs/toolkit';
import interventionReducer from './slices/interventionSlice';
import patientReducer from './slices/patientSlice';
import profileReducer from './slices/profileSlice';
import testReducer from './slices/testSlice';
import exerciseReducer from './slices/exercisesSlice';
import itemReducer from './slices/itemsSlice';
import { HYDRATE } from './actions';


const appReducer = combineReducers({
    patients: patientReducer,
    profiles: profileReducer,
    intervention: interventionReducer,
    test: testReducer,
    exercise: exerciseReducer,
    item: itemReducer,
});

const rootReducer = (state,action) => {
    if(action.type === HYDRATE) {
        return {...state, ...action.payload};
    }
    return appReducer(state,action);
}

export default rootReducer;
