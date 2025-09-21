// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('quokkaWindow', {
  setPassThrough: (enable, forward=true) =>
    ipcRenderer.send('hud:set-pass-through', { enable, forward })
});

contextBridge.exposeInMainWorld('quokkaNotify', {
  start: (opts) => ipcRenderer.invoke('notify:start', opts),
  stop:  ()     => ipcRenderer.invoke('notify:stop')
});