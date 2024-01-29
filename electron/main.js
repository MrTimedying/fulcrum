const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  // Load the React app from the development server
  mainWindow.loadURL('http://localhost:3000'); // Change the URL based on your React app's port

  // Open the DevTools (remove this line for production)
  mainWindow.webContents.openDevTools();

  // Event handler when window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Event handler when Electron has finished initialization and is ready to create browser windows
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Create a new window when the app is activated (on macOS)
app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
