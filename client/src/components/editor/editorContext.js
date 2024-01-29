import React, { createContext, useContext, useState } from 'react';
import Timer from "./time.ts";
import MicroMiddleware from "./microMiddleware.ts";


const EditorContext = createContext();

export const useEditorContext = () => {
  return useContext(EditorContext);
};

export const EditorContextProvider = ({ children }) => {
  const [phase, setPhase] = useState([]);
  const [splicerFunctionCalled, setSplicerFunctionCalled] = useState(false);
  
  
  const [intervention_values, setInterventionValues] = useState({});
  const [interventionStartDate, setInterventionStartDate] = useState(null);
  const [weeks, setWeeks] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false); 
  const [timer, setTimer] = useState(new Timer());
  const [numPhases, setNumPhases] = useState(0);

  const [selectedPhase, setSelectedPhase] = useState(null);
  const [PhaseValues, setPhaseValues] = useState([]); // This one stores the data for all the phases, in an array
  const [PhaseData, setPhaseData] = useState([]); // This one is the extracted value of a single form of a phase which is passed back as a prop for loading purposes

  // Here I'm trying the middleware route
  const [middleware, setMiddleware] = useState(new MicroMiddleware());

  // State variables for the Viewer. This could be handled by a class.
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
        middleware, setMiddleware,
        viewIntervention, setViewIntervention,
        viewPhase, setViewPhase,
        viewMicro, setViewMicro,
        viewWod, setViewWod,
        time_pipeline, setTime_Pipeline,
        splicerFunctionCalled, setSplicerFunctionCalled,
        
        
     }}>
      {children}
    </EditorContext.Provider>
  );
};
