import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GoPlus } from "react-icons/go";
import { FiMinus } from "react-icons/fi";
import { SlSizeActual } from "react-icons/sl";
import { CiUnlock, CiLock, CiMenuBurger } from "react-icons/ci";
import { IoIosColorPalette } from "react-icons/io";


export default function FlowControls({setIsFeaturesMenuOpen, setIsStyleMenuOpen}) {
  const reactFlowInstance = useReactFlow();
  const { zoomIn, zoomOut, fitView } = reactFlowInstance;
  const [isLocked, setIsLocked] = useState(false);
  

  const handleToggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    
    // Use the proper method to set node draggable and elements selectable
    reactFlowInstance.setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        draggable: !newState,
        selectable: !newState,
      }))
    );
  };

  const toggleStyleMenu = (e) => {
    // Prevent event from bubbling up to document
    e.stopPropagation();
    // Toggle the menu state
    setIsFeaturesMenuOpen(prev => !prev);
  };

  const toggleFeaturesMenu = (e) => {
    // Prevent event from bubbling up to document
    e.stopPropagation();
    // Toggle the menu state
    setIsStyleMenuOpen(prev => !prev);
  };

  return (
    <div className="flex flex-row space-x-2 p-2 bg-white dark:bg-neutral-900 shadow-lg rounded-lg dark:shadow-xl transition-all duration-300 ease-in-out">
      {/* Features menu */}
      <button
        onClick={toggleStyleMenu}
        className="p-1 rounded-md text-sm bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200 ease-in-out shadow hover:shadow-md menu-trigger"
        aria-label="Style Menu"
      >
        <IoIosColorPalette />
        
      </button>

      <button
        onClick={toggleFeaturesMenu}
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
