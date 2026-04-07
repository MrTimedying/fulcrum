import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HiOutlineDocumentDuplicate, 
  HiOutlineTrash, 
  HiOutlineBookmark,
  HiOutlinePencil
} from "react-icons/hi2";

export const TreeContextMenu = ({ 
  x, 
  y, 
  onClose, 
  onDuplicate, 
  onDelete, 
  onSaveTemplate,
  onRename,
  nodeType
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const items = [
    { 
      label: 'Rename', 
      icon: <HiOutlinePencil size={14} />, 
      onClick: onRename,
      show: nodeType !== 'Orphaned'
    },
    { 
      label: 'Duplicate', 
      icon: <HiOutlineDocumentDuplicate size={14} />, 
      onClick: onDuplicate,
      show: nodeType !== 'Orphaned'
    },
    { 
      label: 'Save as Template', 
      icon: <HiOutlineBookmark size={14} />, 
      onClick: onSaveTemplate,
      show: nodeType !== 'Orphaned'
    },
    { 
      label: 'Delete', 
      icon: <HiOutlineTrash size={14} className="text-red-400" />, 
      onClick: onDelete, 
      className: 'text-red-400 hover:bg-red-400/10',
      show: true
    },
  ].filter(item => item.show);

  return (
    <div 
      className="fixed inset-0 z-[100]" 
      onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      onClick={onClose}
    >
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ left: x, top: y }}
        className="absolute min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors ${item.className || ''}`}
          >
            {item.icon}
            <span className="text-[11px]">{item.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default TreeContextMenu;
