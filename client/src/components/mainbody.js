import React from 'react';
import { useParams } from 'react-router-dom';


function MainBody() {
  let { ID } = useParams();

  // Check if there's an ID in the URL
  if (ID) {
    // Fetch patient data and display patient-specific content
    return (
      <div className="w-4/5 bg-slate-800 p-4 h-full">
        Display content for patient with ID: {ID}
      </div>
    );
  } else {
    // Display a message when no patient is selected
    return (
      <div className="w-4/5 bg-slate-800 p-4 h-full">
        Select a patient to view their information.
      </div>
    );
  }
}

export default MainBody;