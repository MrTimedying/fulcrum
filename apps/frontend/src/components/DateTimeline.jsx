import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { formatDateForPicker, standardizeDate } from '../utils/dateUtils';
import { getOrderedNodes, isSessionNode } from '../utils/nodeDateCalculator';

/**
 * Timeline visualization for ordered Session nodes with dates
 */
const DateTimeline = ({ nodes, selectedNodeId, onNodeClick }) => {
  // Filter and sort Session nodes with order - memoized to prevent recalculation
  const orderedNodes = useMemo(() => getOrderedNodes(nodes), [nodes]);
  
  if (!orderedNodes.length) {
    return (
      <div className="p-4 text-gray-400 text-center">
        No ordered Session nodes found. Add order numbers to Session nodes to visualize timeline.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden">
      <div className="flex flex-col space-y-2 p-2 min-w-max">
        <div className="text-xs text-gray-400 uppercase mb-1">Timeline (Order-Based)</div>
        <div className="flex items-center space-x-2">
          {orderedNodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const hasDate = !!node.data?.date;
            const date = standardizeDate(node.data?.date);
            
            return (
              <div 
                key={node.id} 
                className={`
                  flex flex-col items-center p-2 rounded cursor-pointer transition 
                  ${isSelected ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-gray-200'}
                  ${!hasDate ? 'opacity-70' : ''}
                `}
                onClick={() => onNodeClick(node.id)}
              >
                <div className="text-xs font-bold">#{node.data.order}</div>
                <div className="text-xs">
                  {hasDate ? format(date, 'MMM d') : '–'}
                </div>
                <div className="text-xs truncate max-w-[70px]">
                  {node.data.name || node.data.label || `Session ${node.data.order}`}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Timeline connector */}
        <div className="flex items-center space-x-1 pl-3 pr-3">
          {orderedNodes.map((node, index) => (
            <React.Fragment key={`connector-${node.id}`}>
              <div className={`
                h-1 flex-1 
                ${node.data?.date ? 'bg-blue-500' : 'bg-zinc-700'}
              `} />
              {index < orderedNodes.length - 1 && (
                <div className="h-2 w-2 rounded-full bg-zinc-600" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateTimeline;
