import React, { useState } from "react";
import { useNavigationStore } from "../../state/core/useNavigationStore";
import PatientDetails from "./PatientDetails";
import IcfOverview from "./IcfOverview";
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';

function Profile({ onOpenIcfModal }) {
  const { patientId } = useNavigationStore();
  const [sizes, setSizes] = useState(['40%', '60%']);

  return (
    <div
      id="wrapper"
      className="w-full flex flex-col h-full overflow-hidden bg-zinc-900 text-white border-l border-zinc-800"
    >
      {/* Header - Minimalistic, synced with Session Editor */}
      <div className="bg-zinc-900 p-1 flex justify-between items-center border-b border-zinc-800 flex-shrink-0 min-h-[53px]">
        <div className="flex items-center">
          <h2 className="text-gray-300 text-base font-medium ml-2 mr-4">Patient Profile</h2>
          <div className="flex items-center space-x-4">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
              ICF Dimensions & Personal Data
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mr-2">
           <div className="text-[9px] text-zinc-600 font-mono">
            {patientId ? `ID: ${patientId.slice(0, 8)}...` : "NO PATIENT SELECTED"}
          </div>
        </div>
      </div>
      
      {/* Main Body: Split Pane */}
      <div className="flex-grow flex overflow-hidden bg-zinc-900">
        <SplitPane
          split='vertical'
          sizes={sizes}
          onChange={setSizes}
        >
          <Pane minSize='250px'>
            <IcfOverview 
              patientId={patientId} 
              onOpenIcfModal={onOpenIcfModal}
            />
          </Pane>
          <Pane minSize='300px'>
            <PatientDetails patientId={patientId} />
          </Pane>
        </SplitPane>
      </div>
    </div>
  );
}

export default React.memo(Profile);
