import React from 'react';
import "../../App.css"
import { useNavigationStore } from '../../state/core/useNavigationStore';
import { tauriAPI } from '../../utils/tauri-api';

const WindowControls = () => {

  const { patientId, activeTab } = useNavigationStore();

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
    <div id="custom-frame" data-tauri-drag-region className="bg-zinc-900 border-b border-zinc-700 flex flex-row justify-between text-slate-300 items-end pr-2" style={{height:"18px"}}>
      <div id="title" data-tauri-drag-region className='font-mono font-semibold pl-2 text-xs'>Fulcrum</div>
      <div id="buttons">
      <button className='ml-2' onClick={() => minimizeWindow()}>-</button>
      <button className='ml-2' onClick={() => maximizeWindow()}>□</button>
      <button className='ml-2' onClick={() => closeWindow()}>x</button>
      </div>
    </div>
  );
};

export default WindowControls;


