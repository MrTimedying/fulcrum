import { useEffect, useCallback } from 'react';
import useTransientStore from '../state/transientState';

/**
 * This component does not render anything but initializes and manages
 * the application update-related event listeners.
 */
const UpdateManager = () => {
  const { 
    setUpdateAvailable, 
    setUpdateDownloaded, 
    setToaster 
  } = useTransientStore();

  // Function to check for updates
  const checkForUpdates = useCallback(async () => {
    if (!window.electronAPI) return;
    
    try {
      setToaster({
        type: 'info',
        message: 'Checking for updates...',
        show: true,
        duration: 3000,
      });
      
      const result = await window.electronAPI.updater.check();
      
      if (!result.updateAvailable) {
        setToaster({
          type: 'info',
          message: 'No updates available. You have the latest version.',
          show: true,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      setToaster({
        type: 'error',
        message: `Failed to check for updates: ${error.message || error}`,
        show: true,
        duration: 5000,
      });
    }
  }, [setToaster]);

  // Function to download an update
  const downloadUpdate = useCallback(async () => {
    if (!window.electronAPI) return;
    
    try {
      setToaster({
        type: 'info',
        message: 'Downloading update...',
        show: true,
        duration: 3000,
      });
      
      await window.electronAPI.updater.download();
    } catch (error) {
      console.error('Failed to download update:', error);
      setToaster({
        type: 'error',
        message: `Failed to download update: ${error.message || error}`,
        show: true,
        duration: 5000,
      });
    }
  }, [setToaster]);

  // Function to install the update
  const installUpdate = useCallback(() => {
    if (!window.electronAPI) return;
    window.electronAPI.updater.install();
  }, []);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Set up update event listeners
    const updateAvailableHandler = (info) => {
      console.log('Update available:', info);
      setUpdateAvailable(true, info);
      
      // Show a toaster notification
      setToaster({
        type: 'info',
        message: `Update available: v${info.version}. Go to Options > Updates to download.`,
        show: true,
        duration: 10000,
      });
    };

    const updateDownloadedHandler = (info) => {
      console.log('Update downloaded:', info);
      setUpdateDownloaded(true);
      
      // Show a toaster notification
      setToaster({
        type: 'success',
        message: 'Update downloaded. Restart the application to install.',
        show: true,
        duration: 15000,
      });
    };

    const updateErrorHandler = (error) => {
      console.error('Update error:', error);
      
      // Show a toaster notification
      setToaster({
        type: 'error',
        message: `Update error: ${error}`,
        show: true,
        duration: 5000,
      });
    };

    const updateProgressHandler = (progressObj) => {
      console.log('Update progress:', progressObj);
      // You can add UI to show download progress if desired
    };

    // Register all update-related listeners
    window.electronAPI.on('update-available', updateAvailableHandler);
    window.electronAPI.on('update-downloaded', updateDownloadedHandler);
    window.electronAPI.on('update-error', updateErrorHandler);
    window.electronAPI.on('update-progress', updateProgressHandler);

    // Check for updates on component mount (only in production)
    if (process.env.NODE_ENV === 'production') {
      // Delay the initial check to ensure app is fully loaded
      const timer = setTimeout(() => {
        checkForUpdates();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        window.electronAPI.removeAllListeners?.('update-available');
        window.electronAPI.removeAllListeners?.('update-downloaded');
        window.electronAPI.removeAllListeners?.('update-error');
        window.electronAPI.removeAllListeners?.('update-progress');
      };
    }
    
    return () => {
      window.electronAPI.removeAllListeners?.('update-available');
      window.electronAPI.removeAllListeners?.('update-downloaded');
      window.electronAPI.removeAllListeners?.('update-error');
      window.electronAPI.removeAllListeners?.('update-progress');
    };
  }, [setUpdateAvailable, setUpdateDownloaded, setToaster, checkForUpdates]);

  // Expose the update functions to the global window object
  // so they can be called from other components
  useEffect(() => {
    if (window) {
      window.updateFunctions = {
        checkForUpdates,
        downloadUpdate,
        installUpdate
      };
    }
    
    return () => {
      if (window) {
        delete window.updateFunctions;
      }
    };
  }, [checkForUpdates, downloadUpdate, installUpdate]);

  // This component doesn't render anything
  return null;
};

export default UpdateManager;