const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { fork } = require('child_process');

/* const sqlite3 = require('sqlite3').verbose(); */

let mainWindow;
let serverProcess;

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800, 
    minHeight: 600,
    frame: false, 
    webPreferences: {
      webSecurity: false,
      devTools: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

/*   const isDevelopment = process.env.NODE_ENV === 'development';
  const indexPath = isDevelopment
    ? `http://localhost:3000`
    : path.join(__dirname, '..', 'client', 'build', 'index.html'); */

  /* const indexPath = `http://localhost:3000`; */
  const indexPath = path.join(__dirname, '..', 'client', 'build', 'index.html');
  
  

  mainWindow.loadURL(indexPath);
  mainWindow.webContents.openDevTools();



  mainWindow.on('closed', function () {
    mainWindow = null;

    if (serverProcess) {
      serverProcess.kill();
    }
  });
}

app.whenReady().then(() => {
  const serverScriptPath = path.join(__dirname, '..', 'server', 'server.js');
    

  serverProcess = fork(serverScriptPath, [], { 
    silent: true,
    detached: true, 
      stdio: 'ignore',
      env:{
        ...process.env,
        PORT:8080
      }
   });
  

  serverProcess.on('message', (message) => {
    if (message === 'serverStarted') {
      // Child process has started successfully
      createWindow();
    } else {
      console.error('Unknown message from child process:', message);
    }
  });

});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
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
