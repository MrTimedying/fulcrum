import React from 'react';
import { format } from 'date-fns';
import { standardizeDate } from '../utils/dateUtils';

/**
 * Timeline visualization for ordered Session objects
 */
const DateTimeline = ({ items = [], selectedId, onNodeClick }) => {
  if (!items.length) {
    return (
      <div className="p-4 text-zinc-600 text-center text-xs italic">
        No ordered sessions found.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar bg-zinc-900/50 border-b border-zinc-800">
      <div className="flex flex-col space-y-2 p-3 min-w-max">
        <div className="flex items-center space-x-2">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            const dateVal = item.date;
            const order = item.order;
            const name = item.name || `Session ${order}`;
            
            const hasDate = !!dateVal;
            const date = standardizeDate(dateVal);
            
            return (
              <div 
                key={item.id} 
                className={`
                  flex flex-col items-center p-2 rounded cursor-pointer transition-all border
                  ${isSelected 
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100' 
                    : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-400'}
                  ${!hasDate ? 'opacity-50 border-dashed' : ''}
                `}
                onClick={() => onNodeClick(item.id)}
              >
                <div className="text-[10px] font-bold uppercase tracking-tighter mb-0.5">#{order}</div>
                <div className="text-[9px] font-mono mb-1">
                  {hasDate ? format(date, 'MMM d') : 'NO DATE'}
                </div>
                <div className="text-[10px] truncate max-w-[80px] font-medium">
                  {name}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Timeline connector */}
        <div className="flex items-center px-4">
          {items.map((item, index) => (
            <React.Fragment key={`connector-${item.id}`}>
              <div className={`
                h-0.5 flex-1 transition-colors duration-500
                ${item.date ? 'bg-indigo-500' : 'bg-zinc-700'}
              `} />
              {index < items.length - 1 && (
                <div className={`
                  h-1.5 w-1.5 rounded-full transition-colors
                  ${item.date ? 'bg-indigo-400' : 'bg-zinc-600'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateTimeline;
