import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

const Resume = ({ patientID }) => {
  const [patientDetails, setPatientDetails] = useState(null);
  const [interventionDetails, setInterventionDetails] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        console.log("Patient ID in the fetching function", patientID);
        const response = await api.get("/api/patientsDetails", {
          params: { ID: patientID },
        });
        const fetchedPatientDetails = response.data;
        console.log(
          "Patient Details retrieved from the backend",
          fetchedPatientDetails
        );
  
        // Reset the state variable with the new data
        setPatientDetails(fetchedPatientDetails);
      } catch (error) {
        console.error("Error fetching patient details", error);
        // Handle errors as needed
      }
    };
  
    const fetchInterventionDetails = async () => {
      try {
        const response = await api.get("/api/patientsIntervention", {
          params: { ID: patientID },
        });
        const { Intervention } = response.data[0];
        console.log(
          "This is the intervention fetched from the profile!",
          Intervention
        );
        const parsedIntervention = JSON.parse(Intervention);
  
        // Reset the state variable with the new data
        setInterventionDetails(parsedIntervention);
      } catch (error) {
        console.error("Error fetching intervention details", error);
      }
    };
  
    fetchPatientDetails();
    fetchInterventionDetails();
  }, [patientID]);
  

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
