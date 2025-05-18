import React, { useRef, useEffect } from 'react';

export default function PopPrimitive({children, isOpen, onClose}) {
    const wrapperRef = useRef(null);
    
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target) && 
                // Make sure we're not clicking on elements with menu-trigger class
                !event.target.closest('.menu-trigger')) {
                onClose();
            }
        }
        
        // Use mousedown for better detection
        if (isOpen) {
            // Use capture phase for more reliable detection
            document.addEventListener('mousedown', handleClickOutside, true);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
        };
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    return (
        <div 
            ref={wrapperRef} 
            className="relative flex flex-col bottom-[5px] left-0 z-10 bg-zinc-900 rounded-md h-full w-full transition-all duration-300 ease-in-out"
            // Prevent clicks inside from bubbling to document
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    )
}