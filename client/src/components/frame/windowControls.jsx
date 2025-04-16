import React from 'react';
import "../../App.css"
import useFlowStore from '../../state/flowState';

const WindowControls = () => {

  const {patientId, activeTab, setEditorState, setProfileState} = useFlowStore();

  const minimizeWindow = () => {
    window.electronAPI.window.minimize();
  };
  
  const maximizeWindow = () => {
    window.electronAPI.window.maximize();
  };

  const closeWindow = () => {
    if (activeTab === 'Profile') {
      setProfileState(patientId);
    } else if (activeTab === 'Editor') {
      setEditorState(patientId);
    } else if (!patientId) {
      // Close the window if no patient is selected
      window.electronAPI.window.close();
    }
    window.electronAPI.window.close();
  };


  return (
    <div id="custom-frame" className="bg-zinc-900 flex flex-row justify-between text-slate-300 items-end pr-2" style={{height:"18px"}}>
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


