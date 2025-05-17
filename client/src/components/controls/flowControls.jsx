import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css"; // Ensure default React Flow styles are available

export default function FlowControls() {
    const { zoomIn, zoomOut, fitView, setInteractive } = useReactFlow();
    const [isLocked, setIsLocked] = useState(false);

    const handleToggleLock = () => {
        const newState = !isLocked;
        setIsLocked(newState);
        setInteractive(!newState);
    };

    return (
        <div className="flex flex-row space-x-2 p-2 bg-white dark:bg-neutral-900 shadow-lg rounded-lg dark:shadow-xl transition-all duration-300 ease-in-out">
            {/* Zoom In Button */}
            <button
                onClick={() => zoomIn()}
                className="p-1 rounded-md bg-indigo-600 text-xs text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                aria-label="Zoom In"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>

            {/* Zoom Out Button */}
            <button
                onClick={() => zoomOut()}
                className="p-1 rounded-md bg-indigo-600 text-xs text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                aria-label="Zoom Out"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                </svg>
            </button>

            {/* Fit View Button */}
            <button
                onClick={() => fitView()}
                className="p-1 rounded-md bg-indigo-600 text-xs text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                aria-label="Fit View"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18v-9" />
                </svg>
            </button>

            {/* Lock/Unlock Toggle Button */}
            <button
                onClick={handleToggleLock}
                className={`p-1 rounded-md ${isLocked ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500' : 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500'} text-white transition-all duration-200 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 ${isLocked ? 'focus:ring-red-500' : 'focus:ring-green-500'} focus:ring-opacity-50`}
                aria-label={isLocked ? "Unlock Canvas" : "Lock Canvas"}
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {isLocked ? (
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                         <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    )}
                </svg>
            </button>
        </div>
    );
}

