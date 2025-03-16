import React, { createContext, useContext, useState, useCallback } from 'react';
import { addWeeks, parseISO } from 'date-fns';
import * as R from "ramda";



const EditorContext = createContext();

export const useEditorContext = () => {
  return useContext(EditorContext);
};

export const EditorContextProvider = ({ children }) => {
  

  // Timer memory

  const [ timer, setTimer ] = useState({
    start: new Date(2024, 1, 1),
    end: new Date(2024,1,1),
    weeks: 0,
    weeksCounter: 0, // A max needs to be set in the consuming logic
    phaseCounter: 0, // A max needs to be set in the consuming logic
    minWeeks: 4,
    mirror_weeks_counter: 0
  });
  
  // General editor memory

  const [phase, setPhase] = useState([]);
  const [splicerFunctionCalled, setSplicerFunctionCalled] = useState(false);
  const [intervention_values, setInterventionValues] = useState({});
  const [interventionStartDate, setInterventionStartDate] = useState(null);
  const [weeks, setWeeks] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false); 
  /* const [timer, setTimer] = useState(new Timer()); */
  const [numPhases, setNumPhases] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [PhaseValues, setPhaseValues] = useState([]); 
  const [PhaseData, setPhaseData] = useState([]); 
  /* const [middleware, setMiddleware] = useState(new MicroMiddleware()); */
  const [microValues, setMicroValues] = useState([]);
  const [microData, setMicroData] = useState([]);
  const [selectedMicro, setSelectedMicro] = useState(0);
  const [microPattern, setMicroPattern] = useState([]);
  const [wodValues, setWodValues] = useState([]);
  const [wodData, setWodData] = useState([]);
  const [selectedWod, setSelectedWod] = useState(0);
  const [exerciseValues, setExerciseValues] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState([]);
  const [tableString, setTableString] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastIsOpen, setToastIsOpen] = useState(false);
  const [toastPayload, setToastPayload] = useState({});

  // Viewer memory options

  const [viewIntervention, setViewIntervention] = useState();
  const [viewPhase, setViewPhase] = useState();
  const [viewMicro, setViewMicro] = useState();
  const [viewWod, setViewWod] = useState();

  // Timing state variables

  const [time_pipeline, setTime_Pipeline] = useState({
    phase_weeks_array: [],
    phase_date_array: [],
    micro_date_array: [],
    wod_date_array: [],
  });

  // Calendar memory options

  const [events, setEvents] = useState([]);

  // Helper functions for the Time memory

  function calculateEndDate(begin, weeks) {
    if (begin && weeks) {
      return addWeeks(begin, weeks);
    }
    return null;
  }
  
  function weeksHandler(previousWeeks, weeksCounter, phaseCounter, minWeeks) {
    if (previousWeeks === 0 || isNaN(previousWeeks)) {
      if (weeksCounter !== 0 && phaseCounter !== 0) {
        let maxWeeks = weeksCounter - minWeeks * (phaseCounter - 1);
        return maxWeeks;
      } else {
        return weeksCounter;
      }
    } else {
      if (weeksCounter !== 0 && phaseCounter !== 0) {
        let maxWeeks = (previousWeeks + weeksCounter) - minWeeks * (phaseCounter - 1);
        return maxWeeks;
      } else {
        return (previousWeeks + weeksCounter);
      }
    }
  }

  const calculatePhaseEndDate = useCallback((begin_date, number_weeks) => {
    // Parse the ISO string to a Date object
    const parsedBeginDate = parseISO(begin_date);
  
    let accumulatedValue = 0;
  
    const accumulatedArray = number_weeks.map((element) => {
      accumulatedValue += element;
      return accumulatedValue;
    });
  
    // Calculate the end dates using addWeeks
    const endDate = R.map(
      (weeks) => {
        const endDate = addWeeks(parsedBeginDate, weeks);
        // Convert the end date back to ISO string format
        return endDate.toISOString();
      },
      accumulatedArray
    );
  
    return endDate;
  }, []);
  

  return (
    <EditorContext.Provider value={{ 
        phase, setPhase,
        intervention_values, setInterventionValues,
        interventionStartDate, setInterventionStartDate,
        weeks, setWeeks,
        isAccepted, setIsAccepted,
        timer, setTimer,
        numPhases, setNumPhases,
        selectedPhase, setSelectedPhase,
        PhaseValues, setPhaseValues,
        PhaseData, setPhaseData,
        viewIntervention, setViewIntervention,
        viewPhase, setViewPhase,
        viewMicro, setViewMicro,
        viewWod, setViewWod,
        time_pipeline, setTime_Pipeline,
        splicerFunctionCalled, setSplicerFunctionCalled,
        microValues, setMicroValues,
        microData, setMicroData,
        selectedMicro, setSelectedMicro,
        microPattern, setMicroPattern,
        wodValues, setWodValues,
        wodData, setWodData,
        selectedWod, setSelectedWod,
        tableString, setTableString,
        isOpen, setIsOpen,
        isLoading, setIsLoading,
        toastIsOpen, setToastIsOpen,
        toastPayload, setToastPayload,
        exerciseValues, setExerciseValues,
        exerciseData, setExerciseData,
        selectedExercise, setSelectedExercise,
        events,setEvents,
        calculateEndDate,
        weeksHandler,
        calculatePhaseEndDate        
     }}>
      {children}
    </EditorContext.Provider>
  );
};
