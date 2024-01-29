import axios from "axios";
import * as R from 'ramda';

const api = axios.create({
    baseURL: "http://localhost:8080",
  });



export const interventionFetcher = async (patientID) => {
    try {
        const response = await api.get("/api/patientsIntervention", { params: { ID: patientID } });

        if (response.status === 200) {
            console.log("Successfully loaded intervention data into the calendar", patientID);
            if (response.data && response.data[0] && response.data[0].Intervention){
                const { Intervention } = response.data[0];
                return JSON.parse(Intervention);
            } else {
                return response.data;
            }
            
        } else {
            console.error("There was an error loading intervention data", patientID, response);
        }

    } catch (error) {
        console.error("There was an error in getting data from the backend", patientID, error);
        throw error; // Re-throw the error for further handling or catching
    }
};  
  

export const CalendarParser = (intervention_values, PhaseValues, middleware) => {

    let final_output = [];
    let unidentified_output = [];

    let intervention_initial = R.clone(intervention_values);
    let phase_values_initial = R.clone(PhaseValues);
    let micro_values_initial = R.clone(middleware.microValues);
    let wod_values_initial = R.clone(middleware.wodValues);

    const renameKey = (obj, oldKey, newKey) => {
        if (!obj || !oldKey || !newKey) {
            return obj;
        }
        if (obj.hasOwnProperty(oldKey)) {
            const { [oldKey]: omittedKey, ...rest } = obj;
            return {
                ...rest,
                [newKey]: obj[oldKey],
            };
        }
        return obj;
    };
    
    let intervention_parsed = R.pipe(
        (obj)=>renameKey(obj, "startDate", "start"),
        (obj)=>renameKey(obj, "endDate", "end"),
        (obj)=>renameKey(obj, "interventionName", "title"),
        /* (obj) => [obj] */
    )(intervention_initial);

    intervention_parsed = [intervention_parsed];

    const phase_values_parsed = R.pipe(
        R.values,
        R.map(value => JSON.parse(value)),
        R.map(value => renameKey(value,"phasename", "title"))
    )(phase_values_initial);

    const micro_values_parsed = R.pipe(
        R.values,
        R.chain(R.values),
        R.map(value => renameKey(value,"startDate", "start")),
        R.map(value => renameKey(value,"endDate", "end")),
        R.mapObjIndexed((value,index)=>({...value, title: `MicroCycle ${index}`})),
        R.values
    )(micro_values_initial);

    const wod_values_parsed = R.pipe(
        R.values,
        R.chain(R.values), // Flattens one level of nesting
        R.chain(R.values),
        R.map(value => renameKey(value, "day_date", "start")),
        R.map(value => ({ ...value, end: value['start'] })),
        R.mapObjIndexed((value, index) => ({ ...value, title: `Wod ${index}` })),
        R.values
      )(wod_values_initial);

    unidentified_output = R.concat(intervention_parsed, phase_values_parsed);
    unidentified_output = R.concat(unidentified_output, micro_values_parsed);
    unidentified_output = R.concat(unidentified_output, wod_values_parsed);

    final_output = R.pipe(
        R.mapObjIndexed((value,index)=>({...value, id: index})),
        R.values
    )(unidentified_output);
    
    console.log("This is intervention parsed",intervention_parsed);
    console.log("This is phaseValues parsed",phase_values_parsed);
    console.log("This is microValues parsed",micro_values_parsed);
    console.log("This is wodValues parsed",wod_values_parsed);
    console.log(final_output);

    return final_output;

};
  

