import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../../state/core/usePatientStore';
import { FiUser } from 'react-icons/fi';

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
      } else {
        updatedDetails.bmi = ''; // Clear BMI if inputs are invalid or incomplete
      }
    }
    
    setDetails(updatedDetails);
    // Update store immediately for responsiveness
    addPatient(patientId, updatedDetails);
  };

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-800 bg-zinc-900">
        <FiUser size={32} className="mb-4 opacity-10" />
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">No patient selected</p>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-zinc-900 h-full">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header-like section within the panel */}
        <div className="border-b border-zinc-800 pb-2 mb-4">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
            Personal Data
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Name</label>
            <input
              type="text"
              name="name"
              value={details.name}
              onChange={handleChange}
              className="w-full text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600"
              placeholder="First name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Surname</label>
            <input
              type="text"
              name="surname"
              value={details.surname}
              onChange={handleChange}
              className="w-full text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600"
              placeholder="Last name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Status</label>
            <select
              name="status"
              value={details.status}
              onChange={handleChange}
              className="w-full text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
              className="w-full text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
              className="w-full text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600"
              placeholder="Age"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={details.height}
                onChange={handleChange}
                className="w-full text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600"
                placeholder="cm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={details.weight}
                onChange={handleChange}
                className="w-full text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-600"
                placeholder="kg"
              />
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">BMI</label>
            <div className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-400 font-mono flex items-center h-[34px]">
              {details.bmi || '--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
