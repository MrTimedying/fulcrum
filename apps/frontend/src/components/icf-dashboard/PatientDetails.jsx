import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../../state/core/usePatientStore';

const PatientDetails = ({ patientId }) => {
  const { patients, addPatient } = usePatientStore();
  const patient = patients[patientId];
  
  const [details, setDetails] = useState({
    name: '',
    surname: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    status: '',
    bmi: ''
  });

  useEffect(() => {
    if (patient && patient.details) {
      setDetails({
        name: patient.details.name || '',
        surname: patient.details.surname || '',
        age: patient.details.age || '',
        gender: patient.details.gender || '',
        height: patient.details.height || '',
        weight: patient.details.weight || '',
        status: patient.details.status || '',
        bmi: patient.details.bmi || ''
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...details, [name]: value };
    
    // Auto-calculate BMI if height and weight are present
    if (name === 'height' || name === 'weight') {
      const h = name === 'height' ? parseFloat(value) : parseFloat(details.height);
      const w = name === 'weight' ? parseFloat(value) : parseFloat(details.weight);
      
      if (h > 0 && w > 0) {
        const hInMeters = h / 100;
        updatedDetails.bmi = (w / (hInMeters * hInMeters)).toFixed(2);
      }
    }
    
    setDetails(updatedDetails);
    // Update store immediately for responsiveness
    addPatient(patientId, updatedDetails);
  };

  if (!patient) return null;

  return (
    <div className="bg-zinc-900 border-b border-zinc-800 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Name</label>
          <input
            type="text"
            name="name"
            value={details.name}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Surname</label>
          <input
            type="text"
            name="surname"
            value={details.surname}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Status</label>
          <select
            name="status"
            value={details.status}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="Rehabilitation">Rehabilitation</option>
            <option value="Training">Training</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Gender</label>
          <select
            name="gender"
            value={details.gender}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Age</label>
          <input
            type="number"
            name="age"
            value={details.age}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Height (cm)</label>
          <input
            type="number"
            name="height"
            value={details.height}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={details.weight}
            onChange={handleChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">BMI</label>
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-400 font-mono">
            {details.bmi || '--'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
