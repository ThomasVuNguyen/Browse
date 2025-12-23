"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    min: () => electron_1.ipcRenderer.send('window-min'),
    max: () => electron_1.ipcRenderer.send('window-max'),
    close: () => electron_1.ipcRenderer.send('window-close'),
    onSystemStats: (callback) => {
        electron_1.ipcRenderer.on('system-stats', (_, value) => callback(value));
    }
});
//# sourceMappingURL=preload.js.map