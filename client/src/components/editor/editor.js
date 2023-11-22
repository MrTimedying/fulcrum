import React, { useState } from "react";
import PhasesForm from "./phasesEditor.js";
import { InterventionEditor } from "./interventionEditor.js";
import { Viewer } from "./viewer.js";


function Editor() {
  const [phase, setPhase] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [interventionStartDate, setInterventionStartDate] = useState(null);
  const [weeks, setWeeks] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false); 
  const [timer, setTimer] = useState(null);
  const [numPhases, setNumPhases] = useState(0);
  const [PhaseValues, setPhaseValues] = useState([]); // This one stores the data for all the phases
  const [PhaseData, setPhaseData] = useState([]); // This one is just for the selection and the operations on a single phase
  /* const [phaseIndex, setPhaseIndex] = useState(0); */

  //State variables for the Viewer
  const [viewIntervention, setViewIntervention] = useState();
  const [viewPhase, setViewPhase] = useState();

  // Second part of the Editor functions, handling the CRUD for mesophases.
  const createPhase = () => {
    /* console.log(timer.calculateWeeks); */
    /* console.log(numPhases); */
    if (timer){
      if (Math.floor(timer.calculateMonths) > numPhases){

        setPhase([
          ...phase,
          { id: phase.length, label: `Phase ${phase.length + 1}` },
        ]);
    
        setNumPhases(numPhases + 1);
        timer.setPhaseCounter(timer.phaseCounter + 1);
        console.log(timer.phaseCounter);
        console.log(timer.weeksCounter);
        console.log(timer.weeksHandler());

      }

      else {
        console.log("You can't create more phases for the intervention duration you've set!")
      }
    }
  };

  const editPhase = () => {
    if (selectedPhase !== null) {
      const updatedPhases = [...phase];
      updatedPhases[selectedPhase].label = prompt(
        "Edit phase label:",
        phase[selectedPhase].label
      );
      setPhase(updatedPhases);
    }
  };

  const deletePhase = () => {
    if (selectedPhase !== null) {
      // This part removes the index from the array that stores the indexes
      const updatedPhases = phase.filter((_, index) => index !== selectedPhase);
      setPhase(updatedPhases);
      setSelectedPhase(null);
      setNumPhases(numPhases - 1);
      

      // This is still the logic for deleting the values of the deleted phases
      const updatedPhasesValues = { ...PhaseValues };
      if ( updatedPhasesValues[selectedPhase] !== null && updatedPhasesValues[selectedPhase] !== undefined) {
        const { weeksnumber: weeksNumber } = JSON.parse(updatedPhasesValues[selectedPhase]);
        console.log(weeksNumber);
        timer.setPhaseCounter(timer.phaseCounter - 1);
        /* timer.setWeeksCounter(timer.weeksCounter + weeksNumber); */

        delete updatedPhasesValues[selectedPhase];
        setPhaseValues(updatedPhasesValues);
        console.log(timer.phaseCounter);
        console.log(timer.weeksCounter);
        console.log(timer.weeksHandler());
      } else {
        console.log('I am arrived here, the phase should be deleted without problems');
        timer.setPhaseCounter(timer.phaseCounter - 1);
        console.log(timer.phaseCounter);
        console.log(timer.weeksCounter);
        console.log(timer.weeksHandler());
      }  
    }
  };
  

  const phaseSelection = (e) => {
    const selectedPhaseIndex = Number(e.target.value)
    setSelectedPhase(selectedPhaseIndex);
    /* setPhaseIndex(selectedPhaseIndex); */

     if (PhaseValues[selectedPhaseIndex]) {
    // Parse the JSON string into an object and set the form's values
    setPhaseData(JSON.parse(PhaseValues[selectedPhaseIndex]));
  } else  {
    setPhaseData([]);
  }

  };

  return (
    <div className="flex flex-row h-full w-full overflow-y-auto" style={{ backgroundColor: '#383838' }}>
      <div className="flex flex-col h-full w-2/3 overflow-y-auto">
        <div className="w-96 p-6 rounded-lg shadow-lg" >
          <h2 className="text-xl text-slate-200 font-semibold mb-4">Intervention Editor</h2>

          <InterventionEditor
            interventionStartDate={interventionStartDate}
            weeks={weeks}
            setInterventionStartDate={setInterventionStartDate}
            setWeeks={setWeeks}
            isAccepted= {isAccepted}
            setIsAccepted={setIsAccepted}
            timer={timer}
            setTimer={setTimer}
            setViewIntervention={setViewIntervention}
             />

        </div>

        <div className="flex gap-4 w-192 mt-4 rounded-lg shadow-lg">
          <div className="flex flex-col">
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
                id="editPhase"
                className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2"
                onClick={editPhase}
                disabled={selectedPhase === null}
              >
                Edit
              </button>
              <button
                id="deletePhase"
                className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2"
                onClick={deletePhase}
                disabled={selectedPhase === null}
              >
                Delete
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
          <div className="grid grid-cols-1 grid-rows-3">
            <div
              id="phase_editor_additional"
              className="col-span-1 row-span-3 w-96 h-full p-4 overflow-y-auto flex-grow"
            >
              {selectedPhase !== null && (
                <PhasesForm
                  selectedPhase={selectedPhase} // Pass the selectedPhase
                  setPhaseValues={setPhaseValues}
                  selectedValues={PhaseData}
                  timer={timer}
                  setViewPhase={setViewPhase}
                  
                  /* phaseIndex={phaseIndex} */
                // Pass the setPhaseValues function
                />
              )}
            </div>
          </div>
        </div>
        
      </div>
      <div className="flex flex-col h-full overflow-y-auto" >
        <h3 className="text-lg h-16 col-span-1 row-span-1 font-semibold mb-2">Editor Viewer</h3>
        <Viewer
          viewIntervention = {viewIntervention}
          viewPhase = {viewPhase} />



      </div>
    </div>
  );
}

export default Editor;
