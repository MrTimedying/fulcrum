import React, { useEffect } from "react";
import PhasesForm from "./phasesEditor.js";
import { InterventionEditor } from "./interventionEditor.js";
import { Viewer } from "./viewer.js";
import { MicroEditor } from "./microEditor.js";
import { WodEditor } from "./wodEditor.js";
import * as R from 'ramda';
import { CompilerFunction, SplicerFunction } from "./utils.js";
import { useEditorContext } from './editorContext';
import { MicroSelector } from "./microSelector.js";
import "../../App.css";
import { InterventionLoad } from "./interventionLoad.js";
import { useDispatch, useSelector } from "react-redux";





function Editor({ patientID, isExpanded }) {

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
    microValues, setMicroValues,
    microData, setMicroData,
    selectedMicro, setSelectedMicro,
    setMicroPattern,
    wodValues, setWodValues,
    setWodData,
    selectedWod, setSelectedWod,
    viewIntervention, setViewIntervention,
    viewPhase, setViewPhase,
    viewMicro, setViewMicro,
    viewWod, setViewWod,
    setIsLoading,
    time_pipeline, 
    
    
 } = useEditorContext();

 
 const dispatch = useDispatch();
 const loadedData = useSelector(state => {
  const interventions = state.intervention[patientID];
  return interventions ? interventions[0] : undefined;
});

const CleanerFunction = () => {

  setPhase([]);
  setInterventionValues({});
  setInterventionStartDate(null);
  setWeeks(null);
  setIsAccepted(false);
  setNumPhases(0);
  setSelectedPhase(null);
  setPhaseValues([]);
  setPhaseData([]);
  setSelectedMicro(null);
  setMicroValues([]);
  setMicroData([]);
  setSelectedWod(null);
  setWodValues([]);
  setWodData([]);
  setMicroPattern([]);
  setViewIntervention();
  setViewPhase();
  setViewMicro();
  setViewWod();
  setTimer({
    start: new Date(2024, 1, 1),
    end: new Date(2024,1,1),
    weeks: 0,
    weeksCounter: Math.max(0,0), // A max needs to be set in the consuming logic
    phaseCounter: Math.max(0,0), // A max needs to be set in the consuming logic
    minWeeks: 4,
    mirror_weeks_counter: 0
  })

}

 useEffect(() => {
  const fetchData = async () => {
    try {
      const splicerCheck = await SplicerFunction(
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
        loadedData
      );

      if (splicerCheck === false) {
        // Reset state if SplicerFunction fails
        CleanerFunction();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  fetchData();
  // eslint-disable-next-line 
}, [patientID]);



 // Second part of the Editor functions, handling the CRUD for mesophases.
  const createPhase = () => {
    if (timer.weeks !== 0){
      if (Math.floor(timer.weeks/4) > numPhases){
        setPhase([
          ...phase,
          { id: phase.length, label: `Phase ${phase.length + 1}` },
        ]);    
        setNumPhases(numPhases + 1);
        setTimer(prevTimer => ({
          ...prevTimer,
          phaseCounter: prevTimer.phaseCounter + 1,
        }));
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
        R.map(R.prop('weeksnumber')),
        R.sum
      )(PhaseValues);

      setTimer(prevTimer => ({
        ...prevTimer,
        weeksCounter: totalWeeksNumber,
        mirror_weeks_counter: 0,
      }));

      setMicroValues([]);
      setWodValues([]);

      console.log('Total weeks number at the first if:', totalWeeksNumber);
    } else if (timer.mirror_weeks_counter !== null && timer.mirror_weeks_counter !== undefined) {

      setTimer(prevTimer => ({
        ...prevTimer,
        weeksCounter: timer.weeksCounter + timer.mirror_weeks_counter,
        mirror_weeks_counter: 0,
      }));
     
    }
    setTimer(prevTimer => ({
      ...prevTimer,
      phaseCounter: 0,
    }));
    setNumPhases(0);
    setPhaseValues(() => []);
  };
  
  

/*   useEffect(() => {
    if (splicerFunctionCalled) {
      const selectedIndex = 2;
      phaseSelection({ target: { value: selectedIndex } });     
      microSelection({ target: { value: selectedIndex } });     
      setSplicerFunctionCalled(false);
      
    }
    // eslint-disable-next-line 
  }, [splicerFunctionCalled]); */

  
// Selection handlers
  const phaseSelection = (e) => {
    const selectedPhaseIndex = Number(e.target.value);
    console.log(selectedPhaseIndex);
    const defaultIndex = 0;

    setSelectedPhase(selectedPhaseIndex);

    setPhaseData(() => {
      const currentPhaseData = PhaseValues.find((item) => (item.phaseID === selectedPhaseIndex));
      console.log(currentPhaseData);
      return currentPhaseData ? currentPhaseData : {
        phasename: "",
        weeksnumber: 0,
        phasescope: "",
      };
    });
    
    if (microValues){
      
      microSelection({ target: { value: defaultIndex.toString() } });

      if (wodValues){
        wodSelection({ target: { value: defaultIndex.toString() } });
      }

    }

  };

  const microSelection = (e) => {
    const selectedMicroIndex = Number(e.target.value);

    setSelectedMicro(selectedMicroIndex);
    
    setMicroData(() => {

      const currentMicroData = microValues.find((item) => (
       item.phaseID === selectedPhase && item.microID === selectedMicroIndex
      ));
      return currentMicroData ? currentMicroData : {
        type: "",
        scope: "",
        wods: "",
      };
    });

    
  };

  const wodSelection = (e) => {
    const selectedWodIndex = Number(e.target.value);

    setSelectedWod(selectedWodIndex);
    
    setWodData(() => {
      const currentWodData = wodValues.find((item)=> (item.phaseID === selectedPhase && item.microID === selectedMicro && item.wodID === selectedWodIndex));
      return currentWodData ? currentWodData : {
        type: "",
        scope: "",
        exercises: "",
      };
    })

  };


  

  return (
    <div id="wrapper" className="flex flex-row h-full overflow-y-auto">
      <div id="left-block" className="flex flex-col mt-5 h-full w-full overflow-y-auto">
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

        <div className="flex flex-col gap-4 w-192 mt-4 rounded-lg shadow-lg text-slate-300 font-mono">
          <div className="flex flex-row">
            <div
              id="phasesSelector"
              className="flex flex-col flex-initial w-1/2 rounded-lg bg-zinc-900 p-2"
            >
              <h2 className="text-lg my-2 text-slate-200 col-span-1 row-span-1 font-semibold mb-2">
                Phases (or Mesocycles)
              </h2>
              <div className="my-2 col-span-1 row-span-1">
                <button
                  id="createPhase"
                  className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                  disabled={!timer}
                  onClick={createPhase}
                >
                  Create
                </button>

                <button
                  id="deletePhase"
                  className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
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
                        className="custom-radio"
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
              className="flex flex-col w-1/2 bg-zinc-900 font-mono text-slate-300 rounded-lg ml-2 px-5 py-2"
            >
              <h2 className="text-lg my-2 text-slate-200 col-span-1 row-span-1 font-semibold mb-2 h-8">
                Phases form
              </h2>
              <div
                id="phase_editor_additional"
                className="col-span-1 row-span-3 w-96 h-full p-4 overflow-y-auto flex-grow"
              >
                {selectedPhase !== null && (
                  <PhasesForm
                    selectedPhase={selectedPhase}
                    PhaseValues={PhaseValues} // Pass the selectedPhase
                    setPhaseValues={setPhaseValues}
                    PhaseData={PhaseData}
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
          <div className="flex flex-col bg-zinc-900 rounded-lg my-2 mr-2 p-2">
          <h2 className="text-lg my-2 text-slate-200 col-span-1 row-span-1 font-semibold mb-2">
                Microcycles
              </h2>
            <div
              id="micro_selector"
              className="flex-initial w-1/2 col-span-1 row-span-1 w-96 h-80 p-4 overflow-y-auto"
            >
              {PhaseValues !== null && (
                <div key="micro_selector"> 
                  
                    <MicroSelector
                      microSelection={microSelection}
                    />
                  
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col bg-zinc-900 rounded-lg p-2">
            <MicroEditor />
          </div>
          </div>
          <div className="flex flex-row">
            <div
              id="wod_selector"
              className="flex flex-col bg-zinc-900 w-96 mr-5 rounded-lg p-2"
            >
              {microData &&
                microData.wods !== undefined &&
                microValues !== null && (
                  <div>
                    {Array.from(
                      { length: microData.wods },
                      (_, index) => (
                        <div key={index}>
                          <input
                            type="radio"
                            className="custom-radio"
                            name={`Micro-${selectedMicro}-week`}
                            value={index}
                            checked={selectedWod === index}
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
            <div
              id="wod_editor"
              className="flex flex-col bg-zinc-900 rounded-lg p-2"
            >
            <WodEditor
              setViewWod={setViewWod}
              selectedPhase={selectedPhase}
            />
            </div>
          </div>
          <div className="flex flex-row p-6 rounded-lg shadow-lg">
            <button
              className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2  px-2 py-2 rounded-md cursor-pointer text-sm"
              onClick={() =>
                CompilerFunction(
                  intervention_values,
                  PhaseValues,
                  microValues,
                  wodValues,
                  time_pipeline,
                  patientID,
                  dispatch
                )
              }
            >
              Save intervention
            </button>

            <button
              className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2  px-2 py-2 rounded-md cursor-pointer text-sm"
              onClick={() => setIsLoading(true)}
            >
              Manage interventions
            </button>
            <InterventionLoad patientID={patientID} />
          </div>
        </div>
      </div>
      <div id="right-block" className={`flex flex-col h-full overflow-y-auto collapsable-div ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <h2 className="text-xl text-slate-200 mt-5 ml-2 font-semibold mb-4">
            Intervention structure visualizer
          </h2>
        <Viewer
          viewIntervention={viewIntervention}
          viewPhase={viewPhase}
          viewMicro={viewMicro}
          viewWod={viewWod}
        />
      </div>
    </div>
    
  );
}

export default React.memo(Editor);
