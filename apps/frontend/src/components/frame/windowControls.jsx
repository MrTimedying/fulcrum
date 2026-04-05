import React from 'react';
import "../../App.css"
import { useNavigationStore } from '../../state/core/useNavigationStore';
import { tauriAPI } from '../../utils/tauri-api';

import { usePatientStore } from '../../state/core/usePatientStore';

const WindowControls = () => {

  const { patientId } = useNavigationStore();
  const { patients } = usePatientStore();
  const patient = patients[patientId];

  const minimizeWindow = async () => {
    try {
      await tauriAPI.window.minimize();
    } catch (error) {
      console.error('Failed to minimize window:', error);
    }
  };
  
  const maximizeWindow = async () => {
    try {
      await tauriAPI.window.maximize();
    } catch (error) {
      console.error('Failed to maximize window:', error);
    }
  };

  const closeWindow = async () => {
    try {
      // Always attempt to close the current window
      await tauriAPI.window.close();
    } catch (error) {
      console.error('Failed to close window:', error);
      // Fallback: try direct close if tauriAPI fails for some reason
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      } catch (e) {
        console.error('Critical failure closing window:', e);
      }
    }
  };


  return (
    <div id="custom-frame" data-tauri-drag-region className="bg-zinc-950 border-b border-zinc-800 flex flex-row justify-between text-zinc-400 items-center pr-2 select-none" style={{height:"18px"}}>
      <div id="title" data-tauri-drag-region className='font-mono font-semibold pl-2 text-xs text-zinc-600'>Fulcrum</div>
      
      <div className="flex items-center h-full">
        {patient && (
          <div className="mr-4 text-[9px] font-medium text-zinc-400 truncate max-w-[200px]">
            ... / { (patient.details.name || patient.details.surname) ? `${patient.details.name} ${patient.details.surname}` : 'New Patient' }
          </div>
        )}
        <div id="buttons" className="flex items-center h-full">
          <button className='ml-2 h-full px-2 hover:bg-zinc-800 transition-colors text-[10px]' onClick={() => minimizeWindow()}>-</button>
          <button className='ml-2 h-full px-2 hover:bg-zinc-800 transition-colors text-[10px]' onClick={() => maximizeWindow()}>□</button>
          <button className='ml-2 h-full px-2 hover:bg-red-900/50 transition-colors text-[10px]' onClick={() => closeWindow()}>x</button>
        </div>
      </div>
    </div>
  );
};

export default WindowControls;


