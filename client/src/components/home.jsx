import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainBody from './mainbody';
import Sidebar from './sidebar';
import Composer from './editor/composer';
import CustomFrame from './frame/customFrame';
import { Toaster } from './toaster';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import './splitpane.css';

// Define custom styles for the SplitPane components
const containerStyle = {
  height: 'calc(100vh - 18px)',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden' // Prevent scrolling in the container
};

const splitPaneContainerStyle = {
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
  width: '100%',
  position: 'relative'
};

function Home() {
  const location = useLocation();
  const isComposer = location.pathname === '/composer';
  const [sizes, setSizes] = useState(['20%', 'auto']);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleDragStart = () => {
    setIsDragging(true);
    document.body.classList.add('resizing');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.classList.remove('resizing');
  };

  // Apply dragging class to the actual resizer element
  useEffect(() => {
    if (containerRef.current) {
      const resizer = containerRef.current.querySelector('.sash-vertical');
      if (resizer) {
        if (isDragging) {
          resizer.classList.add('dragging');
        } else {
          resizer.classList.remove('dragging');
        }
      }
    }
  }, [isDragging]);

  if (isComposer) {
    return (
      <CustomFrame>
        <div className="App" style={containerStyle}>
          <Composer />
        </div>
      </CustomFrame>
    );
  }

  return (
    <CustomFrame>
      <div className="App" style={containerStyle}>
        <Toaster />
        <div ref={containerRef} style={splitPaneContainerStyle}>
          <SplitPane 
            split="vertical" 
            sizes={sizes} 
            onChange={setSizes}
            className={`split-pane-row ${isDragging ? 'is-resizing' : ''}`}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Pane minSize={150} maxSize="50%" className="sidebar-pane">
              <Sidebar />
            </Pane>
            <Pane minSize={300} className="mainbody-pane">
              <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
                <Routes>
                  <Route path="/patients/:ID" element={<MainBody />} />
                  <Route path="/" element={<MainBody />} />
                </Routes>
              </div>
            </Pane>
          </SplitPane>
        </div>
      </div>
    </CustomFrame>
  );
}

export default Home;
