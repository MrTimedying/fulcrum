// Tauri API wrapper for consistent usage across the frontend
// This provides a unified interface to Tauri APIs with proper error handling

class TauriAPI {
  constructor() {
    this.isInitialized = false;
    this.api = null;
    console.log('TauriAPI: Constructor called');
  }

  async init() {
    if (this.isInitialized) {
      console.log('TauriAPI: Already initialized, skipping.');
      return;
    }

    console.log('TauriAPI: Attempting initialization...');
    try {
      // Check if we're in a Tauri environment
      if (typeof window === 'undefined' || !window.__TAURI__) {
        console.warn('TauriAPI: Not running in Tauri environment or __TAURI__ not found');
        console.warn('TauriAPI: window object:', typeof window !== 'undefined' ? window : 'undefined');
        console.warn('TauriAPI: window.__TAURI__ object:', typeof window !== 'undefined' ? window.__TAURI__ : 'undefined');
        return;
      }

      // Import Tauri APIs using the correct v2 imports
      const { invoke } = await import('@tauri-apps/api/core');
      const { listen } = await import('@tauri-apps/api/event');
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      
      this.api = {
        invoke,
        listen,
        getCurrentWindow
      };

      this.isInitialized = true;
      console.log('TauriAPI: Successfully initialized');
    } catch (error) {
      console.error('TauriAPI: Failed to initialize:', error);
      this.isInitialized = false;
    }
  }

  // Window controls
  window = {
    minimize: async () => {
      console.log('TauriAPI: window.minimize called');
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      try {
        const window = this.api.getCurrentWindow();
        console.log('TauriAPI: Got current window object:', window.label);
        return await window.minimize();
      } catch (e) {
        console.error('TauriAPI: minimize failed:', e);
        throw e;
      }
    },

    maximize: async () => {
      console.log('TauriAPI: window.maximize called');
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      try {
        const window = this.api.getCurrentWindow();
        console.log('TauriAPI: Got current window object:', window.label);
        return await window.toggleMaximize();
      } catch (e) {
        console.error('TauriAPI: maximize failed:', e);
        throw e;
      }
    },

    close: async () => {
      console.log('TauriAPI: window.close called');
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      try {
        const window = this.api.getCurrentWindow();
        console.log('TauriAPI: Got current window object:', window.label);
        return await window.close();
      } catch (e) {
        console.error('TauriAPI: close failed:', e);
        throw e;
      }
    },

    isMaximized: async () => {
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      const window = this.api.getCurrentWindow();
      return await window.isMaximized();
    }
  };

  // App version
  getAppVersion = async () => {
    if (!this.api) await this.init();
    if (!this.api) throw new Error('TauriAPI not initialized');
    
    return await this.api.invoke('get_app_version');
  };

  // State management
  state = {
    request: async () => {
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      return await this.api.invoke('get_app_state');
    },

    save: async (state) => {
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      return await this.api.invoke('save_app_state', { appState: state });
    },

    // POC Methods
    getPocState: async () => {
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      return await this.api.invoke('get_poc_state');
    },

    updatePocState: async (testMessage) => {
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      return await this.api.invoke('update_poc_state', { testMessage });
    },

    spawnPocWindow: async () => {
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      return await this.api.invoke('spawn_poc_window');
    },

    listenToPocSync: async (callback) => {
      if (!this.api) await this.init();
      if (!this.api) throw new Error('TauriAPI not initialized');
      
      return await this.api.listen('poc-state-sync', (event) => {
        callback(event.payload);
      });
    }
  };

  // Update management  
  checkForUpdates = async () => {
    if (!this.api) await this.init();
    if (!this.api) throw new Error('TauriAPI not initialized');
    
    return await this.api.invoke('check_for_updates');
  };

  downloadUpdate = async () => {
    if (!this.api) await this.init();
    if (!this.api) throw new Error('TauriAPI not initialized');
    
    return await this.api.invoke('download_update');
  };

  quitAndInstall = async () => {
    if (!this.api) await this.init();
    if (!this.api) throw new Error('TauriAPI not initialized');
    
    return await this.api.invoke('quit_and_install');
  };

  // Event listeners for updates
  setupUpdateListeners = async (callbacks) => {
    if (!this.api) await this.init();
    if (!this.api) throw new Error('TauriAPI not initialized');

    const unlisteners = [];

    try {
      // Listen for update events
      if (callbacks.onUpdateAvailable) {
        const unlisten = await this.api.listen('update-available', (event) => {
          callbacks.onUpdateAvailable(event.payload);
        });
        unlisteners.push(unlisten);
      }

      if (callbacks.onUpdateDownloaded) {
        const unlisten = await this.api.listen('update-downloaded', (event) => {
          callbacks.onUpdateDownloaded(event.payload);
        });
        unlisteners.push(unlisten);
      }

      if (callbacks.onUpdateProgress) {
        const unlisten = await this.api.listen('update-progress', (event) => {
          callbacks.onUpdateProgress(event.payload);
        });
        unlisteners.push(unlisten);
      }

      if (callbacks.onUpdateError) {
        const unlisten = await this.api.listen('update-error', (event) => {
          callbacks.onUpdateError(event.payload);
        });
        unlisteners.push(unlisten);
      }

      // Return cleanup function
      return () => {
        unlisteners.forEach(unlisten => unlisten());
      };
    } catch (error) {
      console.error('TauriAPI: Failed to setup update listeners:', error);
      throw error;
    }
  };

  // Launch external URLs (placeholder for shell functionality)
  openUrl = async (url) => {
    if (!this.api) await this.init();
    if (!this.api) throw new Error('TauriAPI not initialized');
    
    // For now, use window.open as fallback
    // In the future, this would use shell API
    console.warn('TauriAPI: openUrl using fallback method');
    window.open(url, '_blank');
  };
}

// Export singleton instance
export const tauriAPI = new TauriAPI();

// Auto-initialize when imported
tauriAPI.init().catch(console.error); 