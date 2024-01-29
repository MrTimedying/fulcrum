import React, { useEffect, useCallback} from "react";
import PhasesForm from "./phasesEditor.js";
import { InterventionEditor } from "./interventionEditor.js";
import { Viewer } from "./viewer.js";
import { MicroEditor } from "./microEditor.js";
/* import MicroMiddleware from "./microMiddleware.ts"; */
import { WodEditor } from "./wodEditor.js";
import * as R from 'ramda';
import { addWeeks, addDays, set } from 'date-fns';
/* import Timer from "./time.ts"; */
import { CompilerFunction, SplicerFunction, deleteIntervention } from "./utils.js";
import { CalendarParser } from "../calendar/utils";
import { useEditorContext } from './editorContext';
import { MicroSelector } from "./microSelector.js";



function Editor({ patientID, setEvents }) {

  const { 
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
    
    
 } = useEditorContext();


  const calculatePhaseEndDate = useCallback((begin_date, number_weeks) => {
    let accumulatedValue = 0;

    const accumulatedArray = number_weeks.map((element) => {
      accumulatedValue += element;
      return accumulatedValue;
    });

    const endDate = R.map(
      (weeks) => addWeeks(begin_date, weeks),
      accumulatedArray
    );

    return endDate;
  }, []);

  const calculateMicroEndDate = useCallback((begin_date, number_weeks) => {
    let accumulatedValue = number_weeks;
    let dateArray = []

    for(let i = 0; i <= accumulatedValue; i++) {
      dateArray.push(addWeeks(begin_date,i))
    }   
    return dateArray;   
  }, []);

  function getDatesFromPattern(beginDate, patternArray) {
    const result = [];
    let currentDate = beginDate;
  
    patternArray.forEach((value) => {
      currentDate = addDays(currentDate, 1); 
  
      if (value === 1) {
        result.push(currentDate); 
      }
    });
  
    return result;
  }

  const Patternizer = useCallback((start_date, patternArray) => {
    let begin_date = start_date;
    let date_results = [];
  
    for (let j = 0; j < Object.keys(middleware.microValues).length; j++) {
      const microValuesJ = middleware.microValues[j];
      
      if (microValuesJ && typeof microValuesJ === 'object') {
        for (let i = 0; i < Object.keys(microValuesJ).length; i++) {
          date_results.push(getDatesFromPattern(begin_date, patternArray));
          begin_date = addWeeks(begin_date, 1);
        }
      }
    }
  
    console.log(date_results);
    return date_results;
  }, [middleware.microValues]);
  



  // Second part of the Editor functions, handling the CRUD for mesophases.
  const createPhase = () => {
    if (timer){
      if (Math.floor(timer.calculateMonths) > numPhases){
        setPhase([
          ...phase,
          { id: phase.length, label: `Phase ${phase.length + 1}` },
        ]);    
        setNumPhases(numPhases + 1);
        timer.setPhaseCounter(timer.phaseCounter + 1);
      }
      else {
        console.log("You can't create more phases for the intervention duration you've set!")
      }
    }
  };


  const deletePhase = () => {
    setPhase([]);
    setSelectedPhase(null);
  
    console.log('timer.weeksCounter:', timer.weeksCounter);
    console.log('timer.mirror_weeks_counter:', timer.mirror_weeks_counter);
  
    if (timer.weeksCounter === 0) { //Potentially this part of the code is useless too. Explaination is in devlog 048 
      const totalWeeksNumber = R.pipe(
        R.values,
        R.map(R.pipe(JSON.parse, R.prop('weeksnumber'))),
        R.sum
      )(PhaseValues);
  
      timer.setWeeksCounter(totalWeeksNumber);
      timer.setMirrorWeeksCounter(0);
      
      setMiddleware(prevState => ({
        ...prevState,
        microValues: [],
        wodValues: []
      }))

      console.log('Total weeks number at the first if:', totalWeeksNumber);
    } else if (timer.mirror_weeks_counter !== null && timer.mirror_weeks_counter !== undefined) {
  
      timer.setWeeksCounter(timer.weeksCounter + timer.mirror_weeks_counter);
      timer.setMirrorWeeksCounter(0);
      /* console.log('Total weeks number at the second if:', totalWeeksNumber); */
    }
  
    timer.setPhaseCounter(0);
    setNumPhases(0);
    setPhaseValues(() => []);
  };
  
  
// Let's try this async fake trigger
  useEffect(() => {
    // This effect will run when the component mounts and when splicerFunctionCalled changes
    if (splicerFunctionCalled) {
      const selectedIndex = 0;
      phaseSelection({ target: { value: selectedIndex } });

      
      microSelection({ target: { value: selectedIndex } });

      // Reset the state variable after the effect runs
      setSplicerFunctionCalled(false);
      
    }
    // eslint-disable-next-line 
  }, [splicerFunctionCalled]);

  
// Selection handlers
  const phaseSelection = (e) => {
    const selectedPhaseIndex = Number(e.target.value);

    setSelectedPhase(selectedPhaseIndex);

    if (PhaseValues[selectedPhaseIndex]) {
      setPhaseData(JSON.parse(PhaseValues[selectedPhaseIndex])); //Not only you update your own cache based on selected indexing
    } else {
      setPhaseData([]);
    }
    console.log(selectedPhaseIndex);
    console.log(PhaseValues);
    console.log(PhaseData);
  };

  const microSelection = (e) => {
    const selectedMicroIndex = Number(e.target.value);
    
  
    setMiddleware(prevState => {
      const updatedState = { ...prevState, 
        microData: prevState.microValues[selectedPhase]?.[selectedMicroIndex]
          ? prevState.microValues[selectedPhase][selectedMicroIndex]
          : [],
        selectedMicro: selectedMicroIndex || 0,
      } 
      return updatedState;
    });

    console.log('Hi! Ive been called by the microSelection function!');
  };

  const wodSelection = (e) => {
    const selectedWodIndex = Number(e.target.value);
  
    setMiddleware(prevState => {
      const updatedWodData = prevState.wodValues[selectedPhase]?.[prevState.selectedMicro]?.[selectedWodIndex] || {};
      console.log(updatedWodData);
      return {
        ...prevState,
        selectedWod: selectedWodIndex,
        wodData: updatedWodData  // Assign the nested object directly to wodData
      };
    });
  };

  useEffect(() => {
    const selectedMicroIndex = middleware.microSelection;
    const selectedWodIndex = middleware.wodSelection;
    
    setMiddleware(prevState => { // You also update your own first lower tier cache based on its own selection, which is unchanged
      const updatedState = { ...prevState, 
        microData: prevState.microValues[selectedPhase]?.[selectedMicroIndex]
          ? prevState.microValues[selectedPhase][selectedMicroIndex]
          : [],
        selectedMicro: selectedMicroIndex
      } 
      return updatedState;
    });

    setMiddleware(prevState => { // You also update a tier lower cache too 
      const updatedWodData = prevState.wodValues[selectedPhase]?.[prevState.selectedMicro]?.[selectedWodIndex] || {};
      const adjustdWodData = R.prop('wodValues', updatedWodData);;
      return {
        ...prevState,
        selectedWod: selectedWodIndex,
        wodData: adjustdWodData  
      };
    });
    // eslint-disable-next-line 
  }, [selectedPhase, middleware.microSelection, middleware.wodSelection]);

  useEffect(() => { 
    const selectedWodIndex = middleware.wodSelection;   

    setMiddleware(prevState => { // You also update a tier lower cache too 
      const updatedWodData = prevState.wodValues[selectedPhase]?.[prevState.selectedMicro]?.[selectedWodIndex] || {};
      const adjustdWodData = R.prop('wodValues', updatedWodData);;
      return {
        ...prevState,
        selectedWod: selectedWodIndex,
        wodData: adjustdWodData  
      };
    });
    // eslint-disable-next-line 
  }, [middleware.selectedMicro, middleware.wodSelection, selectedPhase]);
  
  


  useEffect(() => {
    // Listeners for the Phase Dates
    const updatedPhaseWeeks = R.values(PhaseValues).map((value) => {
      const parsedValue = JSON.parse(value);
      return parsedValue.weeksnumber;
    });
    const overall_weeks = timer.weeksCounter + timer.mirror_weeks_counter;

    setTime_Pipeline((prevtime_pipeline) => ({
      ...prevtime_pipeline,
      phase_weeks_array: updatedPhaseWeeks,
    }));

    setTime_Pipeline((prevtime_pipeline) => ({
      ...prevtime_pipeline,
      phase_date_array: calculatePhaseEndDate(timer.begin, updatedPhaseWeeks),
    }));

    setTime_Pipeline((prevtime_pipeline) => ({
      ...prevtime_pipeline,
      micro_date_array: calculateMicroEndDate(timer.begin, overall_weeks),
    }));

    if (middleware.microPattern) {
      setTime_Pipeline((prevtime_pipeline) => ({
        ...prevtime_pipeline,
        wod_date_array: Patternizer(timer.begin, middleware.microPattern),
      }));
      console.log(middleware.microPattern);
      
    } else {
      console.log("No pattern selected");
    }

    
  }, [
    PhaseValues,
    timer.begin,
    setTime_Pipeline,
    calculatePhaseEndDate,
    calculateMicroEndDate,
    Patternizer,
    middleware.microPattern,
    timer.mirror_weeks_counter,
    timer.weeksCounter,
    middleware.microValues
  ]);




  useEffect(() => {

    if (!intervention_values || !PhaseValues || !middleware){
      return;
    }

    setEvents(() => CalendarParser(intervention_values, PhaseValues, middleware));


    /* let events = [];
    events = CalendarParser(intervention_values, PhaseValues, middleware);
    setEvents(...prevEvents => [...prevEvents, ...events]); */
    

  // eslint-disable-next-line  
  },[intervention_values, PhaseValues, middleware]);
  
  
  

  return (
    <div
      className="flex flex-row h-full w-full overflow-y-auto"
      style={{ backgroundColor: "#383838" }}
    >
      <div className="flex flex-col h-full w-2/3 overflow-y-auto">
        <div className="w-full p-6 rounded-lg shadow-lg">
          

          <InterventionEditor
            interventionStartDate={interventionStartDate}
            weeks={weeks}
            setInterventionStartDate={setInterventionStartDate}
            setWeeks={setWeeks}
            isAccepted={isAccepted}
            setIsAccepted={setIsAccepted}
            timer={timer}
            setTimer={setTimer}
            setViewIntervention={setViewIntervention}
            setInterventionValues={setInterventionValues}
          />
        </div>

        <div className="flex flex-col gap-4 w-192 mt-4 rounded-lg shadow-lg">
          <div className="flex flex-row">
            <div
              id="phasesSelector"
              className="flex flex-col flex-initial w-1/2"
            >
              <h2 className="text-lg h-16 text-slate-200 col-span-1 row-span-1 font-semibold mb-2">
                Phases (or Mesocycles)
              </h2>
              <div className="h-16 col-span-1 row-span-1">
                <button
                  id="createPhase"
                  className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2"
                  disabled={!timer}
                  onClick={createPhase}
                >
                  Create
                </button>

                <button
                  id="deletePhase"
                  className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2"
                  onClick={deletePhase}
                  disabled={phase === null}
                >
                  Delete Phases
                </button>
              </div>
              <div
                id="phase_editor"
                className="col-span-1 row-span-1 w-96 h-80 p-4 overflow-y-auto"
              >
                <div>
                  {phase.map((phase, index) => (
                    <div key={phase.id}>
                      <input
                        type="radio"
                        name="phase"
                        value={index}
                        checked={selectedPhase === index}
                        onChange={phaseSelection}
                      />
                      {phase.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              id="PhasesForm"
              className="grid grid-cols-1 grid-rows-3 flex-initial w-1/2"
            >
              <div
                id="phase_editor_additional"
                className="col-span-1 row-span-3 w-96 h-full p-4 overflow-y-auto flex-grow"
              >
                {selectedPhase !== null && (
                  <PhasesForm
                    selectedPhase={selectedPhase}
                    PhaseValues={PhaseValues} // Pass the selectedPhase
                    setPhaseValues={setPhaseValues}
                    selectedValues={PhaseData}
                    setPhaseData={setPhaseData}
                    timer={timer}
                    setTimer={setTimer}
                    setViewPhase={setViewPhase}

                    /* phaseIndex={phaseIndex} */
                    // Pass the setPhaseValues function
                  />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row">
            <div
              id="micro_selector"
              className="flex-initial w-1/2 col-span-1 row-span-1 w-96 h-80 p-4 overflow-y-auto"
            >
              {PhaseValues !== null && (
                <div>
                  {Array.from({ length: PhaseData.weeksnumber }, (_, index) => (
                    <MicroSelector
                      index={index}
                      selectedPhase={selectedPhase}
                      middleware={middleware}
                      microSelection={microSelection} />
                  ))}
                </div>
              )}
            </div>
            
              <MicroEditor
                middleware={middleware}
                setMiddleware={setMiddleware}
                setViewMicro={setViewMicro}
                selectedPhase={selectedPhase}
                time_pipeline={time_pipeline}
              />
            
          </div>
          <div className="flex flex-row">
            <div
              id="wod_selector"
              className="flex-initial w-1/2 col-span-1 row-span-1 w-96 h-80 p-4 overflow-y-auto"
            >
              {middleware.microData &&
                middleware.microData.wods !== undefined &&
                middleware.microValues !== null && (
                  <div>
                    {Array.from(
                      { length: middleware.microData.wods },
                      (_, index) => (
                        <div key={index}>
                          <input
                            type="radio"
                            name={`Micro-${middleware.selectedMicro}-week`}
                            value={index}
                            checked={middleware.selectedWod === index}
                            onChange={wodSelection}
                            // Add your onChange event handler here if needed
                          />
                          Workout number {index + 1}
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
            
              <WodEditor
                middleware={middleware}
                setMiddleware={setMiddleware}
                setViewWod={setViewWod}
                selectedPhase={selectedPhase}
                
              />
            
          </div>
          <div className="w-96 p-6 rounded-lg shadow-lg">
            <button className="bg-gray-900 hover:bg-black text-white font-bold py-1 px-2 rounded" onClick={() => CompilerFunction(intervention_values, PhaseValues, middleware.microValues, middleware.wodValues, time_pipeline, patientID, setInterventionValues, setPhaseValues, setPhaseData, setSplicerFunctionCalled, setMiddleware, setTimer, setViewIntervention, setViewMicro, setViewPhase, setViewWod, setNumPhases, setPhase)}>Save intervention</button>
            <button className="bg-gray-900 hover:bg-black text-white font-bold py-1 px-2 rounded" onClick={() => deleteIntervention(patientID)}>Delete intervention</button>
            <button className="bg-gray-900 hover:bg-black text-white font-bold py-1 px-2 rounded" onClick={() => SplicerFunction( patientID, setInterventionValues, setPhaseValues, setPhaseData, setSplicerFunctionCalled, setMiddleware, setTimer, setViewIntervention, setViewMicro, setViewPhase, setViewWod, setNumPhases, setPhase)}>Load Intervention</button>            
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full overflow-y-auto">
        <h3 className="text-lg h-16 col-span-1 row-span-1 font-semibold mb-2">
          Editor Viewer
        </h3>
        <Viewer 
          viewIntervention={viewIntervention} 
          viewPhase={viewPhase} 
          viewMicro={viewMicro}
          viewWod={viewWod}/>
      </div>
    </div>
  );
}

export default React.memo(Editor);
