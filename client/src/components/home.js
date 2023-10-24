import React from 'react'
import MainBody from './mainbody'
import Sidebar from './sidebar'
import '../App.css';

function Home() {
  return (
    <div className="App flex flex-nowrap h-screen">
        <Sidebar />
        <MainBody />
    </div>
  )
}

export default Home;