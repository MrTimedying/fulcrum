import React, { useState,useEffect, useCallback } from "react";
import Timer from ".//time.ts";

function InterventionEditor() {
  const [phase, setPhase] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [interventionStartDate, setInterventionStartDate] = useState(null);
  const [interventionEndDate, setInterventionEndDate] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [timer, setTimer] = useState(null);
  const [numPhases, setNumPhases] = useState(0);

  
  // First part of the Editor functions, handling the date picking logic.
  const handleAccept = () => {
    const durationInMilliseconds = interventionEndDate - interventionStartDate;
    const durationInDays = durationInMilliseconds / (1000 * 60 * 60 * 24);
    const durationInWeeks = durationInMilliseconds / (1000 * 60 * 60 * 24 * 7);  
    if (durationInWeeks >= 4 && (durationInWeeks%4) === 0 && (durationInDays%7) === 0 ) {
      setIsAccepted(true);
      console.log("Dates are of the correct chronological order!")
    }

    else {
      setIsAccepted(false);
      console.log("You can't setup a start date after the end date bruv!")
      document.getElementById('startDateInput').value = '';
      document.getElementById('endDateInput').value = '';
    }
    
  };

  const timerBuilder = useCallback( () => {
    console.log("Created a new Timer Instance")
    return new Timer(interventionStartDate, interventionEndDate);
  }, [interventionStartDate, interventionEndDate]);

  useEffect(() => {
    if (isAccepted === true) {
      const newTimer = timerBuilder();
      setTimer(newTimer);
    }
  }, [isAccepted, timerBuilder]);

  const changeInterventionStartDate = (e) => {
    setInterventionStartDate(new Date(e.target.value));
    setIsAccepted(false);
  };

  const changeInterventionEndDate = (e) => {
    setInterventionEndDate(new Date(e.target.value));
    setIsAccepted(false);
  };

  const resetDate = (e) => {
    setInterventionStartDate(null);
    setInterventionEndDate(null);
    setIsAccepted(false);
    setTimer(null);

    document.getElementById('startDateInput').value = '';
    document.getElementById('endDateInput').value = '';
  }

  // Second part of the Editor functions, handling the CRUD for mesophases.
  const createPhase = () => {
    console.log(timer.calculateWeeks);
    console.log(numPhases);
    if (timer.calculateWeeks%4 === 0 ){
      if (timer.calculateMonths%1 === 0 && timer.calculateMonths > numPhases){

        setPhase([
          ...phase,
          { id: phase.length, label: `Phase ${phase.length + 1}` },
        ]);
    
        setNumPhases(numPhases + 1);

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
      const updatedPhases = phase.filter((_, index) => index !== selectedPhase);
      setPhase(updatedPhases);
      setSelectedPhase(null);
      setNumPhases(numPhases - 1);
    }
  };

  const phaseSelection = (e) => {
    setSelectedPhase(Number(e.target.value));
  };

  const phasesContent = (i) => {
    return <div>Content specific for phase {i+1}</div>;
  };




  return (
    <div className="flex flex-col items-center justify-center h-full overflow-y-auto">
      <div className="w-96 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Intervention Editor</h2>
        <div className="mb-4">
          <label className="text-gray-700 text-sm">
            <h3>Start of the intervention date</h3>
            <input id="startDateInput" type="date" placeholder="Start day" onChange={changeInterventionStartDate}></input>
            <h3>End of the intervention date</h3>
            <input id="endDateInput" type="date" placeholder="End day" onChange={changeInterventionEndDate}></input>
          </label>
        </div>
        
        <button className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2" onClick={handleAccept} disabled={!interventionStartDate || !interventionEndDate || isAccepted}>Accept</button>
        <button className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2" onClick={resetDate} disabled={!interventionStartDate || !interventionEndDate || !isAccepted}>Reset</button>

      {isAccepted && (
        <div>
          <p>Intervention Start Date: {interventionStartDate.toDateString()}</p>
          <p>Intervention End Date: {interventionEndDate.toDateString()}</p>
          {/* You can add additional logic here to save or perform further actions */}
        </div>
      )}

      </div>

      <div className="grid grid-cols-2 gap-4 w-192 mt-4 border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-lg col-span-2 font-semibold mb-2">
          Phases (or Mesocycles)
        </h2>
        <div className="col-span-2">
          <button id="createPhase" className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2" disabled={!timer} onClick={createPhase}>Create</button>
          <button id="editPhase" className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2" onClick={editPhase} disabled={selectedPhase === null}>
            Edit
          </button>
          <button id="deletePhase" className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2" onClick={deletePhase} disabled={selectedPhase === null}>
            Delete
          </button>
        </div>
        <div id="phase_editor" className="w-96 h-40 p-4 overflow-y-auto">
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
        <div id="phase_editor_additional" className="w-96 h-40 p-4 overflow-y-auto">

          {selectedPhase !== null && phasesContent(selectedPhase)}
        
        </div>
      </div>
    </div>
  );
}

export default InterventionEditor;
