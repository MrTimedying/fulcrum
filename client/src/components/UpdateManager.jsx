import { useEffect } from 'react';
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
        duration: 10000, // Show for 10 seconds
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
        duration: 15000, // Show for 15 seconds
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

    // Register all update-related listeners
    window.electronAPI.on('update-available', updateAvailableHandler);
    window.electronAPI.on('update-downloaded', updateDownloadedHandler);
    window.electronAPI.on('update-error', updateErrorHandler);

    // Clean up listeners when component unmounts
    return () => {
      window.electronAPI.removeAllListeners?.('update-available');
      window.electronAPI.removeAllListeners?.('update-downloaded');
      window.electronAPI.removeAllListeners?.('update-error');
    };
  }, [setUpdateAvailable, setUpdateDownloaded, setToaster]);

  // This component doesn't render anything
  return null;
};

export default UpdateManager; 