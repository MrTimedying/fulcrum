import React, { Fragment, useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { Tab } from "@headlessui/react";
import { ReactFlowProvider } from "@xyflow/react";
import useFlowStore from "../state/flowState";
import Profile from "./icf-dashboard/profile";
import SessionEditor from "./editor/SessionEditor";
import useTransientStore from "../state/transientState";
import BulkExerciseEditModal from "./BulkExerciseEditModal";
import ICFSetsModal from "./icf-dashboard/ICFSetsModal";

// Bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

function MainBody({ handleEditPatient }) {
  const { patientId, activeTab, nodes, setNodes, patients } = useFlowStore();
  const { setToaster } = useTransientStore();
  const [isICFSetsModalOpen, setIsICFSetsModalOpen] = useState(false);

  // State for Bulk Exercise Edit Modal
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  const handleCloseBulkEditModal = useCallback(() => {
      setIsBulkEditModalOpen(false);
  }, []);

  function TabStructure() {
    return (
      <div className="flex flex-col h-full w-full">
        {activeTab === "Profile" ? (
          <div key="icfProfile" className="h-full overflow-hidden">
            <Profile 
              handleEditPatient={handleEditPatient}
            />
            <ICFSetsModal
              isOpen={activeTab === "Profile" && isICFSetsModalOpen}
              onClose={() => setIsICFSetsModalOpen(false)}
            />
          </div>
        ) : (
          <div key="interventionEditor" className="h-full overflow-hidden">
            <SessionEditor />
          </div>
        )}
      </div>
    );
  }

  if (patientId) {
    return (
      <div className="bg-neutral-800 h-full overflow-hidden">
        {TabStructure()}
        
        <BulkExerciseEditModal
            isOpen={isBulkEditModalOpen}
            onClose={handleCloseBulkEditModal}
        />
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center text-stone-400 bg-neutral-800 p-4 h-full">
        Select a patient to view their information.
      </div>
    );
  }
}

export default MainBody;