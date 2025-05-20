// Filename: flowControls.jsx
import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GoPlus } from "react-icons/go";
import { FiMinus } from "react-icons/fi";
import { SlSizeActual } from "react-icons/sl";
import { CiUnlock, CiLock, CiMenuBurger } from "react-icons/ci"; // Features Menu Icon
import { IoIosColorPalette } from "react-icons/io"; // Style Menu Icon

export default function FlowControls({ setIsFeaturesMenuOpen, setIsStyleMenuOpen }) {
  const reactFlowInstance = useReactFlow();
  const { zoomIn, zoomOut, fitView } = reactFlowInstance;
  const [isLocked, setIsLocked] = useState(false);

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