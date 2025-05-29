import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { formatDateForPicker, standardizeDate } from '../utils/dateUtils';
import { getOrderedNodes, validateDateOrder, isSessionNode } from '../utils/nodeDateCalculator';

/**
 * Component for assigning dates to multiple nodes at once
 */
const BulkDateAssigner = ({ nodes, onAssign, onCancel }) => {
  const [startDate, setStartDate] = useState('');
  const [interval, setInterval] = useState(1);
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [preview, setPreview] = useState([]);
  const [validations, setValidations] = useState([]);
  
  // Get all ordered Session nodes - memoized to prevent recalculation on every render
  const orderedNodes = useMemo(() => getOrderedNodes(nodes), [nodes]);
  
  // Initialize with all ordered nodes selected - only run once when orderedNodes changes
  useEffect(() => {
    setSelectedNodes(orderedNodes.map(node => node.id));
  }, [orderedNodes]);
  
  // Generate preview whenever parameters change - memoized to prevent infinite loops
  const generatePreview = useCallback(() => {
    if (!startDate) {
      return { newPreview: [], newValidations: [] };
    }
    
    const start = standardizeDate(startDate);
    if (!start) return { newPreview: [], newValidations: [] };
    
    const nodesToAssign = orderedNodes.filter(node => 
      selectedNodes.includes(node.id)
    ).sort((a, b) => a.data.order - b.data.order);
    
    const newPreview = [];
    const newValidations = [];
    
    let currentDate = new Date(start);
    
    nodesToAssign.forEach(node => {
      // Assign date to this node
      const dateForNode = new Date(currentDate);
      
      // Generate a user-friendly node name
      const sessionNumber = node.data.order || 'Unknown';
      const nodeName = node.data.name || node.data.label || `Session ${sessionNumber}`;
      
      newPreview.push({
        nodeId: node.id,
        order: node.data.order,
        nodeName: nodeName,
        date: dateForNode,
        formattedDate: formatDateForPicker(dateForNode)
      });
      
      // Validate against order
      const validation = validateDateOrder(node, dateForNode, nodes);
      newValidations.push({
        nodeId: node.id,
        ...validation
      });
      
      // Move to next date based on interval
      for (let i = 0; i < interval; i++) {
        currentDate = addDays(currentDate, 1);
        
        // Skip weekends if enabled
        if (skipWeekends) {
          const day = currentDate.getDay();
          if (day === 0) currentDate = addDays(currentDate, 1); // Sunday
          if (day === 6) currentDate = addDays(currentDate, 2); // Saturday
        }
      }
    });
    
    return { newPreview, newValidations };
  }, [startDate, interval, skipWeekends, selectedNodes, orderedNodes, nodes]);
  
  // Update preview and validations when parameters change
  useEffect(() => {
    const { newPreview, newValidations } = generatePreview();
    setPreview(newPreview);
    setValidations(newValidations);
  }, [generatePreview]);
  
  // Toggle node selection
  const toggleNodeSelection = (nodeId) => {
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      } else {
        return [...prev, nodeId];
      }
    });
  };
  
  // Apply the bulk assignment
  const handleApply = () => {
    if (!preview.length) return;
    
    const assignments = preview.map(item => ({
      nodeId: item.nodeId,
      date: item.formattedDate
    }));
    
    onAssign(assignments);
  };
  
  // Check if any validation errors exist
  const hasValidationErrors = validations.some(v => !v.valid);
  
  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg text-gray-100 p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Bulk Date Assignment</h3>
      
      {/* Settings */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Start Date</label>
          <input 
            type="date" 
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Days Between Nodes</label>
          <input 
            type="number" 
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
            value={interval}
            onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center text-sm text-gray-300">
          <input 
            type="checkbox"
            className="mr-2" 
            checked={skipWeekends}
            onChange={(e) => setSkipWeekends(e.target.checked)}
          />
          Skip weekends (schedule only on weekdays)
        </label>
      </div>
      
      {/* Node selection */}
      <div className="mb-4">
        <div className="text-sm text-gray-400 mb-2">Select Nodes to Assign</div>
        <div className="max-h-48 overflow-y-auto bg-zinc-800 rounded p-2">
          {orderedNodes.length === 0 ? (
            <div className="text-gray-500 text-sm">No ordered nodes found</div>
          ) : (
            orderedNodes.map(node => (
              <div key={node.id} className="flex items-center py-1">
                <input 
                  type="checkbox"
                  className="mr-2"
                  checked={selectedNodes.includes(node.id)}
                  onChange={() => toggleNodeSelection(node.id)}
                />
                <span className="text-sm">
                  #{node.data.order} - {node.data.name || node.data.label || `Session ${node.data.order || 'Unknown'}`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Preview */}
      {preview.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Preview</div>
          <div className="max-h-48 overflow-y-auto bg-zinc-800 rounded p-2">
            {preview.map((item, index) => {
              const validation = validations.find(v => v.nodeId === item.nodeId);
              return (
                <div 
                  key={item.nodeId} 
                  className={`flex justify-between py-1 text-sm ${!validation?.valid ? 'text-amber-300' : ''}`}
                >
                  <span>#{item.order} - {item.nodeName}</span>
                  <span>{item.formattedDate}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Validation messages */}
      {hasValidationErrors && (
        <div className="mb-4">
          <div className="text-amber-300 text-sm mb-1">⚠️ Validation Issues:</div>
          <div className="max-h-32 overflow-y-auto bg-amber-900/30 rounded p-2">
            {validations.filter(v => !v.valid).map(validation => {
              const node = nodes.find(n => n.id === validation.nodeId);
              return (
                <div key={validation.nodeId} className="text-amber-200 text-xs py-1">
                  • Node #{node?.data.order}: {validation.message}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end gap-3 mt-auto">
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={!preview.length || !startDate}
          className={`px-3 py-1 ${!preview.length || !startDate ? 'bg-zinc-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'} text-sm rounded flex items-center gap-1`}
        >
          Apply to {preview.length} Node{preview.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default BulkDateAssigner;
