import React from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  HiChevronRight, 
  HiChevronDown,
  HiOutlineQueueList,
  HiOutlineCalendarDays,
  HiOutlinePlay,
  HiOutlineTag,
  HiOutlineSquare2Stack,
  HiEllipsisVertical,
  HiOutlineHome
} from "react-icons/hi2";

// --- Default Icon Mapping ---
const defaultIcons = {
  Intervention: HiOutlineHome,
  Phase: HiOutlineQueueList,
  Micro: HiOutlineSquare2Stack,
  Session: HiOutlineCalendarDays,
  Exercise: HiOutlinePlay,
  Default: HiOutlineTag
};

// --- TreeRow Presentational Component (The individual line) ---

const TreeRow = ({ 
  id, 
  type, 
  data, 
  isExpanded, 
  onToggle, 
  isSelected, 
  onSelect, 
  onContextMenu, 
  renamingId, 
  onRenameComplete, 
  listeners, 
  attributes, 
  isDragging, 
  isOverlay,
  icon: IconOverride,
  hasChildren = false,
  compact = false
}) => {
  const Icon = IconOverride || defaultIcons[type] || defaultIcons.Default;

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle?.(id);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect?.(id, type, data);
  };

  const isLeaf = !hasChildren;

  return (
    <div 
      className={`flex items-center group px-2 ${compact ? 'py-1' : 'py-1.5'} rounded cursor-pointer transition-all ${
        isOverlay ? 'bg-zinc-800 shadow-xl border border-zinc-700 scale-[1.02]' : 
        isSelected ? 'bg-zinc-800 text-blue-400' : 
        'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
      } ${isDragging && !isOverlay ? 'opacity-30' : 'opacity-100'}`}
      onClick={handleSelect}
      onContextMenu={(e) => onContextMenu?.(e, id, type, data)}
    >
      <div className="flex items-center flex-1 min-w-0">
        {!isLeaf ? (
          <div 
            className="p-1 -ml-1 hover:bg-zinc-700 rounded transition-colors cursor-pointer mr-1"
            onClick={handleToggle}
          >
            {isExpanded ? <HiChevronDown size={14} /> : <HiChevronRight size={14} />}
          </div>
        ) : <div className="w-4 mr-1" />}
        
        <Icon size={14} className={`mr-2 flex-shrink-0 ${isSelected ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
        
        {renamingId === id ? (
          <input
            autoFocus
            className="flex-1 bg-zinc-700 text-zinc-200 text-[11px] rounded px-1 outline-none border border-blue-500"
            defaultValue={data.name}
            onBlur={(e) => onRenameComplete?.(id, type, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenameComplete?.(id, type, e.target.value);
              if (e.key === 'Escape') onRenameComplete?.(id, type, data.name);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-[11px] truncate leading-tight font-medium">
            {data.name}
          </span>
        )}
      </div>
      
      {listeners && (
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1" {...attributes} {...listeners}>
           <HiEllipsisVertical size={14} className="text-zinc-600 cursor-grab active:cursor-grabbing" />
        </div>
      )}
    </div>
  );
};

// --- TreeItem Component (Row + Children) ---

export const TreeItem = (props) => {
  const { isExpanded, children, isDragging } = props;
  return (
    <div className="select-none outline-none">
      <TreeRow {...props} />
      {!isDragging && isExpanded && children && (
        <div className="ml-4 border-l border-zinc-800 mt-0.5">
          {children}
        </div>
      )}
    </div>
  );
};

// --- SortableTreeItem Component (Draggable wrapper for TreeItem) ---

export const SortableTreeItem = (props) => {
  const { id, type, data } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    data: { type, data }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="select-none outline-none">
      <TreeItem
        {...props}
        listeners={listeners}
        attributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
};

// --- TreeBranch Component (Optional wrapper for recursive children) ---

export const TreeBranch = ({ items, sortable = false, children }) => {
  if (sortable) {
    return (
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="py-0.5">
          {children}
        </div>
      </SortableContext>
    );
  }
  return (
    <div className="py-0.5">
      {children}
    </div>
  );
};
