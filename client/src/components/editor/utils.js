/* This is my utils.js file. I will periodically try to move here all the logic pertaining the editor that is clogghing up the components */
import * as R from "ramda";
import axios from "axios";
import { interventionFetcher } from "../calendar/utils";
import Timer from "./time.ts";
import MicroMiddleware from "./microMiddleware.ts";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

export const CompilerFunction = (
  intervention_values,
  phase_values,
  micro_values,
  wod_values,
  time_pipeline,
  patientID,
  setInterventionValues,
  setPhaseValues,
  setPhaseData,
  setSplicerFunctionCalled,
  setMiddleware,
  setTimer,
  setViewIntervention,
  setViewPhase,
  setViewMicro,
  setViewWod,
  setNumPhases,
  setPhase, 
) => {
  let time_aggregated = time_pipeline;
  let micro_aggregated = R.clone(micro_values);
  let wod_aggregated = R.clone(wod_values);
  let intervention_aggregated = R.clone(intervention_values);
  let phase_values_adjusted = /* R.clone(phase_values); */ Object.values(phase_values).map(JSON.parse);
  



  const imprinter = R.addIndex(R.map)((obj, outerIndex) => {
    if (!obj || typeof obj !== 'object') {
      return {}; // Return an empty object if the input is not valid
    }
  
    return R.mapObjIndexed((innerObj) => {
      if (typeof innerObj === 'object' && innerObj !== null) {
        return { ...innerObj, phase_ID: `${outerIndex}` }; // Add ID to inner objects
      }
      return innerObj;
    }, obj);
  });

  const farImprinter = R.mapObjIndexed((phaseValue, phaseKey) => {
    if (R.is(Object, phaseValue)) {
      return R.mapObjIndexed((microValue, microKey) => {
        if (R.is(Object,microValue )) {
          return R.mapObjIndexed((wodValue) => {
            if (R.is(Object, wodValue)) {
              return R.mergeRight(wodValue, {
                micro_ID: `${microKey}`,
                phase_ID: `${phaseKey}`
              });
            } else {
              // For non-object values, return an empty object
              return {};
            }
          }, microValue);
        } else {
          // For non-object values, return an empty object
          return {};
        }
      }, phaseValue);
    } else {
      // For non-object values, return an empty object
      return {};
    }
  });
  
  

  const addDates = (objects, dates) => {
    if (!Array.isArray(objects) || !Array.isArray(dates)) {
      return []; // Return an empty array if objects or dates are not arrays
    }
  
    return objects.map((obj, index) => {
      const startDate = dates[index] || null;
      const endDate = dates[index + 1] || null;
  
      return {
        ...(obj || {}), // Ensure obj is an object or default to an empty object
        startDate,
        endDate
      };
    });
  };

  const addDays = (objects, dates) => {
    if (!Array.isArray(objects) || !Array.isArray(dates)) {
      return []; // Return an empty array if objects or dates are not arrays
    }
  
    return objects.map((obj, index) => {
      const day_date = dates[index] || null;
      
  
      return {
        ...(obj || {}), // Ensure obj is an object or default to an empty object
        day_date
      };
    });
  };

  const pairObjectsWithDates = (objects, start, endDates) => {
    return objects.map((obj, index) => {
      const startDate = index === 0 ? new Date(start).toISOString() : endDates[index - 1];
      const endDate = endDates[index];
      
      return {
        ...obj,
        start: startDate,
        end: endDate,
      };
    });
  };

  phase_values_adjusted = pairObjectsWithDates(phase_values_adjusted, intervention_values.startDate, time_aggregated.phase_date_array);

  console.log(phase_values_adjusted);

  function aggregateWodToMicro(base_array, array_to_nest, string_name) {
    return R.clone(base_array).map((single_object, index) => {
      const base_object_ID = index.toString();
      const matching_objects = array_to_nest.filter(obj => obj.micro_ID === base_object_ID);
  
      if (matching_objects.length > 0) {
        const dynamicKey = `${string_name} list`;
        single_object[dynamicKey] = {};
  
        matching_objects.forEach((wod, wodIndex) => {
          const dynamicWodKey = `${string_name}_${wodIndex}`;
          single_object[`${string_name} list`][dynamicWodKey] = wod;
        });
      }
  
      return single_object;
    });
  }
  

  function aggregateMicroToPhases(base_array, array_to_nest, string_name) {
    return R.clone(base_array).map((single_object, index) => {
      const base_object_ID = index.toString();
      const matching_objects = array_to_nest.filter(obj => obj.phase_ID === base_object_ID);
  
      if (matching_objects.length > 0) {
        const dynamicKey = `${string_name} list`;
        single_object[dynamicKey] = {};
  
        matching_objects.forEach((wod, wodIndex) => {
          const dynamicWodKey = `${string_name}_${wodIndex}`;
          single_object[`${string_name} list`][dynamicWodKey] = wod;
        });
      }
  
      return single_object;
    });
  };
  
  
  const flattened_micro_aggregated = R.pipe(
    R.values,
    imprinter,
    R.map(R.values),
    R.flatten,
    (result) => addDates(result, time_aggregated.micro_date_array)
  )(micro_aggregated);
  
  const flattened_wod_aggregated = R.pipe(
    farImprinter,
    R.values,
    R.chain(R.values),     
    R.map(R.values),
    R.flatten,
    (result) => addDays(result, R.flatten(time_aggregated.wod_date_array))
  )(wod_aggregated);

  const micro = "micro";
  const wod = "wod";

  
  const aggregatedMicroWod = aggregateWodToMicro(flattened_micro_aggregated, flattened_wod_aggregated, wod);
  console.log("After aggregation:", aggregatedMicroWod);
  const aggregatedPhaseMicro = aggregateMicroToPhases(phase_values_adjusted, aggregatedMicroWod, micro);
  console.log("AggregatedPhaseMicro:", aggregatedPhaseMicro);

  intervention_aggregated = R.addIndex(R.reduce)((acc, phase, index) => {
    const key = `Phase Number ${index + 1}`;
    return R.assoc(key, phase, acc);
  }, intervention_values, aggregatedPhaseMicro);

  //Transofrming the start date to ISOstring

  const startDate_ISO = new Date(intervention_aggregated.startDate).toISOString();
  
  intervention_aggregated.startDate = startDate_ISO; 
  const intervention_string = JSON.stringify(intervention_aggregated);
    
  const postData = {intervention: intervention_string, ID: patientID};

  console.log("postData", postData);
  console.log("patientID", patientID);
  
  const handlePost = async () => {
    try {
      const response = await api.post("/api/patientsIntervention", postData);

      if (response.status === 201) {
        console.log("Successfully posted patients intervention for patientID: ", patientID);
      } else {
        console.error("Error posting patients intervention for patientID: ", patientID, response);
      }
    }  catch (error) {
      console.error("Error posting patients intervention for patientID: ", patientID, error);
    }
  };
  
  handlePost();

/* console.log("intervention_aggregated", intervention_aggregated);
console.log("flattened wod aggregated", flattened_wod_aggregated);
console.log("micro_aggregated", micro_aggregated); */

SplicerFunction( patientID, setInterventionValues, setPhaseValues, setPhaseData, setSplicerFunctionCalled, setMiddleware, setTimer, setViewIntervention, setViewMicro, setViewPhase, setViewWod, setNumPhases, setPhase, intervention_aggregated);

};

export const deleteIntervention = (patientID) => {

  console.log(patientID);

  const handlePatch = async () => {
    try {
      const response = await api.patch("/api/patientsIntervention", {ID: patientID});

      if (response.status === 201) {
        console.log("Successfully deleted partient intervention: ", patientID);
      } else {
        console.error("Error in deleting the intervention ", patientID, response);
      }
    }  catch (error) {
      console.error("There was an error in deleting the intervention ", patientID, error);
    }
  };

  handlePatch();
  
};


export const SplicerFunction = async (
  patientID,
  setInterventionValues,
  setPhaseValues,
  setPhaseData,
  setSplicerFunctionCalled,
  setMiddleware,
  setTimer,
  setViewIntervention,
  setViewPhase,
  setViewMicro,
  setViewWod,
  setNumPhases,
  setPhase,
  postData
  ) => {

    let primitive_data;

    if (postData === undefined || postData === null) {
      primitive_data = await interventionFetcher(patientID);
      
    } else {
      primitive_data = postData;
      
    };

  // Creating Intervention Values first

  const checkKeyForWord = (obj, word) => {
    const keys = R.keys(obj);
    return keys.some(key => key.includes(word));
  };

  const unnestObject = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const nestedEntries = Object.entries(value);
        nestedEntries.forEach(([nestedKey, nestedValue]) => {
          acc[nestedKey] = nestedValue;
        });
      }
      return acc;
    }, {});
  };

  const intervention_values_fetched = (data) => {
    const hasPhaseNumberKey = checkKeyForWord(data, 'Phase Number');
    
    if (hasPhaseNumberKey) {
      const updatedData = R.omit(R.filter(key => key.includes('Phase Number'), R.keys(data)), data);
      return updatedData;
    } else {
      return data;
    }
  };
  
  const updatedInterventionValues = intervention_values_fetched(primitive_data);
 

  const replaceKeyAtIndex = (index, newKey, obj) => {
    const keys = R.keys(obj);
    if (index >= 0 && index < keys.length) {
      const keyToReplace = keys[index];
      const valueToReplace = obj[keyToReplace];
      const newObj = R.dissoc(keyToReplace, obj); 
      return R.assoc(newKey, valueToReplace, newObj); 
    }
    return R.clone(obj); 
  };

  const negativeOmit = (obj,word) => {
    const filteredKeys = R.filter(key => !key.includes(word), R.keys(obj));
    return R.omit(filteredKeys, obj);
  };

  const deleteEmptyReferences = (data) => {
    const cleanedData = R.reject(val => R.isEmpty(val) || R.isNil(val), data);
    return cleanedData;
  };
  

  const genericSheller = (data,string) => {
    let updatedData = negativeOmit(data, string);
    const keys = R.keys(updatedData);
    
    for (let i = 0; i < keys.length; i++) {
      updatedData = replaceKeyAtIndex(i, String(i),updatedData);
    }

    return updatedData;

  };

  const keyRemover = (obj, keyToRemove) => {
    const removeKey = (data) => {
      if (typeof data === 'object' && data !== null) {
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (typeof data[key] === 'object') {
              removeKey(data[key]);
            }
            if (key === keyToRemove) {
              delete data[key];
            }
          }
        }
      }
    };
  
    const processedData = JSON.parse(JSON.stringify(obj));
    removeKey(processedData);
    return processedData;
  };
  

  const rebuilderFunction = (data) => {

    let phase_values_fetched = R.clone(data);
    let micro_values_fetched = R.clone(data);
    let wod_values_fetched = R.clone(data);

    phase_values_fetched = R.pipe(
      (obj) => R.omit(R.filter(key => key.includes('Phase Number'), R.keys(obj)), obj),
      R.map((value) => R.omit(R.filter(key => key.includes('micro'), R.keys(value)), value)),
      R.map((value) => JSON.stringify(value))
      )(phase_values_fetched); //Check

    micro_values_fetched = R.pipe(
      R.map(value => checkKeyForWord(value, 'micro') ? unnestObject(value) : value),
      R.mapObjIndexed((value) => genericSheller(value, 'micro')),
      (obj) => deleteEmptyReferences(obj),
      (obj) => keyRemover(obj,'wod list'))
      (micro_values_fetched);

    wod_values_fetched = R.pipe(
      R.map(value => checkKeyForWord(value, 'micro') ? unnestObject(value) : value),
      R.map(R.map(value => checkKeyForWord(value, 'wod') ? unnestObject(value) : value)),
      R.mapObjIndexed((value) => genericSheller(value, 'micro')),
      R.mapObjIndexed(R.mapObjIndexed((value) => genericSheller(value, 'wod'))),
      (obj) => deleteEmptyReferences(obj),
      (obj) => keyRemover(obj,'wod list'))
      (wod_values_fetched);

    return { "shelledPhaseValues": phase_values_fetched, "shelledMicroValues": micro_values_fetched, "shelledWodValues": wod_values_fetched};

  }

  const shelledInterventionValues = genericSheller(primitive_data, "Phase");

  const { shelledPhaseValues, shelledMicroValues, shelledWodValues } = rebuilderFunction(shelledInterventionValues);
  
  const shelledPhaseData = shelledPhaseValues['0']; //Here I'm defaulting the caches that needs to be loaded back too if I want to see something in the actual editor
  const shelledMicroData = shelledMicroValues['0']['0'];
  const shelledWodData = shelledWodValues['0']['0']['0'];

  setViewIntervention(updatedInterventionValues);
  setViewPhase(shelledPhaseData);
  setViewMicro(shelledMicroData);
  setViewWod(shelledWodData);

  /* setTimer(new Timer(new Date(updatedInterventionValues.startDate), updatedInterventionValues.weeks)); */
  setInterventionValues(updatedInterventionValues);
  setPhaseValues(shelledPhaseValues);
  setPhaseData(shelledPhaseData);
  
  function createMicroMiddlewareWithValues(microValues, microData, wodValues, wodData) {
    const defaultInstance = new MicroMiddleware();
    return R.pipe(
      R.assoc('microValues', microValues),
      R.assoc('microData', microData),
      R.assoc('wodValues', wodValues),
      R.assoc('wodData', wodData),
    )(defaultInstance);
  }
  
  const newMicroMiddleware = createMicroMiddlewareWithValues(shelledMicroValues, shelledMicroData, shelledWodValues, shelledWodData);
  setMiddleware(newMicroMiddleware);
  

  // Additional shenanigans for the Phase

  const TimerCountersUpdater = () => {
    const phases = Object.keys(shelledPhaseValues).length;
    return phases;
  };
  
  const phaseCounter = TimerCountersUpdater();

  function createTimerWithValues(date, weeks, phases) {
    const defaultInstance = new Timer(new Date(date), weeks);
    return R.pipe(
      R.assoc('startDate', date),
      R.assoc('weeks', weeks),
      R.assoc('phaseCounter', phases),
    )(defaultInstance);
  };

  const newTimer = createTimerWithValues(updatedInterventionValues.startDate, updatedInterventionValues.weeks, phaseCounter);
  setNumPhases(phaseCounter);
  setTimer(newTimer);

  function createPhaseArray(counter) {
    let phase_array = [];
    for (let i = 0; i < counter; i++) {
      phase_array.push({ id: i, label: `Phase ${i + 1}` });
    }
    return phase_array;
  }

  const final_phase_array = createPhaseArray(phaseCounter);
  setPhase(final_phase_array);
  setSplicerFunctionCalled(true);


};



  // Once SplicerFunction is resolved, get the values you need
  
  
  




