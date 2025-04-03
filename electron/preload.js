const { contextBridge, ipcRenderer } = require('electron');

// Define all valid channels for IPC communication
const validChannels = [
  // Window controls
  'minimizeApp',
  'maximizeApp',
  'closeApp',
  // Component controls
  'minimizeComponent',
  'maximizeComponent',
  'closeComponent',
  // Component window management
  'open-specific-component',
  'render-component',
  // State management
  'request-state',
  'save-state'
];

// Expose all APIs under a single electronAPI object
contextBridge.exposeInMainWorld('electronAPI', {
  // Window control methods
  window: {
    minimize: () => ipcRenderer.send('minimizeApp'),
    maximize: () => ipcRenderer.send('maximizeApp'),
    close: () => ipcRenderer.send('closeApp'),
  },


  // State management methods
  state: {
    request: () => ipcRenderer.invoke('request-state'),
    save: (state) => ipcRenderer.invoke('save-state', state),
  },

  // Generic IPC communication
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // Handle responses from main process
  on: (channel, callback) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  // For one-time listeners
  once: (channel, callback) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (event, ...args) => callback(...args));
    }
  },

  // For request/response pattern
  invoke: (channel, ...args) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  }
});

