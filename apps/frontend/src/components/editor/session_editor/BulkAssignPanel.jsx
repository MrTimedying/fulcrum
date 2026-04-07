import React from 'react';
import { motion } from 'motion/react';
import MultiListBox from '../exercise_modal/MultiListBox';

const BulkAssignPanel = ({
  containers,
  selectedContainers,
  onApplyBulk,
  isVisible,
  onClose,
  bulkEditFieldOptions,
  bulkEditTargetFields,
  setBulkEditTargetFields,
  bulkEditValue,
  setBulkEditValue,
  bulkEditOperation,
  setBulkEditOperation
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-zinc-800 border-b border-zinc-700 shadow-lg space-y-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-widest">
          Bulk Assign Values
        </h3>
        <span className="text-[10px] text-zinc-500 font-mono">
          TARGET: {selectedContainers.size === 0 ? 'ALL EXERCISES' : `${selectedContainers.size} SELECTED`}
        </span>
      </div>

      {bulkEditFieldOptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              1. Select Field Labels
            </label>
            <div className="border border-zinc-700 rounded overflow-hidden">
              <MultiListBox
                options={bulkEditFieldOptions}
                value={bulkEditTargetFields}
                onChange={setBulkEditTargetFields}
                size={5}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                2. Enter Value
              </label>
              <input
                type="text"
                className="w-full bg-zinc-900 text-zinc-200 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-600"
                value={bulkEditValue}
                onChange={(e) => setBulkEditValue(e.target.value)}
                placeholder="Value to assign..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                3. Choose Method
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBulkEditOperation('replace')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors border ${
                    bulkEditOperation === 'replace' 
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' 
                      : 'bg-zinc-900 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                  }`}
                >Replace</button>
                <button
                  type="button"
                  onClick={() => setBulkEditOperation('append')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors border ${
                    bulkEditOperation === 'append' 
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' 
                      : 'bg-zinc-900 text-zinc-500 border-zinc-700 hover:text-zinc-300'
                  }`}
                >Append</button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onApplyBulk}
                disabled={!bulkEditTargetFields || bulkEditValue === ''}
                className="flex-1 py-2 bg-zinc-200 hover:bg-white text-zinc-900 disabled:opacity-30 disabled:hover:bg-zinc-200 rounded text-xs font-bold uppercase tracking-widest transition-all"
              >
                Apply Change
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded text-xs font-bold uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-zinc-700 rounded text-zinc-500 text-sm">
          No common field labels found in selected exercises.
        </div>
      )}
    </motion.div>
  );
};

export default BulkAssignPanel;
