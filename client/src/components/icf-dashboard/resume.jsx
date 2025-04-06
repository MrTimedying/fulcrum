import React from "react";
// import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import useTransientStore from "../../state/transientState";

const Resume = () => {

  const patientID = useTransientStore((state) => state.patientID); 
  const patientDetails = {}; //At the moment, but the patient details needs to be extracted from the permantent store using the patientID in the transient store
  const interventionDetails = {}; //Same here, intervention details retrived from the permanent store using the patient ID; 

  // Render loading state or actual data
  return (
    <div className="bg-zinc-900 w-1/2 p-4 rounded-lg shadow-md flex justify-center my-5 font-mono text-slate-300 space-x-4">
      {/* Left Column */}

      <div className="flex-1">
        <h2 className="text-white text-xl font-bold mb-2">Patient Details</h2>

        {/* Anagrafic Details */}
        <div className="mb-4">
          <h3 className="text-gray-400 text-sm">Anagrafic Details</h3>
          {patientDetails ? (
            <p className="text-white">
              Name: {patientDetails.Name}
              <br />
              Age: {patientDetails.Age}
              <br />
              Gender: {patientDetails.Gender}
              <br />
              Weight: {patientDetails.Weight}
              <br />
              Height: {patientDetails.Height}
              <br />
              BMI: {patientDetails.BMI}
            </p>
          ) : (
            <p className="text-white">No details for current patient</p>
          )}
        </div>

        {/* Other Details */}
        <div>
          <h3 className="text-gray-400 text-sm">Other Details</h3>
          {patientDetails && (
            <p className="text-white">
              Status: {patientDetails.Status}
              <br />
            </p>
          )}
        </div>
      </div>

      <div className="flex-2">
        <h2 className="text-white text-xl font-bold mb-2">
          Goals and objectives
        </h2>

        {/* Anagrafic Details */}
        <div className="mb-4">
          {interventionDetails ? (
            <>
              <p className="text-white">
                Global Goal: {interventionDetails.globalGoal}
                <br />
                Service Goal: {interventionDetails.serviceGoal}
                </p>

              {Object.keys(interventionDetails)
                .filter((key) => key.includes("Phase"))
                .map((phaseKey) => (
                  <div key={phaseKey}>
                    <p className="text-white">
                      Cycle Goal {`${phaseKey}`}: {interventionDetails[phaseKey].phasescope}
                    </p>
                  </div>
                  
                ))}
            </>
          ) : (
            <p className="text-white">No details for current patient</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resume;
