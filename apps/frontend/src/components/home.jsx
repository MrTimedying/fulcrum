import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainBody from './mainbody';
import Sidebar from './sidebar';
import Composer from './editor/composer';
import CustomFrame from './frame/customFrame';
import { Toaster } from './toaster';
import UpdateManager from './UpdateManager';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import './splitpane.css';
import useFlowStore from '../state/flowState';
import NpForm from './npform';

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
  const { patients, patientId } = useFlowStore();
  
  // State variables to manage patient edit modal (shared between MainBody and Sidebar)
  const [isPatientEditModalOpen, setIsPatientEditModalOpen] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    name: "",
    surname: "",
    age: "",
    gender: "",
    bmi: "",
    height: "",
    weight: "",
    status: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Handler for editing patient data (shared between MainBody and Sidebar)
  const handleEditPatient = useCallback((node) => {
    // If called from profile node in MainBody, the node object contains the patient data
    if (node && node.type === 'profile') {
      // Get the patient ID from the node data or from the store
      const nodePatientId = node.data.PatientId || patientId;
      if (nodePatientId && patients[nodePatientId]) {
        setPatientFormData({
          ...patients[nodePatientId],
          PatientId: nodePatientId, // Ensure PatientId is included for the form to update correctly
        });
        setIsEditing(true);
        setIsPatientEditModalOpen(true);
        return;
      }
    }
    
    // If called without a node or if node doesn't have patient data (e.g. from sidebar)
    if (patientId && patients[patientId]) {
      setPatientFormData({
        ...patients[patientId],
        PatientId: patientId,
      });
      setIsEditing(true);
      setIsPatientEditModalOpen(true);
    }
  }, [patientId, patients]);

  // Close patient edit modal
  const closePatientEditModal = useCallback(() => {
    setIsPatientEditModalOpen(false);
    setPatientFormData({
      name: "",
      surname: "",
      age: "",
      gender: "",
      bmi: "",
      height: "",
      weight: "",
      status: "",
    });
    setIsEditing(false);
  }, []);

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
          <UpdateManager />
          <Composer />
        </div>
      </CustomFrame>
    );
  }

  return (
    <CustomFrame>
      <div className="App" style={containerStyle}>
        <UpdateManager />
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
            <Pane minSize={300} maxSize="50%" className="sidebar-pane">
              <Sidebar handleEditPatient={handleEditPatient} />
            </Pane>
            <Pane minSize={300} className="mainbody-pane">
              <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
                <Routes>
                  <Route path="/patients/:ID" element={<MainBody handleEditPatient={handleEditPatient} />} />
                  <Route path="/" element={<MainBody handleEditPatient={handleEditPatient} />} />
                </Routes>
              </div>
            </Pane>
          </SplitPane>
        </div>
        
        {/* Patient Edit Form Modal - now at Home level */}
        <NpForm
          isOpen={isPatientEditModalOpen}
          closeModal={closePatientEditModal}
          formData={patientFormData}
          setFormData={setPatientFormData}
          setFetchingSwitch={() => {}}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </div>
    </CustomFrame>
  );
}

export default Home;
