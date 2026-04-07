import React from 'react';
import { FiTrash2, FiPlus, FiSave } from 'react-icons/fi';
import { MdOutlineDataSaverOn } from 'react-icons/md';
import { InlineEdit } from '../exercise_modal/InlineEdit';
import CustomAutocompleteSelect from '../exercise_modal/CustomAutocompleteSelect';

const ExerciseOverviewList = ({
  containers,
  selectedExerciseId,
  onSelect,
  onAdd,
  onRemove,
  onSaveTemplate,
  selectedContainers,
  onToggleSelection,
  onUpdateName,
  exercises,
  onExerciseSelect,
  onExerciseDelete,
  formValues,
  isBulkEditActive
}) => {
  return (
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-800">
      {/* Search/Add at the top */}
      <div className="p-2 border-b border-zinc-800">
        <CustomAutocompleteSelect
          options={exercises}
          onSelect={onExerciseSelect}
          onDelete={onExerciseDelete}
          compact={true}
        />
      </div>

      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col">
          {containers.map((container) => {
            const isEditing = selectedExerciseId === container.id;
            const isChecked = selectedContainers.has(container.id);
            const isActive = isEditing || (isBulkEditActive && isChecked);
            const containerVals = formValues[container.id] || {};
            
            return (
              <div
                key={container.id}
                onClick={() => onSelect(container.id)}
                className={`group flex flex-col py-1.5 px-3 cursor-pointer transition-all duration-200 border-b border-zinc-800/50 ${
                  isActive
                    ? 'bg-zinc-800 border-l-2 border-l-zinc-400'
                    : 'hover:bg-zinc-800/40 border-l-2 border-l-transparent text-zinc-400'
                }`}
              >
                <div className="flex items-center w-full">
                  {isBulkEditActive && (
                    <div className="mr-3 flex items-center">
                      <input
                        type="checkbox"
                        className="h-3 w-3 rounded-sm border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none checked:bg-blue-500 checked:border-blue-500 relative transition-all after:content-[''] after:absolute after:hidden checked:after:block after:left-[3px] after:top-[0px] after:w-[4px] after:h-[7px] after:border-white after:border-b-2 after:border-r-2 after:rotate-45"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleSelection(container.id, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  
                  <div className="flex-grow min-w-0 mr-2">
                    <span className={`text-[11px] font-bold truncate block tracking-tight ${
                      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}>
                      {container.name}
                    </span>
                  </div>

                  <div className={`flex items-center space-x-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveTemplate(container);
                      }}
                      className="p-1 hover:text-green-500 transition-colors"
                      title="Save as Template"
                    >
                      <MdOutlineDataSaverOn size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(container.id);
                      }}
                      className="p-1 hover:text-red-500 transition-colors"
                      title="Delete Exercise"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Field Vectors/Data */}
                <div className="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  {container.fields.map(field => {
                    const val = containerVals[field.name];
                    if (!val) return null;
                    return (
                      <div key={field.id} className="flex items-center gap-1">
                        <span className="text-[11px] text-zinc-300 font-bold">{field.label}:</span>
                        <span className="text-[11px] font-medium text-zinc-500">
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExerciseOverviewList;
