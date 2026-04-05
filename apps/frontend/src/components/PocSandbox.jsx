import React, { useEffect } from 'react';
import { usePocStore } from '../state/pocStore';

const PocSandbox = () => {
  const { testMessage, isSyncing, init, updateMessage, spawnWindow } = usePocStore();

  useEffect(() => {
    // Initialize the store and listener
    const cleanupPromise = init();
    
    return () => {
      cleanupPromise.then(unlisten => {
        if (unlisten) unlisten();
      });
    };
  }, [init]);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] p-4 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-80 text-white font-sans">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Multi-Window POC</h3>
        {isSyncing && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Syncing to Rust..." />}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1 uppercase font-bold">Shared Message</label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => updateMessage(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Type something..."
          />
        </div>

        <button
          onClick={spawnWindow}
          className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          SPAWN TEST WINDOW
        </button>

        <p className="text-[10px] text-zinc-500 leading-tight">
          Updates made here are reflected instantly in all windows via Rust event broadcasting.
        </p>
      </div>
    </div>
  );
};

export default PocSandbox;
