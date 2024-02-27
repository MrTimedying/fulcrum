/* This is my utils.js file. I will periodically try to move here all the logic pertaining the editor that is clogghing up the components */
import * as R from "ramda";
import { addIntervention } from "../../global/slices/interventionSlice";




export const CompilerFunction = (
  intervention_values,
  phase_values,
  micro_values,
  wod_values,
  time_pipeline,
  patientID,
  dispatch
) => {
  let time_aggregated = time_pipeline;
  let micro_aggregated = R.clone(micro_values);
  let wod_aggregated = R.clone(wod_values);
  let intervention_aggregated = R.clone(intervention_values);
  let phase_values_adjusted = R.clone(phase_values);
  


  const pairObjectsWithDates = (objects, start, endDates) => {
    console.log("this is the start date", start);
    return objects.map((obj, index) => {
      const startDate = index === 0 ? start : endDates[index - 1];
      const endDate = endDates[index];
      
      return {
        ...obj,
        start: startDate,
        end: endDate,
      };
    });
  };

  const pairWodsWithDates = (objects, dateArray) => {
    const flatWodDate = R.flatten(dateArray);
    return objects.map((wod, index) => {
      const startDate = flatWodDate[index];
      const endDate = flatWodDate[index];

      return {
        ...wod,
        start: startDate,
        end: endDate
      }

    });
  };

  phase_values_adjusted = pairObjectsWithDates(phase_values_adjusted, intervention_values.start, time_aggregated.phase_date_array);
  micro_aggregated = pairObjectsWithDates(micro_aggregated, intervention_values.start, time_aggregated.micro_date_array);
  wod_aggregated = pairWodsWithDates(wod_aggregated, time_aggregated.wod_date_array);

  const compound_Intervention = {
    intervention: intervention_aggregated,
    phases: phase_values_adjusted,
    micros: micro_aggregated,
    wods: wod_aggregated
  };


  
  

  dispatch(addIntervention(patientID, compound_Intervention));

  console.log("intervention_object", compound_Intervention);
  console.log("patientID", patientID);
  
  

};


export const SplicerFunction = async (
  patientID,
  setInterventionValues,
  setPhaseValues,
  setPhaseData,
  setMicroValues,
  setWodValues,
  setTimer,
  setViewIntervention,
  setViewPhase,
  setViewMicro,
  setViewWod,
  setNumPhases,
  setPhase,
  primitive_data
) => {
  // Fetch primitive_data

 console.log(primitive_data);

  // Check if primitive_data is not null or undefined
  if (primitive_data) {
    // Set Timer and other values
    setTimer((prevState) => ({
      ...prevState,
      start: primitive_data.intervention.start,
      end: primitive_data.intervention.end,
      weeks: primitive_data.intervention.weeks,
      weeksCounter: Math.max(0, 0), // A max needs to be set in the consuming logic
      phaseCounter: Math.max(0, 0), // A max needs to be set in the consuming logic
      minWeeks: 4,
      mirror_weeks_counter: Math.max(primitive_data.intervention.weeks, 0),
    }));
    
    setInterventionValues({ ...primitive_data.intervention });
    
    function createPhaseArray(array) {
      let count = array.length;
      let phase_array = [];
      for (let i = 0; i < count; i++) {
        phase_array.push({ id: i, label: `Phase ${i + 1}` });
      }
      return phase_array;
    }

    const final_phase_array = createPhaseArray(primitive_data.phases);
    setNumPhases(primitive_data.phases.length);
    setPhase(final_phase_array);

    setPhaseValues([...primitive_data.phases]);
    
    setMicroValues([...primitive_data.micros]);
    console.log(primitive_data.micros);
    setWodValues([...primitive_data.wods]);


    return true;
  } else {
    
    console.log("Error: primitive_data is null or undefined");
    
    return false;
  }
};




  
  
  




