import React, { useState, useEffect } from 'react';
import { tauriAPI } from '../utils/tauri-api';

/**
 * This component does not render anything but initializes and manages
 * the application update-related event listeners.
 */
const UpdateManager = () => {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('idle'); // idle, checking, available, downloading, downloaded, error
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let cleanup;

    const setupListeners = async () => {
      try {
        cleanup = await tauriAPI.setupUpdateListeners({
          onUpdateAvailable: (info) => {
            console.log('Update available:', info);
            setUpdateInfo(info);
            setUpdateStatus('available');
            setIsVisible(true);
          },
          onUpdateNotAvailable: () => {
            console.log('No update available');
            setUpdateStatus('idle');
            setIsVisible(false);
          },
          onUpdateDownloaded: () => {
            console.log('Update downloaded');
            setUpdateStatus('downloaded');
            setDownloadProgress(100);
          },
          onUpdateError: (error) => {
            console.error('Update error:', error);
            setUpdateStatus('error');
            setIsVisible(true);
          },
          onUpdateProgress: (progressObj) => {
            console.log('Download progress:', progressObj.percent);
            setDownloadProgress(progressObj.percent);
            setUpdateStatus('downloading');
          }
        });
      } catch (error) {
        console.error('Failed to setup update listeners:', error);
      }
    };

    setupListeners();

    return () => {
      if (cleanup) {
        cleanup().catch(error => {
          console.error('Failed to cleanup update listeners:', error);
        });
      }
    };
  }, []);

  const checkForUpdates = async () => {
    if (!tauriAPI) return;
    
    setUpdateStatus('checking');
    setIsVisible(true);
    
    try {
      const result = await tauriAPI.updater.check();
      if (!result.updateAvailable) {
        setUpdateStatus('idle');
        setIsVisible(false);
      }
      // If update is available, the listener will handle showing the UI
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateStatus('error');
    }
  };

  const downloadUpdate = async () => {
    if (!tauriAPI) return;
    
    setUpdateStatus('downloading');
    setDownloadProgress(0);
    
    try {
      await tauriAPI.updater.download();
      // The listener will handle the downloaded event
    } catch (error) {
      console.error('Error downloading update:', error);
      setUpdateStatus('error');
    }
  };

  const installUpdate = async () => {
    if (!tauriAPI) return;
    
    try {
      await tauriAPI.updater.install();
    } catch (error) {
      console.error('Error installing update:', error);
      setUpdateStatus('error');
    }
  };

  const dismissNotification = () => {
    setIsVisible(false);
    setUpdateStatus('idle');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-zinc-800 border border-zinc-700 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-white">App Update</h3>
        <button
          onClick={dismissNotification}
          className="text-zinc-400 hover:text-white ml-2"
        >
          ✕
        </button>
      </div>

      {updateStatus === 'checking' && (
        <div className="text-sm text-zinc-300">
          Checking for updates...
        </div>
      )}

      {updateStatus === 'available' && updateInfo && (
        <div>
          <p className="text-sm text-zinc-300 mb-3">
            Version {updateInfo.version} is available
          </p>
          <button
            onClick={downloadUpdate}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
          >
            Download Update
          </button>
        </div>
      )}

      {updateStatus === 'downloading' && (
        <div>
          <p className="text-sm text-zinc-300 mb-2">
            Downloading update... {Math.round(downloadProgress)}%
          </p>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {updateStatus === 'downloaded' && (
        <div>
          <p className="text-sm text-zinc-300 mb-3">
            Update downloaded and ready to install
          </p>
          <button
            onClick={installUpdate}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md"
          >
            Restart & Install
          </button>
        </div>
      )}

      {updateStatus === 'error' && (
        <div>
          <p className="text-sm text-red-400 mb-3">
            Error occurred during update. Please try again.
          </p>
          <button
            onClick={checkForUpdates}
            className="w-full px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-md"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default UpdateManager;