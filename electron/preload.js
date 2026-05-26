const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wilds', {
  load:           ()          => ipcRenderer.invoke('save-load'),
  save:           (data)      => ipcRenderer.invoke('save-write', data),
  openGame:       ()          => ipcRenderer.send('open-game'),
  quit:           ()          => ipcRenderer.send('quit-app'),
  dragWidget:     (x, y)     => ipcRenderer.send('widget-drag', { x, y }),
  toggleOnTop:    (val)      => ipcRenderer.send('toggle-on-top', val),
  setDesktopMode: (val)      => ipcRenderer.send('set-desktop-mode', val),
  sinkToDesktop:  ()         => ipcRenderer.send('sink-to-desktop'),
});
