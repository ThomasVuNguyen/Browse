import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    min: () => ipcRenderer.send('window-min'),
    max: () => ipcRenderer.send('window-max'),
    close: () => ipcRenderer.send('window-close'),
    onSystemStats: (callback: (stats: any) => void) => {
        ipcRenderer.on('system-stats', (_, value) => callback(value));
    }
});
