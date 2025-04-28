import React from 'react';

const ThreeDButton = ({ children, onClick, className = '', ...props }) => {
  return (
    <button
      className={`relative bg-zinc-900 rounded-xl border-none p-0 cursor-pointer outline-offset-4 ${className}`}
      onClick={onClick}
      {...props}
    >
      <span
        className="block px-2 py-1 rounded-xl text-sm  bg-zinc-700 text-white"
        style={{ transform: 'translateY(-6px)' }}
      >
        {children}
      </span>
    </button>
  );
};

export {ThreeDButton};
