import React, {useEffect} from 'react';
import "../../App.css"

const WindowControls = () => {
  const minimizeWindow = () => {
    window.electron.ipcRenderer.sendMessage('minimizeApp', ['minimizeApp']);
  };
  
  const maximizeWindow = () => {
    window.electron.ipcRenderer.sendMessage('maximizeApp', ['maximizeApp']);
  };

  const closeWindow = () => {
    window.electron.ipcRenderer.sendMessage('closeApp', ['closeApp']);
  };

/*   useEffect(() => {
    // Accessing electron-drag through context bridge
    window.electron.drag('#custom-frame');
  }, []); */

  return (
    <div id="custom-frame" className="bg-zinc-900 flex flex-row justify-between text-slate-300 items-end pr-2" style={{height:"18px"}}>
      <div id="title" className='font-mono font-semibold pl-2 text-xs'>Fulcrum</div>
      <div id="buttons">
      <button className='ml-2' onClick={minimizeWindow}>-</button>
      <button className='ml-2' onClick={maximizeWindow}>□</button>
      <button className='ml-2' onClick={closeWindow}>x</button>
      </div>
    </div>
  );
};

export default WindowControls;


