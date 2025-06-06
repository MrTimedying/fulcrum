// Filename: flowControls.jsx
import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GoPlus } from "react-icons/go";
import { FiMinus } from "react-icons/fi";
import { SlSizeActual } from "react-icons/sl";
import { CiUnlock, CiLock, CiMenuBurger } from "react-icons/ci"; // Main Actions Menu Icon
import { IoIosColorPalette } from "react-icons/io"; // Style Menu Icon
import useFlowStore from "../../state/flowState"; // Import the flow store
import { FaArrowDown, FaArrowRight } from "react-icons/fa"; // Icons for layout buttons

export default function FlowControls({ setIsMainActionsMenuOpen, setIsStyleMenuOpen }) {
  const reactFlowInstance = useReactFlow();
  const { zoomIn, zoomOut, fitView } = reactFlowInstance;
  const [isLocked, setIsLocked] = useState(false);
  
  // Get the applyLayout function from the store
  const applyLayout = useFlowStore((state) => state.applyLayout);

  const handleToggleLock = () => {
    const newState = !isLocked;
    setIsLocked(newState);
    
    reactFlowInstance.setNodes((nodes) => {
      const updatedNodes = nodes.map((node) => ({
        ...node,
        draggable: !newState,
        selectable: !newState,
      }));
      return updatedNodes;
    });
  };

  const handleZoomIn = () => {
    try {
      zoomIn();
    } catch (error) {
      console.error("Error in zoomIn:", error);
    }
  };

  const handleZoomOut = () => {
    try {
      zoomOut();
    } catch (error) {
      console.error("Error in zoomOut:", error);
    }
  };

  const handleFitView = () => {
    try {
      fitView();
    } catch (error) {
      console.error("Error in fitView:", error);
    }
  };

  // Handler for the Style Menu button (IoIosColorPalette)
  const handleToggleStyleMenu = (e) => {
    e.stopPropagation();
    setIsStyleMenuOpen(prevStyleOpen => {
      const newStyleOpenState = !prevStyleOpen;
      if (newStyleOpenState) {
        setIsMainActionsMenuOpen(false); // Close Main Actions Menu if Style Menu is being opened
      }
      return newStyleOpenState;
    });
  };

  // Handler for the Main Actions Menu button (CiMenuBurger)
  const handleToggleMainActionsMenu = (e) => {
    e.stopPropagation();
    setIsMainActionsMenuOpen(prevMainActionsOpen => {
      const newMainActionsOpenState = !prevMainActionsOpen;
      if (newMainActionsOpenState) {
        setIsStyleMenuOpen(false); // Close Style Menu if Main Actions Menu is being opened
      }
      return newMainActionsOpenState;
    });
  };

  return (
    <div className="flex flex-row space-x-2 p-2 bg-white dark:bg-neutral-900 shadow-lg rounded-lg dark:shadow-xl transition-all duration-300 ease-in-out">
      {/* Group 1: View/Navigation Controls */}
      <div className="flex flex-row space-x-1">
        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          className="p-1 rounded-md text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200 ease-in-out shadow hover:shadow-md"
          aria-label="Zoom In"
        >
          <GoPlus />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          className="p-1 rounded-md text-xs text-white bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 ease-in-out shadow hover:shadow-md"
          aria-label="Zoom Out"
        >
          <FiMinus />
        </button>

        {/* Fit View Button */}
        <button
          onClick={handleFitView}
          className="p-1 rounded-md text-xs text-white bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 ease-in-out shadow hover:shadow-md"
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
          } text-white transition-all duration-200 ease-in-out shadow hover:shadow-md`}
          aria-label={isLocked ? "Unlock Canvas" : "Lock Canvas"}
        >
          {isLocked ? <CiLock /> : <CiUnlock />}
        </button>
      </div>

      {/* Group 2: Layout Controls */}
      <div className="flex flex-row space-x-1">
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
      </div>

      {/* Group 3: Menu Triggers */}
      <div className="flex flex-row space-x-1">
        {/* Style Menu Button */}
        <button
          onClick={handleToggleStyleMenu}
          className="p-1 rounded-md text-sm bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200 ease-in-out shadow hover:shadow-md menu-trigger"
          aria-label="Style Options"
          title="Style Options"
        >
          <IoIosColorPalette />
        </button>

        {/* Main Actions Menu Button */}
        <button
          onClick={handleToggleMainActionsMenu}
          className="p-1 rounded-md text-xs bg-zinc-800 hover:bg-zinc-700 text-white transition-all duration-200 ease-in-out shadow hover:shadow-md menu-trigger"
          aria-label="Main Actions"
          title="Main Actions"
        >
          <CiMenuBurger />
        </button>
      </div>
    </div>
  );
}