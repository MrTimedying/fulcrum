import React from 'react';
import { usePatientStore } from '../../state/core/usePatientStore';
import IcfDimensionCollapsible from './IcfDimensionCollapsible';

const DIMENSIONS = [
  { id: 'bodyStructure', title: 'Body Functions & Structures' },
  { id: 'activities', title: 'Activities' },
  { id: 'participation', title: 'Participation' },
  { id: 'environmentalFactors', title: 'Environmental Factors' },
  { id: 'personalFactors', title: 'Personal Factors' },
];

const IcfOverview = ({ patientId, onOpenIcfModal }) => {
  const { 
    patients, 
    updateIcfRecord, 
    addIcfRecord, 
    deleteIcfRecord 
  } = usePatientStore();
  
  const patient = patients[patientId];

  if (!patient || !patient.icf) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 italic text-xs bg-zinc-900 border-r border-zinc-800">
        Select a patient to view their profile.
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-full bg-zinc-900 border-r border-zinc-800 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
      <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-10 backdrop-blur-sm flex justify-between items-center">
        <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
          ICF Dimensions
        </h2>
        <button 
          onClick={onOpenIcfModal}
          className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 transition-colors"
        >
          Manage
        </button>
      </div>
      
      <div className="flex flex-col">
        {DIMENSIONS.map((dim) => (
          <IcfDimensionCollapsible
            key={dim.id}
            dimensionId={dim.id}
            title={dim.title}
            records={patient.icf[dim.id] || []}
            patientId={patientId}
            onUpdate={updateIcfRecord}
            onDelete={deleteIcfRecord}
            onAdd={() => onOpenIcfModal()}
          />
        ))}
      </div>
    </div>
  );
};

export default IcfOverview;
