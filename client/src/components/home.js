import React, { useState, useEffect } from 'react';
import MainBody from './mainbody';
import Sidebar from './sidebar';
import '../App.css';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import CustomFrame from './frame/customFrame';

function Home() {
  const [patientID, setPatientID] = useState(0);

  useEffect(() =>{
    console.log("Trying to re-render the Main Body")
  },[patientID])

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

