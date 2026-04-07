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
      await tauriAPI.window.close();
    } catch (error) {
      console.error('Failed to close window:', error);
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        await getCurrentWindow().close();
      } catch (e) {
        console.error('Critical failure closing window:', e);
      }
    }
  };

  return (
    <div
      id="custom-frame"
      data-tauri-drag-region
      className="bg-zinc-900 border-b border-zinc-800 flex flex-row justify-between text-zinc-400 items-center select-none relative"
      style={{ height: "35px" }}
    >
      {/* LEFT: Logo and Brand */}
      <div className="flex items-center h-full px-3">
        <img src="/favicon.ico" alt="logo" className="w-4 h-4 mr-2 pointer-events-none" />
        <div id="title" className='font-sans font-medium text-[11px] text-zinc-500 pointer-events-none'>Fulcrum</div>
      </div>

      {/* CENTER: Draggable Patient Info */}
      <div
        data-tauri-drag-region
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-full cursor-default"
      >
        {patient ? (
          <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-2 px-4 py-1 rounded hover:bg-zinc-900 transition-colors pointer-events-none">
            <span className="text-zinc-600">Patient:</span>
            <span>{(patient.details.name || patient.details.surname) ? `${patient.details.name} ${patient.details.surname}` : 'New Patient'}</span>
          </div>
        ) : (
          <div className="text-[11px] font-medium text-zinc-600 pointer-events-none">No Patient Selected</div>
        )}
      </div>

      {/* RIGHT: Window Controls */}
      <div id="buttons" className="flex items-center h-full">
        <button
          className='h-full w-11 flex items-center justify-center hover:bg-zinc-800 transition-colors'
          onClick={() => minimizeWindow()}
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0.5H10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          className='h-full w-11 flex items-center justify-center hover:bg-zinc-800 transition-colors'
          onClick={() => maximizeWindow()}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button
          className='h-full w-11 flex items-center justify-center hover:bg-red-600/90 hover:text-white transition-colors'
          onClick={() => closeWindow()}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default WindowControls;


