import React from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import Home from './components/home';
import PocSandbox from './components/PocSandbox';
import CustomFrame from './components/frame/customFrame';

function App() {
  const [searchParams] = useSearchParams();
  const windowType = searchParams.get('window');

  // If we are in a spawned POC window, render only the sandbox within a CustomFrame
  if (windowType === 'poc') {
    return (
      <CustomFrame>
        <div className="w-screen h-screen bg-zinc-950 flex items-center justify-center p-4">
          <PocSandbox />
        </div>
      </CustomFrame>
    );
  }

  // Handle all routes in Home
  return (
    <Routes>
      <Route path="/*" element={<Home />} />
    </Routes>
  );
}

export default App;
