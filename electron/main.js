const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const crypto = require('crypto');
const { encrypt, decrypt, ensureEncryptionKey} = require('./encryptionUtils');

/* const sqlite3 = require('sqlite3').verbose(); */

let mainWindow;


function createWindow() {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800, 
    minHeight: 600,
    frame: false, 
    webPreferences: {
      webSecurity: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  const indexPath = isDevelopment
    ? 'http://localhost:3000' // Development URL
    : url.format({ // Production path
        pathname: path.join(__dirname, '..', 'client', 'build', 'index.html'),
        protocol: 'file:',
        slashes: true,
      });
  

  mainWindow.loadURL(indexPath);
  mainWindow.webContents.openDevTools();



  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

ipcMain.on('open-specific-component', (event) => {
  // Create component window if it doesn't exist
  if (!componentWindow) {
    componentWindow = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        devTools: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    componentWindow.webContents.openDevTools();

    const isDevelopment = process.env.NODE_ENV === 'development';
    const indexPath = isDevelopment
      ? 'http://localhost:3000'
      : url.format({
          pathname: path.join(__dirname, '..', 'client', 'build', 'index.html'),
          protocol: 'file:',
          slashes: true,
        });

    componentWindow.loadURL(`${indexPath}/#/composer`);

    // Clean up reference when window is closed
    componentWindow.on('closed', () => {
      componentWindow = null;
    });
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



let secretKeyPromise = ensureEncryptionKey();

async function saveState(state) {
  const secretKey = await secretKeyPromise;
  const encryptedState = encrypt(JSON.stringify(state), secretKey);
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, 'state', 'state.json');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(encryptedState)); 
  return true;
}


async function loadState() {
  const secretKey = await secretKeyPromise;
  const userDataPath = app.getPath('userData');
  const filePath = path.join(userDataPath, 'state', 'state.json');
  if (fs.existsSync(filePath)) {
    const encryptedState = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const decryptedState = decrypt(encryptedState, secretKey);
    return JSON.parse(decryptedState); 
  }
  return {}; 
}


ipcMain.handle('save-state', async (event, state) => {
 return await saveState(state);
});

ipcMain.handle('request-state', async (event) => {
  try {
    const loadedState = await loadState(); // Ensure this function is correctly imported or defined
    return loadedState; // This will be sent back to the renderer process
  } catch (error) {
    console.error("Failed to load state:", error);
    // Handle error appropriately, potentially sending back an empty object or error message
    return {};
  }
});


// Log messages for IPC events
ipcMain.on('minimizeApp', () => {
  console.log('Received minimizeApp event');
  mainWindow.minimize();
});

ipcMain.on('maximizeApp', () => {
  console.log('Received maximizeApp event');
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('closeApp', () => {
  console.log('Received closeApp event');
  mainWindow.close();
});

// Here I close the component window

ipcMain.on('minimizeComponent', () => {
  console.log('Received minimizeComponent event');
  componentWindow?.minimize();
});

ipcMain.on('maximizeComponent', () => {
  console.log('Received maximizeComponent event');
  if (componentWindow?.isMaximized()) {
    componentWindow.unmaximize();
  } else {
    componentWindow.maximize();
  }
});

ipcMain.on('closeComponent', () => {
  console.log('Received closeComponent event');
  componentWindow?.close();
});