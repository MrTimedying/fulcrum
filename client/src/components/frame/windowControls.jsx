import React from 'react';
import "../../App.css"
import { useLocation } from 'react-router-dom';

const WindowControls = () => {

  const location = useLocation();
  const isComposer = location.pathname === '/composer';

  console.log(isComposer);

  const minimizeWindow = () => {
    window.electronAPI.window.minimize();
  };
  
  const maximizeWindow = () => {
    window.electronAPI.window.maximize();
  };

  const closeWindow = () => {
    window.electronAPI.window.close();
  };

  const minimizeComponent = () => {
    window.electronAPI.component.minimize();
  }

  const maximizeComponent = () => {
    window.electronAPI.component.maximize();
  }

  const closeComponent = () => {
    window.electronAPI.component.close();
  }


  return (
    <div id="custom-frame" className="bg-zinc-900 flex flex-row justify-between text-slate-300 items-end pr-2" style={{height:"18px"}}>
      <div id="title" className='font-mono font-semibold pl-2 text-xs'>Fulcrum</div>
      <div id="buttons">
      <button className='ml-2' onClick={() => {
        if (isComposer) {
          return minimizeComponent();
        } else {
          return minimizeWindow();
        }
      }}>-</button>
      <button className='ml-2' onClick={() => {
        if (isComposer) {
          return maximizeComponent();
        } else {
          return maximizeWindow();
        }
      }}>□</button>
      <button className='ml-2' onClick={() => {
        if (isComposer) {
          return closeComponent();
        } else {
          return closeWindow();
        }
      }}>x</button>
      </div>
    </div>
  );
};

export default WindowControls;


