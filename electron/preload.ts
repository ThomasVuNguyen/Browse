import { contextBridge, ipcRenderer } from 'electron';

interface SystemStats {
    cpu: number;
    mem: number;
}

contextBridge.exposeInMainWorld('electron', {
    min: () => ipcRenderer.send('window-min'),
    max: () => ipcRenderer.send('window-max'),
    close: () => ipcRenderer.send('window-close'),
    onSystemStats: (callback: (stats: SystemStats) => void) => {
        ipcRenderer.on('system-stats', (_, value) => callback(value));
    }
});
