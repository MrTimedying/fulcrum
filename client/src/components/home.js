import React, { useState, useEffect } from 'react';
import MainBody from './mainbody';
import Sidebar from './sidebar';
import '../App.css';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import CustomFrame from './frame/customFrame';
import { useSelector } from 'react-redux';


function Home() {
  const [patientID, setPatientID] = useState('');
  const state = useSelector(state => state);
  const [debounceState, setDebounceState] = useState(state);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      // Check if electronAPI exists and then call saveState
      if (window.electronAPI && typeof window.electronAPI.saveState === 'function') {
        window.electronAPI.saveState(debounceState);
      } else {
        console.log('Electron API not available, running outside Electron.');
      }
    }, 120000); // Adjust the time as needed
  
    return () => clearInterval(saveInterval);
  }, [debounceState]);
  

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setDebounceState(state);
    }, 500);

    return () => {
      clearTimeout(debounceTimeout);
    }
  },[state]);

  return (
    <Router>
      <CustomFrame>
      <div className="App flex flex-nowrap" style={{ height: 'calc(100vh - 18px)' }}>
        <Sidebar patientID={patientID} setPatientID={setPatientID} />
        <Routes>
          <Route path="/patients/:ID" element={<MainBody patientID={patientID} setPatientID={setPatientID} />} />
          <Route path="/" element={<MainBody />} />
        </Routes>
      </div>
      </CustomFrame>
    </Router>
  );
}

export default Home;

