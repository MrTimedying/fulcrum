// Filename: flowControls.jsx
import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GoPlus } from "react-icons/go";
import { FiMinus } from "react-icons/fi";
import { SlSizeActual } from "react-icons/sl";
import { CiUnlock, CiLock, CiMenuBurger } from "react-icons/ci"; // Features Menu Icon
import { IoIosColorPalette } from "react-icons/io"; // Style Menu Icon
import { MdOutlineEdit } from "react-icons/md"; // Icon for Bulk Edit
import { BsGrid3X3 } from "react-icons/bs"; // Icon for ICF Sets
import useFlowStore from "../../state/flowState"; // Import the flow store
import { FaArrowDown, FaArrowRight } from "react-icons/fa"; // Icons for layout buttons

export default function FlowControls({ setIsFeaturesMenuOpen, setIsStyleMenuOpen, handleOpenBulkEditModal, singleNodeSelected, setIsICFSetsModalOpen, isICFSetsModalOpen }) {
  const reactFlowInstance = useReactFlow();
  const { zoomIn, zoomOut, fitView } = reactFlowInstance;
  const [isLocked, setIsLocked] = useState(false);
  
  // Get activeTab from the store to check if we're in Editor
  const activeTab = useFlowStore((state) => state.activeTab);
  
  // Get the applyLayout function from the store
  const applyLayout = useFlowStore((state) => state.applyLayout);
  
  // ICF Sets should be disabled in Editor tab
  const isICFSetsDisabled = activeTab === "Editor";

  const handleToggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    reactFlowInstance.setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        draggable: !newState,
        selectable: !newState,
      }))
    );
  };

  // Corrected handler for the Style Menu button (IoIosColorPalette)
  const handleToggleStyleMenu = (e) => {
    e.stopPropagation();
    setIsStyleMenuOpen(prevStyleOpen => {
      const newStyleOpenState = !prevStyleOpen;
      if (newStyleOpenState) {
        setIsFeaturesMenuOpen(false); // Close Features Menu if Style Menu is being opened
      }
      return newStyleOpenState;
    });
  };

  // Corrected handler for the Features Menu button (CiMenuBurger)
  const handleToggleFeaturesMenu = (e) => {
    e.stopPropagation();
    setIsFeaturesMenuOpen(prevFeaturesOpen => {
      const newFeaturesOpenState = !prevFeaturesOpen;
      if (newFeaturesOpenState) {
        setIsStyleMenuOpen(false); // Close Style Menu if Features Menu is being opened
      }
      return newFeaturesOpenState;
    });
  };

  return (
    <div className="flex flex-row space-x-2 p-2 bg-white dark:bg-neutral-900 shadow-lg rounded-lg dark:shadow-xl transition-all duration-300 ease-in-out">
      {/* Style Menu Button */}
      <button
        onClick={handleToggleStyleMenu} // Correctly calls style menu handler
        className="p-1 rounded-md text-sm bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200 ease-in-out shadow hover:shadow-md menu-trigger"
        aria-label="Style Menu"
      >
        <IoIosColorPalette />
      </button>

      {/* Features Menu Button */}
      <button
        onClick={handleToggleFeaturesMenu} // Correctly calls features menu handler
        className="p-1 rounded-md text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200 ease-in-out shadow hover:shadow-md menu-trigger"
        aria-label="Features Menu"
      >
        <CiMenuBurger />
      </button>

      {/* Bulk Edit Button */}
      <button
        onClick={handleOpenBulkEditModal}
        disabled={!singleNodeSelected}
        className={`p-1 rounded-md text-xs ${singleNodeSelected ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-600 cursor-not-allowed'} text-white transition-all duration-200 ease-in-out shadow hover:shadow-md`}
        aria-label="Bulk Edit Exercises"
        title="Bulk Edit Exercises (Select a single node)"
      >
        <MdOutlineEdit />
      </button>

      {/* ICF Sets Button */}
      <button
        onClick={() => !isICFSetsDisabled && setIsICFSetsModalOpen(!isICFSetsModalOpen)}
        disabled={isICFSetsDisabled}
        className={`p-1 rounded-md text-xs ${isICFSetsDisabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700'} text-white transition-all duration-200 ease-in-out shadow hover:shadow-md menu-trigger`}
        aria-label="ICF Sets and Templates"
        title={isICFSetsDisabled ? "ICF Sets are only available in Profile tab" : "ICF Sets and Templates"}
      >
        <BsGrid3X3 />
      </button>
      
      {/* Layout Buttons */}
      <button
        onClick={() => applyLayout('TB')}
        className="p-1 rounded-md text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200 ease-in-out shadow hover:shadow-md"
        aria-label="Apply Vertical Layout (Top-Bottom)"
        title="Apply Vertical Layout (Top-Bottom)"
      >
        <FaArrowDown />
      </button>
      <button
        onClick={() => applyLayout('LR')}
        className="p-1 rounded-md text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200 ease-in-out shadow hover:shadow-md"
        aria-label="Apply Horizontal Layout (Left-Right)"
        title="Apply Horizontal Layout (Left-Right)"
      >
        <FaArrowRight />
      </button>

      {/* Zoom In Button */}
      <button
        onClick={() => zoomIn()}
        className="p-1 rounded-md text-xs bg-zinc-800 hover:bg-zinc-700  text-white  transition-all duration-200 ease-in-out shadow hover:shadow-md "
        aria-label="Zoom In"
      >
        <GoPlus />
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={() => zoomOut()}
        className="p-1 rounded-md  text-xs text-white  bg-zinc-800 hover:bg-zinc-700  transition-all duration-200 ease-in-out shadow hover:shadow-md "
        aria-label="Zoom Out"
      >
        <FiMinus />
      </button>

      {/* Fit View Button */}
      <button
        onClick={() => fitView()}
        className="p-1 rounded-md text-xs text-white  bg-zinc-800 hover:bg-zinc-700  transition-all duration-200 ease-in-out shadow hover:shadow-md "
        aria-label="Fit View"
      >
        <SlSizeActual />
      </button>

      {/* Lock/Unlock Toggle Button */}
      <button
        onClick={handleToggleLock}
        className={`p-1 rounded-md ${
          isLocked
            ? "bg-rose-800 hover:bg-rose-700"
            : "bg-zinc-800 hover:bg-zinc-700"
        } text-white transition-all duration-200 ease-in-out shadow hover:shadow-md `}
        aria-label={isLocked ? "Unlock Canvas" : "Lock Canvas"}
      >
        {isLocked ? <CiLock /> : <CiUnlock />}
      </button>
    </div>
  );
}