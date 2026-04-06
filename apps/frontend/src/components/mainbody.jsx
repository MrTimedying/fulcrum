import React, { Fragment, useState, useEffect, useCallback } from "react";
import Modal from "react-modal";
import { Tab } from "@headlessui/react";
import { ReactFlowProvider } from "@xyflow/react";
import { usePatientStore } from "../state/core/usePatientStore";
import { useNavigationStore } from "../state/core/useNavigationStore";
import { useFlowDiagramStore } from "../state/flow/useFlowDiagramStore";
import Profile from "./icf-dashboard/profile";
import SessionEditor from "./editor/SessionEditor";
import PhasePanel from "./editor/PhasePanel";
import MicroPanel from "./editor/MicroPanel";
import { useInterventionStore } from "../state/core/useInterventionStore";
import useUIStore from "../state/core/useUIStore";
import BulkExerciseEditModal from "./BulkExerciseEditModal";
import ICFSetsModal from "./icf-dashboard/ICFSetsModal";
import InterventionWorkflowPlaceholder from "./util/InterventionWorkflowPlaceholder";

// Bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

function MainBody({ handleEditPatient }) {
  const { patients } = usePatientStore();
  const { patientId, activeTab } = useNavigationStore();
  const { nodes, setNodes } = useFlowDiagramStore();
  const { setToaster } = useUIStore();
  const { selectedInterventionId, selectedSessionId, selectedStructuralNodeType } = useInterventionStore();
  const [isICFSetsModalOpen, setIsICFSetsModalOpen] = useState(false);

  // State for Bulk Exercise Edit Modal
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === "Editor" && patientId) {
      // Find the intervention for this patient (e.g. starting with "default-" + patientId)
      const interventions = useInterventionStore.getState().interventions;
      const interventionId = Object.keys(interventions).find(
        (id) => interventions[id].patientId === patientId && id.startsWith("default-")
      ) || `default-${patientId}`;

      useInterventionStore.getState().loadIntervention(patientId, interventionId);
    } else if (activeTab === "Profile") {
      // Clear the diagram or just leave it. (The Kanban view doesn't use it).
      // For now, we just ensure selectedInterventionId is null or leave as is.
    }
  }, [patientId, activeTab]);

  const handleCloseBulkEditModal = useCallback(() => {
      setIsBulkEditModalOpen(false);
  }, []);

  function TabStructure() {
    let editorContent = null;
    if (selectedStructuralNodeType === 'Phase') {
      editorContent = <PhasePanel />;
    } else if (selectedStructuralNodeType === 'Micro') {
      editorContent = <MicroPanel />;
    } else if (selectedSessionId) {
      editorContent = <SessionEditor />;
    } else {
      const activeStep = !patientId ? 0 : !selectedInterventionId ? 1 : 2;
      editorContent = <InterventionWorkflowPlaceholder activeStep={activeStep} />;
    }

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
            {editorContent}
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
    return <InterventionWorkflowPlaceholder activeStep={0} />;
  }
}

export default MainBody;