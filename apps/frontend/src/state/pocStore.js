import { create } from 'zustand';
import { tauriAPI } from '../utils/tauri-api';

export const usePocStore = create((set, get) => ({
  testMessage: 'Loading...',
  isSyncing: false,

  // Initialize the store from Rust
  init: async () => {
    try {
      const state = await tauriAPI.state.getPocState();
      set({ testMessage: state.test_message });

      // Setup the event listener for cross-window sync
      const unlisten = await tauriAPI.state.listenToPocSync((payload) => {
        console.log('POC: Received sync event from Rust:', payload);
        // Only update if the message is different to avoid loops 
        // (though Rust broadcast should ideally be filtered or handled carefully)
        if (payload.test_message !== get().testMessage) {
          set({ testMessage: payload.test_message });
        }
      });

      return unlisten;
    } catch (error) {
      console.error('POC: Failed to initialize store:', error);
    }
  },

  // Update message with optimistic UI and Rust sync
  updateMessage: async (newMessage) => {
    const previousMessage = get().testMessage;

    // 1. Optimistic Update (Immediate UI feedback)
    set({ testMessage: newMessage, isSyncing: true });

    try {
      // 2. Sync to Rust (which will broadcast to other windows)
      await tauriAPI.state.updatePocState(newMessage);
      set({ isSyncing: false });
    } catch (error) {
      console.error('POC: Sync failed, rolling back:', error);
      // 3. Rollback on failure
      set({ testMessage: previousMessage, isSyncing: false });
    }
  },

  // Spawn a new POC window
  spawnWindow: async () => {
    try {
      await tauriAPI.state.spawnPocWindow();
    } catch (error) {
      console.error('POC: Failed to spawn window:', error);
    }
  }
}));
