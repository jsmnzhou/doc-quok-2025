const { app, BrowserWindow, screen, ipcMain } = require("electron");
import path from 'node:path';
import started from 'electron-squirrel-startup';

import { session } from "electron";

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === "media") {
      callback(true); // allow camera/mic
    } else {
      callback(false);
    }
  });
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    width,
    height,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // ensures media devices API works
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // when you create the window (after loadURL)
  mainWindow.webContents.on('did-finish-load', () => {
    // start in pass-through mode
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools({ mode: 'detach' });
  // mainWindow.setIgnoreMouseEvents(true, { forward: true });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      console.log("Permission requested:", permission);
      if (permission === "media") {
        callback(true); // allow camera/mic
      } else {
        callback(false);
      }
    }
  )

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('hud:set-pass-through', (e, { enable, forward=true }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (win) win.setIgnoreMouseEvents(enable, forward ? { forward: true } : undefined);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.  
