const { app, BrowserWindow, Notification, screen, ipcMain } = require("electron");
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
  // mainWindow.webContents.openDevTools({ mode: 'detach' });
  // mainWindow.setIgnoreMouseEvents(true, { forward: true });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // IPC endpoints
  ipcMain.handle('notify:start', (e, opts) => {
    startSchedule(e.sender.id, opts);
    return { ok: true };
  });
  ipcMain.handle('notify:stop',  (e) => {
    stopSchedule(e.sender.id);
    return { ok: true };
  });

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

app.on('before-quit', () => { for (const id of schedules.keys()) stopSchedule(id); });

ipcMain.on('hud:set-pass-through', (e, { enable, forward=true }) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (win) win.setIgnoreMouseEvents(enable, forward ? { forward: true } : undefined);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.  

const schedules = new Map(); // key: webContents.id -> timeout id

function randDelay(minMs, maxMs) {
  return Math.floor(minMs + Math.random() * Math.max(0, maxMs - minMs));
}

function showOsNotification({ title, body, hasReply = false, timeoutType }) {
  if (!Notification.isSupported()) return; // bail on unsupported OS
  const n = new Notification({
    title,
    body,
    hasReply,             // macOS only
    timeoutType,          // 'default' | 'never' on Windows/Linux
  });
  n.on('show',  () => console.log('[notify] show'));
  n.on('click', () => console.log('[notify] click'));
  n.on('close', () => console.log('[notify] close'));
  n.on('reply', (_e, reply) => console.log('[notify] reply:', reply)); // macOS
  n.show();
}

function startSchedule(senderId, opts) {
  stopSchedule(senderId);
  const {
    minMs = 5 * 60_000,
    maxMs = 10 * 60_000,
    title = 'Quokka',
    messages = ['Scan complete — all clear', 'Hydrate', 'Stretch break', '1 high-sev in quarantine'],
    hasReply = false,
    timeoutType, // e.g., 'default' on Windows/Linux
  } = opts || {};

  const tick = () => {
    const body = messages[Math.floor(Math.random() * messages.length)] || 'Hello';
    showOsNotification({ title, body, hasReply, timeoutType });
    const id = setTimeout(tick, randDelay(minMs, maxMs));
    schedules.set(senderId, id);
  };
  schedules.set(senderId, setTimeout(tick, randDelay(minMs, maxMs)));
}

function stopSchedule(senderId) {
  const t = schedules.get(senderId);
  if (t) clearTimeout(t);
  schedules.delete(senderId);
}