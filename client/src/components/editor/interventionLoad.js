import React, { useState } from "react";
import { useEditorContext } from "./editorContext";
import { Dialog, Transition } from "@headlessui/react";
import { useSelector, useDispatch } from "react-redux";
import { SplicerFunction } from "./utils";
import { createSelector } from "reselect";
import * as R from "ramda";
import { cancelIntervention } from "../../global/slices/interventionSlice";

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
    setToastPayload,
    setToastIsOpen,
  } = useEditorContext();
  const [selectedIntervention, setSelectedIntervention] = useState("");
  const [dataIntervention, setDataIntervention] = useState({});


  const getInterventionsForPatient = createSelector(
    (state) => state.intervention,
    (_, patientID) => patientID,
    (intervention, patientID) => intervention[patientID] || []
  );

  const interventionList = useSelector((state) =>
    getInterventionsForPatient(state, patientID)
  );

  

  const dispatch = useDispatch();

  const handleSelection = (e) => {
    const selectedInterventionIndex = e.target.value;
    console.log(selectedInterventionIndex);
    setSelectedIntervention(selectedInterventionIndex);
    setDataIntervention(
      interventionList.find(
        (item) =>
          item.intervention.interventionName === selectedInterventionIndex
      )
    );
    console.log(dataIntervention);
  };

/*   const deleteIntervention = (selectedIntervention, interventionList) => {
    console.log(selectedIntervention, interventionList);
    const predicate = (item) => item.intervention.interventionName === selectedIntervention;
    const newList = R.reject(predicate, interventionList);
    setDataIntervention(newList);
    console.log(newList);
    console.log("Delete function is firing");
  } */

  const deleteIntervention = (patientID, selectedIntervention ) =>{
    console.log(selectedIntervention, patientID);
    dispatch(cancelIntervention({ patientId: patientID, interventionName: selectedIntervention }));
    console.log("Delete function has fired");
    console.log(interventionList);
  }

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
                <h2 className="font-mono text-xl text-slate-300 mb-5">
                  Saved intervention
                </h2>
                {interventionList.map((item, index) => (
                  <div key={index}>
                    <input
                      type="radio"
                      name="intervention"
                      className="custom-radio"
                      value={item.intervention.interventionName}
                      checked={
                        selectedIntervention ===
                        item.intervention.interventionName
                      }
                      onChange={handleSelection}
                    />
                    {item.intervention.interventionName}
                  </div>
                ))}

                <button
                  className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                  onClick={async () => {
                    if (dataIntervention === undefined || dataIntervention === null ){
                      return setToastPayload({type: "error", message: "Please select an intervention"});
                    }

                    try {
                    let promiseResponse = await SplicerFunction(
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
                      if (promiseResponse === true){
                        setToastPayload({type: "success", message: "Intervention" + dataIntervention.intervention.interventionName + " loaded successfully"});
                        setToastIsOpen(true);
                        setIsLoading(false);
                      }
                      } catch(error) {
                        setToastPayload({type: "error", content: "There was an error loading the intervention"})
                      }
                      
                      
                  }}
                >
                  Load
                </button>

                <button
                  className="bg-zinc-950 hover:bg-black/30 text-slate-300 font-mono m-2 px-2 py-2 rounded-md cursor-pointer text-sm"
                  onClick={() => deleteIntervention(patientID, selectedIntervention)}
                >
                  Delete
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
