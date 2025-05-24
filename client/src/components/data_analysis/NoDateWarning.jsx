import React from 'react';
import { MdDateRange } from 'react-icons/md';

function NoDateWarning({ nodeType }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
      <MdDateRange size={64} className="text-gray-500 mb-4" />
      <h3 className="text-xl font-medium mb-2 text-center">No date assigned</h3>
      <p className="text-center max-w-md">
        This {nodeType} node needs to have a date assigned before analysis can be shown.
        Please use the date picker to set a date for this node.
      </p>
    </div>
  );
}

export default NoDateWarning; 