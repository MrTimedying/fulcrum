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

