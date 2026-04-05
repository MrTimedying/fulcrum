import React from 'react';
import "../../App.css"
import useFlowStore from '../../state/flowState';
import { tauriAPI } from '../../utils/tauri-api';

const WindowControls = () => {

  const {patientId, activeTab, setEditorState, setProfileState} = useFlowStore();

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
      if (activeTab === 'Profile') {
        setProfileState(patientId);
      } else if (activeTab === 'Editor') {
        setEditorState(patientId);
      } else if (!patientId) {
        // Close the window if no patient is selected
        await tauriAPI.window.close();
        return;
      }
      await tauriAPI.window.close();
    } catch (error) {
      console.error('Failed to close window:', error);
    }
  };


  return (
    <div id="custom-frame" className="bg-zinc-900 border-b border-zinc-700 flex flex-row justify-between text-slate-300 items-end pr-2" style={{height:"18px"}}>
      <div id="title" className='font-mono font-semibold pl-2 text-xs'>Fulcrum</div>
      <div id="buttons">
      <button className='ml-2' onClick={() => minimizeWindow()}>-</button>
      <button className='ml-2' onClick={() => maximizeWindow()}>□</button>
      <button className='ml-2' onClick={() => closeWindow()}>x</button>
      </div>
    </div>
  );
};

export default WindowControls;


