import React, { useState } from "react";
import { useEditorContext } from "./editorContext";
import { Dialog, Transition } from "@headlessui/react";
import { useSelector } from "react-redux";
import { SplicerFunction } from "./utils";
import { createSelector } from 'reselect';

export const InterventionLoad = ({ patientID }) => {
  const {
    isLoading,
    setIsLoading,
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
  } = useEditorContext();
  const [selectedIntervention, setSelectedIntervention] = useState("");
  const [dataIntervention, setDataIntervention] = useState({});
 

  const getInterventionsForPatient = createSelector(
    state => state.intervention,
    (_, patientID) => patientID,
    (intervention, patientID) => intervention[patientID] || []
  );

  const interventionList = useSelector(state =>
    getInterventionsForPatient(state, patientID)
  );
  


  const handleSelection = (e) => {
    const selectedInterventionIndex = e.target.value;
    console.log(selectedInterventionIndex);
    setSelectedIntervention(selectedInterventionIndex);
    setDataIntervention(interventionList.find(item => item.intervention.interventionName === selectedInterventionIndex));
    console.log(dataIntervention);
  };

  return (
    <>
      <Transition show={isLoading}>
        <Dialog as="div" onClose={() => setIsLoading(false)}>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            {" "}
            <div className="flex items-center justify-center">
              {" "}
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              <div
                style={{
                  width: "700px",
                  height: "800px",
                }}
                className="p-6 my-8 text-left align-middle transition-all transform text-slate-300 font-mono bg-zinc-900 shadow-xl overflow-y-auto rounded-md"
              >
                <h2 className="font-mono text-xl text-slate-300 mb-5">Saved intervention</h2>
                {interventionList.map((item, index) => (
                  <div key={index}>
                    <input
                      type="radio"
                      name="intervention"
                      className="custom-radio"
                      value={item.intervention.interventionName}
                      checked={selectedIntervention === item.intervention.interventionName}
                      onChange={handleSelection}
                    />
                    {item.intervention.interventionName}
                  </div>
                ))}

                <button
                  className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                  onClick={() => 
                    {SplicerFunction(
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
                      dataIntervention);

                      setIsLoading(false);
                    }
                  }
                >
                  Load
                </button>
              </div>
              {/* </Resizable> */}
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
