const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const { encrypt, decrypt, ensureEncryptionKey} = require('./encryptionUtils');
const { autoUpdater } = require('electron-updater');

/* const sqlite3 = require('sqlite3').verbose(); */

let mainWindow;

// Configure auto updater
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Set the feed URL for GitHub releases
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'MrTimedying',
  repo: 'fulcrumproject'
});

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
        pathname: path.join(__dirname, '..', 'build', 'index.html'),
        protocol: 'file:',
        slashes: true,
      });
  

  mainWindow.loadURL(indexPath);
  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Check for updates after window is created (but only in production)
  if (!isDevelopment) {
    setTimeout(() => {
      checkForUpdates();
    }, 3000); // Delay to ensure app is fully loaded
  }
}

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

// Update handlers with retry mechanism
function checkForUpdatesWithRetry(retries = 3) {
  let attempts = 0;
  
  function attempt() {
    attempts++;
    console.log(`Checking for updates (attempt ${attempts}/${retries})`);
    
    autoUpdater.checkForUpdates().catch(err => {
      console.error(`Error checking for updates (attempt ${attempts}/${retries}):`, err);
      
      if (attempts < retries) {
        console.log(`Retrying in 5 seconds...`);
        setTimeout(attempt, 5000);
      } else {
        console.error('Max retry attempts reached. Update check failed.');
        if (mainWindow) {
          mainWindow.webContents.send('update-error', 'Network error: Unable to check for updates after multiple attempts.');
        }
      }
    });
  }
  
  attempt();
}

function checkForUpdates() {
  checkForUpdatesWithRetry(3);
}

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

autoUpdater.on('update-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

autoUpdater.on('error', (err) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.toString());
  }
});

// IPC handlers for auto-updater
ipcMain.handle('check-for-updates', async () => {
  try {
    const checkResult = await autoUpdater.checkForUpdates();
    if (checkResult && checkResult.updateInfo) {
      return { 
        updateAvailable: true, 
        version: checkResult.updateInfo.version,
        info: checkResult.updateInfo
      };
    } else {
      return { updateAvailable: false };
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
    throw new Error(`Failed to check for updates: ${error.message}`);
  }
});

// Get app version for the renderer process
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Open external URLs (like GitHub releases page)
ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error('Error downloading update:', error);
    throw new Error(`Failed to download update: ${error.message}`);
  }
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall(true, true);
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