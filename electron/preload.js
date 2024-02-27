const { contextBridge, ipcRenderer } = require('electron');

const validChannels = ['minimizeApp', 'maximizeApp', 'closeApp'];


contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage: (channel, args) => {
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, args);
      }
    },
  },
});

contextBridge.exposeInMainWorld('electronAPI', {
  // Existing method for requesting state...
  requestState: () => ipcRenderer.invoke('request-state'),
  // Method to save state
  saveState: (state) => ipcRenderer.invoke('save-state', state),
});

