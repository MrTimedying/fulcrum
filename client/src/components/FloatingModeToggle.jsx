import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaUser } from 'react-icons/fa';
import { HiOutlineShare } from 'react-icons/hi';
import useFlowStore from '../state/flowState';

const FloatingModeToggle = () => {
  const { activeTab, setActiveTab } = useFlowStore();
  
  const isProfileMode = activeTab === 'Profile';
  
  const handleToggle = () => {
    setActiveTab(isProfileMode ? 'Editor' : 'Profile');
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="fixed top-6 right-6 w-12 h-12 rounded-full shadow-md border border-zinc-700 transition-all duration-300 z-50 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-slate-300"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isProfileMode ? 'Editor' : 'Profile'} mode`}
      title={`Switch to ${isProfileMode ? 'Editor' : 'Profile'} mode`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.3
          }}
          className="text-lg"
        >
          {isProfileMode ? (
            <FaUser />
          ) : (
            <HiOutlineShare />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle Glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-full blur opacity-20 bg-zinc-400`}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  );
};

export default FloatingModeToggle; 