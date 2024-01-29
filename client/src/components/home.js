import React, {useState} from 'react'
import MainBody from './mainbody'
import Sidebar from './sidebar'
import '../App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';




function Home() {

  const [patientID, setPatientID] = useState(0);
  

  return (
    <div className="App flex flex-nowrap h-screen">
      <BrowserRouter>
        <Sidebar
          patientID={patientID} 
          setPatientID={setPatientID}
           />
        <Routes>
          <Route path="/patients/:ID" element={<MainBody patientID={patientID} />} />
          <Route path="/" element={<MainBody />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default Home;