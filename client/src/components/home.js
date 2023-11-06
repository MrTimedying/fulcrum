import React from 'react'
import MainBody from './mainbody'
import Sidebar from './sidebar'
import '../App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import InterventionEditor from './editor/editor';



function Home() {
  return (
    <div className="App flex flex-nowrap h-screen">
      <BrowserRouter>
        <Sidebar />
        <Routes>
          <Route path="/patients/:ID" element={<MainBody />} />
          <Route path="/" element={<MainBody />} />
          <Route path="/editor" element={<InterventionEditor/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default Home;