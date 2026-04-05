import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { formatDateForPicker, standardizeDate } from '../utils/dateUtils';
import { 
  getOrderedNodes, 
  validateDateOrder, 
  getOrderedSessions, 
  validateSessionDateOrder 
} from '../utils/nodeDateCalculator';

/**
 * Component for assigning dates to multiple nodes or session objects at once
 */
const BulkDateAssigner = ({ nodes, sessions, interventionId, onAssign, onCancel }) => {
  const [startDate, setStartDate] = useState('');
  const [interval, setInterval] = useState(1);
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [preview, setPreview] = useState([]);
  const [validations, setValidations] = useState([]);
  
  // Support both modes
  const isSessionMode = !!(sessions && interventionId);

  // Get all ordered items
  const orderedItems = useMemo(() => {
    if (isSessionMode) return getOrderedSessions(sessions, interventionId);
    return getOrderedNodes(nodes);
  }, [nodes, sessions, interventionId, isSessionMode]);
  
  // Initialize with all ordered items selected
  useEffect(() => {
    setSelectedIds(orderedItems.map(item => item.id));
  }, [orderedItems]);
  
  // Generate preview whenever parameters change
  const generatePreview = useCallback(() => {
    if (!startDate) {
      return { newPreview: [], newValidations: [] };
    }
    
    const start = standardizeDate(startDate);
    if (!start) return { newPreview: [], newValidations: [] };
    
    const itemsToAssign = orderedItems
      .filter(item => selectedIds.includes(item.id))
      .sort((a, b) => (a.order || a.data?.order) - (b.order || b.data?.order));
    
    const newPreview = [];
    const newValidations = [];
    
    let currentDate = new Date(start);
    
    itemsToAssign.forEach(item => {
      const dateForItem = new Date(currentDate);
      const order = item.order || item.data?.order || 'Unknown';
      const name = item.name || item.data?.name || item.data?.label || `Session ${order}`;
      
      newPreview.push({
        id: item.id,
        order: order,
        name: name,
        date: dateForItem,
        formattedDate: formatDateForPicker(dateForItem)
      });
      
      // Validate against order
      const validation = isSessionMode 
        ? validateSessionDateOrder(item, dateForItem, sessions)
        : validateDateOrder(item, dateForItem, nodes);

      newValidations.push({
        id: item.id,
        ...validation
      });
      
      // Move to next date based on interval
      for (let i = 0; i < interval; i++) {
        currentDate = addDays(currentDate, 1);
        if (skipWeekends) {
          const day = currentDate.getDay();
          if (day === 0) currentDate = addDays(currentDate, 1); // Sunday
          if (day === 6) currentDate = addDays(currentDate, 2); // Saturday
        }
      }
    });
    
    return { newPreview, newValidations };
  }, [startDate, interval, skipWeekends, selectedIds, orderedItems, nodes, sessions, isSessionMode]);
  
  // Update preview and validations when parameters change
  useEffect(() => {
    const { newPreview, newValidations } = generatePreview();
    setPreview(newPreview);
    setValidations(newValidations);
  }, [generatePreview]);
  
  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const handleApply = () => {
    if (!preview.length) return;
    const assignments = preview.map(item => ({
      id: item.id,
      date: item.formattedDate
    }));
    onAssign(assignments);
  };
  
  const hasValidationErrors = validations.some(v => !v.valid);
  
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg text-gray-100 flex flex-col">
      {/* Settings */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Start Date</label>
          <input 
            type="date" 
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none focus:border-zinc-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Interval (Days)</label>
          <input 
            type="number" 
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none focus:border-zinc-500"
            value={interval}
            onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center text-xs text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer">
          <input 
            type="checkbox"
            className="mr-2 rounded border-zinc-700 bg-zinc-800 text-zinc-600 focus:ring-offset-zinc-900" 
            checked={skipWeekends}
            onChange={(e) => setSkipWeekends(e.target.checked)}
          />
          Skip weekends (Weekdays only)
        </label>
      </div>
      
      {/* Item selection */}
      <div className="mb-4">
        <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Target Selection</div>
        <div className="max-h-40 overflow-y-auto bg-zinc-950/50 rounded border border-zinc-800/50 p-1 no-scrollbar">
          {orderedItems.length === 0 ? (
            <div className="text-zinc-600 text-[10px] italic p-2 text-center">No ordered sessions found</div>
          ) : (
            orderedItems.map(item => (
              <div key={item.id} className="flex items-center py-1 px-2 hover:bg-zinc-800/50 rounded transition-colors">
                <input 
                  type="checkbox"
                  className="mr-3 rounded border-zinc-700 bg-zinc-800 text-zinc-600 focus:ring-offset-zinc-900"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                />
                <span className="text-[11px] text-zinc-300 font-medium">
                  #{item.order || item.data?.order} - {item.name || item.data?.name || item.data?.label}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Preview */}
      {preview.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Schedule Preview</div>
          <div className="max-h-40 overflow-y-auto bg-zinc-950/50 rounded border border-zinc-800/50 p-1 no-scrollbar">
            {preview.map((item) => {
              const validation = validations.find(v => v.id === item.id);
              return (
                <div 
                  key={item.id} 
                  className={`flex justify-between py-1 px-2 text-[11px] border-b border-zinc-800/30 last:border-0 ${!validation?.valid ? 'bg-amber-500/10 text-amber-200' : 'text-zinc-400'}`}
                >
                  <span className="font-medium">#{item.order} - {item.name}</span>
                  <span className="font-mono text-[10px] text-zinc-400">{item.formattedDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Validation messages */}
      {hasValidationErrors && (
        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded p-2">
          <div className="text-amber-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
            ⚠️ Timeline Conflicts
          </div>
          <div className="max-h-24 overflow-y-auto no-scrollbar">
            {validations.filter(v => !v.valid).map(validation => {
              const item = orderedItems.find(i => i.id === validation.id);
              return (
                <div key={validation.id} className="text-amber-200/70 text-[10px] py-0.5">
                  • Session #{item?.order || item?.data?.order}: {validation.message}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2 mt-auto pt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={!preview.length || !startDate}
          className={`px-4 py-1.5 text-[11px] font-bold rounded transition-all ${!preview.length || !startDate ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-600 hover:bg-zinc-500 text-white shadow-lg shadow-zinc-800/50'}`}
        >
          Schedule {preview.length} Session{preview.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default BulkDateAssigner;
