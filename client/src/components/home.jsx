import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainBody from './mainbody';
import Sidebar from './sidebar';
import  Composer  from './editor/composer';
import CustomFrame from './frame/customFrame';
import { Toaster } from './toaster';

function Home() {
  const location = useLocation();
  const isComposer = location.pathname === '/composer';

  if (isComposer) {
    return (
      <CustomFrame>
        <div className="App" style={{ height: 'calc(100vh - 18px)' }}>
          <Composer />
        </div>
      </CustomFrame>
    );
  }

  return (
    <CustomFrame>
      <div className="App flex flex-nowrap" style={{ height: 'calc(100vh - 18px)' }}>
        <Toaster />
        <Sidebar />
        <Routes>
          <Route path="/patients/:ID" element={<MainBody />} />
          <Route path="/" element={<MainBody />} />
        </Routes>
      </div>
    </CustomFrame>
  );
}

export default Home;
