import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FiX, FiSettings, FiRefreshCw, FiInfo, FiShield } from "react-icons/fi";
import packageInfo from "../../../package.json";

// Make sure Modal is accessible
if (typeof window !== "undefined") {
  Modal.setAppElement(document.getElementById("root") || document.body);
}

const OptionsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [currentVersion, setCurrentVersion] = useState(packageInfo.version || "Unknown");
  const [latestVersion, setLatestVersion] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("idle"); // idle, checking, available, not-available, downloading, ready
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setUpdateStatus("idle");
      setLatestVersion(null);
      setUpdateInfo(null);
    }
  }, [isOpen]);

  // Listen for update events from main process
  useEffect(() => {
    if (window.electronAPI) {
      // Set up listeners for update events
      const updateAvailableListener = (info) => {
        setUpdateStatus("available");
        setLatestVersion(info.version);
        setUpdateInfo(info);
      };
      
      const updateNotAvailableListener = () => {
        setUpdateStatus("not-available");
      };
      
      const updateDownloadedListener = () => {
        setUpdateStatus("ready");
      };
      
      const updateErrorListener = (error) => {
        console.error("Update error:", error);
        setUpdateStatus("error");
      };
      
      const updateProgressListener = (progressObj) => {
        // You can add progress UI if needed
        console.log("Download progress:", progressObj.percent);
      };
      
      // Register listeners
      window.electronAPI.on("update-available", updateAvailableListener);
      window.electronAPI.on("update-not-available", updateNotAvailableListener);
      window.electronAPI.on("update-downloaded", updateDownloadedListener);
      window.electronAPI.on("update-error", updateErrorListener);
      window.electronAPI.on("update-progress", updateProgressListener);
      
      // Cleanup function
      return () => {
        // Remove listeners when component unmounts
        window.electronAPI.removeAllListeners?.("update-available");
        window.electronAPI.removeAllListeners?.("update-not-available");
        window.electronAPI.removeAllListeners?.("update-downloaded");
        window.electronAPI.removeAllListeners?.("update-error");
        window.electronAPI.removeAllListeners?.("update-progress");
      };
    }
  }, []);

  const checkForUpdates = async () => {
    setUpdateStatus("checking");
    try {
      // Call to Electron's IPC to check for updates
      const result = await window.electronAPI.invoke("check-for-updates");
      if (result.updateAvailable) {
        setUpdateStatus("available");
        setLatestVersion(result.version);
        setUpdateInfo(result.info);
      } else {
        setUpdateStatus("not-available");
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      setUpdateStatus("error");
    }
  };

  const downloadUpdate = async () => {
    setUpdateStatus("downloading");
    try {
      // Call to Electron's IPC to download the update
      await window.electronAPI.invoke("download-update");
      // The update-downloaded event will be triggered and handled by the event listener
    } catch (error) {
      console.error("Failed to download update", error);
      setUpdateStatus("error");
    }
  };

  const installUpdate = () => {
    // Call to Electron's IPC to quit and install
    window.electronAPI.invoke("quit-and-install");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="p-6 h-full flex flex-col">
            <h3 className="text-lg font-light text-gray-300 mb-4">General Settings</h3>
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex flex-col">
                <label className="text-sm font-light text-gray-400 mb-1">Application Theme</label>
                <select className="px-2 py-1 text-[11px] bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-colors">
                  <option value="dark">Dark (Default)</option>
                  <option value="light">Light</option>
                  <option value="system">System Preference</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="save-session"
                  className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <label htmlFor="save-session" className="text-sm text-gray-400 font-light">Remember session on close</label>
              </div>
            </div>
          </div>
        );
      
      case "updates":
        return (
          <div className="p-6 h-full flex flex-col">
            <h3 className="text-lg font-light text-gray-300 mb-4">Updates</h3>
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400 font-light">Current Version</span>
                  <span className="text-sm font-mono bg-zinc-700 px-2 py-1 rounded text-gray-300">{currentVersion}</span>
                </div>
                
                {updateStatus === "available" && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 font-light">Latest Version</span>
                    <span className="text-sm font-mono bg-zinc-700 px-2 py-1 rounded text-gray-300">{latestVersion}</span>
                  </div>
                )}
              </div>

              <div>
                {updateStatus === "idle" && (
                  <button 
                    onClick={checkForUpdates}
                    className="w-full py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md flex items-center justify-center text-sm font-light transition-colors duration-200"
                  >
                    <FiRefreshCw className="mr-2" /> Check for Updates
                  </button>
                )}
                
                {updateStatus === "checking" && (
                  <div className="text-center py-2 text-gray-400 text-sm font-light">
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Checking for updates...
                  </div>
                )}
                
                {updateStatus === "not-available" && (
                  <div className="text-center py-2 text-green-500 text-sm font-light">
                    ✓ You're using the latest version
                  </div>
                )}
                
                {updateStatus === "available" && (
                  <div className="space-y-4">
                    <div className="text-amber-500 text-sm font-light py-2">
                      ↑ Update available: {latestVersion}
                    </div>
                    
                    {updateInfo && updateInfo.releaseNotes && (
                      <div className="mt-4 p-3 bg-zinc-700 rounded-md overflow-y-auto max-h-48 border border-zinc-600">
                        <h4 className="text-sm font-medium mb-2 text-gray-300">Release Notes:</h4>
                        <div className="text-sm text-gray-400 whitespace-pre-line">
                          {updateInfo.releaseNotes}
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={downloadUpdate}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Download Update
                    </button>
                  </div>
                )}
                
                {updateStatus === "downloading" && (
                  <div className="text-center py-2 text-gray-400 text-sm font-light">
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Downloading update...
                  </div>
                )}
                
                {updateStatus === "ready" && (
                  <button 
                    onClick={installUpdate}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Restart & Install Update
                  </button>
                )}
                
                {updateStatus === "error" && (
                  <div className="text-center py-2 text-red-500 text-sm font-light">
                    Error checking for updates. Please try again later.
                  </div>
                )}
              </div>
              
              <div className="border-t border-zinc-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 font-light">Check for updates automatically</span>
                  <input
                    type="checkbox"
                    id="auto-update-check"
                    className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                    defaultChecked={true}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case "about":
        return (
          <div className="p-6 h-full flex flex-col">
            <h3 className="text-lg font-light text-gray-300 mb-4">About</h3>
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <h4 className="text-md font-medium text-gray-200">Fulcrum</h4>
                <p className="text-sm text-gray-400 font-light">Version {currentVersion}</p>
                <p className="text-sm mt-2 text-gray-400 font-light">{packageInfo.description}</p>
              </div>
              
              <div className="pt-2 border-t border-zinc-700">
                <p className="text-sm text-gray-400 font-light">Author: {packageInfo.author}</p>
                <p className="text-sm text-gray-400 font-light">License: {packageInfo.license}</p>
              </div>
              
              <div className="pt-2 border-t border-zinc-700">
                <p className="text-xs text-gray-500 font-light">
                  Fulcrum is an Electron application for healthcare professionals to create and manage exercise routines for patients.
                </p>
              </div>
            </div>
          </div>
        );
        
      case "security":
        return (
          <div className="p-6 h-full flex flex-col">
            <h3 className="text-lg font-light text-gray-300 mb-4">Security</h3>
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="encrypt-data"
                  className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                  defaultChecked={true}
                />
                <label htmlFor="encrypt-data" className="text-sm text-gray-400 font-light">Encrypt patient data</label>
              </div>
              
              <div>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm font-light transition-colors duration-200">
                  Change Encryption Key
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: { backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1000 },
        content: {
          background: "transparent",
          border: "none",
          padding: 0,
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "600px",
          overflow: "hidden",
        },
      }}
      contentLabel="Options"
    >
      <div className="flex h-full w-full rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
        {/* Sidebar */}
        <div className="w-48 bg-zinc-900 border-r border-zinc-800">
          <div className="bg-zinc-900 p-4 border-b border-zinc-800">
            <h2 className="text-lg font-light text-gray-200">@ Options</h2>
          </div>
          <nav className="p-1">
            <ul className="space-y-1">
              <li>
                <button
                  className={`w-full text-left px-3 py-1 rounded-sm flex items-center text-sm font-light transition-colors duration-200 ${
                    activeTab === "general"
                      ? "bg-zinc-800 text-white"
                      : "text-gray-300 hover:bg-zinc-700"
                  }`}
                  onClick={() => setActiveTab("general")}
                >
                  <FiSettings className="mr-2" /> General
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-3 py-1 rounded-sm flex items-center text-sm font-light transition-colors duration-200 ${
                    activeTab === "updates"
                      ? "bg-zinc-800 text-white"
                      : "text-gray-300 hover:bg-zinc-700"
                  }`}
                  onClick={() => setActiveTab("updates")}
                >
                  <FiRefreshCw className="mr-2" /> Updates
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-3 py-1 rounded-sm flex items-center text-sm font-light transition-colors duration-200 ${
                    activeTab === "security"
                      ? "bg-zinc-800 text-white"
                      : "text-gray-300 hover:bg-zinc-700"
                  }`}
                  onClick={() => setActiveTab("security")}
                >
                  <FiShield className="mr-2" /> Security
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-3 py-1 rounded-sm flex items-center text-sm font-light transition-colors duration-200 ${
                    activeTab === "about"
                      ? "bg-zinc-800 text-white"
                      : "text-gray-300 hover:bg-zinc-700"
                  }`}
                  onClick={() => setActiveTab("about")}
                >
                  <FiInfo className="mr-2" /> About
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-zinc-800 flex flex-col">
          {/* Header */}
          <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex justify-between items-center">
            <h3 className="text-lg font-light text-gray-300">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition duration-150"
              aria-label="Close modal"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OptionsModal; 