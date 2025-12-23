"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electron', {
    // Window controls
    min: () => electron_1.ipcRenderer.send('window-min'),
    max: () => electron_1.ipcRenderer.send('window-max'),
    close: () => electron_1.ipcRenderer.send('window-close'),
    // System stats
    onSystemStats: (callback) => {
        electron_1.ipcRenderer.on('system-stats', (_, value) => callback(value));
    },
    security: {
        setIgnoreCertificateErrors: (enabled) => electron_1.ipcRenderer.invoke('security:set-ignore-certificate-errors', enabled),
    },
    // Extension APIs
    extensions: {
        load: (path) => electron_1.ipcRenderer.invoke('extension:load', path),
        loadDialog: () => electron_1.ipcRenderer.invoke('extension:load-dialog'),
        unload: (extensionId) => electron_1.ipcRenderer.invoke('extension:unload', extensionId),
        list: () => electron_1.ipcRenderer.invoke('extension:list'),
        openPopup: (extensionId) => electron_1.ipcRenderer.invoke('extension:open-popup', extensionId),
        getPopupUrl: (extensionId) => electron_1.ipcRenderer.invoke('extension:get-popup-url', extensionId),
        installFromWebStore: (urlOrId) => electron_1.ipcRenderer.invoke('extension:install-from-webstore', urlOrId),
    },
    // Extension events
    onExtensionCreateTab: (callback) => {
        electron_1.ipcRenderer.on('extension-create-tab', (_, url) => callback(url));
    },
});
//# sourceMappingURL=preload.js.map