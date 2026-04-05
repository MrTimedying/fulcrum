import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainBody from './mainbody';
import Sidebar from './sidebar';
import IconBar from './IconBar';
import Composer from './editor/composer';
import CustomFrame from './frame/customFrame';
import { Toaster } from './toaster';
import UpdateManager from './UpdateManager';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import './splitpane.css';
import useFlowStore from '../state/flowState';
import NpForm from './npform';
import OptionsModal from './OptionsModal';

const containerStyle = {
  height: 'calc(100vh - 18px)',
  width: '100%',
  display: 'flex',
  flexDirection: 'row', // VS Code style: IconBar is a sibling of the main area
  overflow: 'hidden'
};

const mainAreaStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative'
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
  const [sizes, setSizes] = useState(['250px', 'auto']);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const { patients, patientId } = useFlowStore();
  
  // Layout state
  const [activeSidebarContext, setActiveSidebarContext] = useState('patients');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // State variables to manage patient edit modal
  const [isPatientEditModalOpen, setIsPatientEditModalOpen] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    name: "", surname: "", age: "", gender: "", bmi: "", height: "", weight: "", status: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleEditPatient = useCallback((node) => {
    if (node && node.type === 'profile') {
      const nodePatientId = node.data.PatientId || patientId;
      if (nodePatientId && patients[nodePatientId]) {
        setPatientFormData({ ...patients[nodePatientId], PatientId: nodePatientId });
        setIsEditing(true);
        setIsPatientEditModalOpen(true);
        return;
      }
    }
    if (patientId && patients[patientId]) {
      setPatientFormData({ ...patients[patientId], PatientId: patientId });
      setIsEditing(true);
      setIsPatientEditModalOpen(true);
    }
  }, [patientId, patients]);

  const closePatientEditModal = useCallback(() => {
    setIsPatientEditModalOpen(false);
    setIsEditing(false);
  }, []);

  const handleContextChange = (newContext) => {
    if (newContext === activeSidebarContext) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    } else {
      setActiveSidebarContext(newContext);
      setIsSidebarCollapsed(false);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    document.body.classList.add('resizing');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.classList.remove('resizing');
  };

  useEffect(() => {
    if (containerRef.current) {
      const resizer = containerRef.current.querySelector('.sash-vertical');
      if (resizer) {
        if (isDragging) resizer.classList.add('dragging');
        else resizer.classList.remove('dragging');
      }
    }
  }, [isDragging]);

  if (isComposer) {
    return (
      <CustomFrame>
        <div className="App" style={containerStyle}>
          <UpdateManager />
          <Composer />
        </div>
      </CustomFrame>
    );
  }

  return (
    <CustomFrame>
      <div className="App bg-zinc-950" style={containerStyle}>
        <IconBar 
          activeContext={activeSidebarContext} 
          onContextChange={handleContextChange} 
          isSidebarCollapsed={isSidebarCollapsed}
          onSettingsClick={() => setIsOptionsModalOpen(true)}
        />
        
        <div style={mainAreaStyle}>
          <UpdateManager />
          <Toaster />
          <div ref={containerRef} style={splitPaneContainerStyle}>
            <SplitPane 
              split="vertical" 
              sizes={isSidebarCollapsed ? [0, 'auto'] : sizes} 
              onChange={setSizes}
              className={`split-pane-row ${isDragging ? 'is-resizing' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Pane minSize={isSidebarCollapsed ? 0 : 250} maxSize="50%">
                <div className="h-full bg-zinc-900 overflow-hidden border-r border-zinc-800">
                   {!isSidebarCollapsed && (
                     <Sidebar context={activeSidebarContext} handleEditPatient={handleEditPatient} />
                   )}
                </div>
              </Pane>
              <Pane minSize={400}>
                <div style={{ height: '100%', width: '100%', overflow: 'hidden' }} className="bg-zinc-950">
                  <Routes>
                    <Route path="/patients/:ID" element={<MainBody handleEditPatient={handleEditPatient} />} />
                    <Route path="/" element={<MainBody handleEditPatient={handleEditPatient} />} />
                  </Routes>
                </div>
              </Pane>
            </SplitPane>
          </div>
        </div>
        
        <NpForm
          isOpen={isPatientEditModalOpen}
          closeModal={closePatientEditModal}
          formData={patientFormData}
          setFormData={setPatientFormData}
          setFetchingSwitch={() => {}}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />

        <OptionsModal 
          isOpen={isOptionsModalOpen} 
          onClose={() => setIsOptionsModalOpen(false)} 
        />
      </div>
    </CustomFrame>
  );
}

export default Home;
