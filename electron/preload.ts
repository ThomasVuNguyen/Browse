import { contextBridge, ipcRenderer } from 'electron';

interface SystemStats {
    cpu: number;
    mem: number;
}

interface LoadedExtension {
    id: string;
    name: string;
    version: string;
    path: string;
    enabled: boolean;
}

interface ExtensionResult {
    success: boolean;
    extension?: LoadedExtension;
    error?: string;
}

contextBridge.exposeInMainWorld('electron', {
    // Window controls
    min: () => ipcRenderer.send('window-min'),
    max: () => ipcRenderer.send('window-max'),
    close: () => ipcRenderer.send('window-close'),

    // System stats
    onSystemStats: (callback: (stats: SystemStats) => void) => {
        ipcRenderer.on('system-stats', (_, value) => callback(value));
    },

    security: {
        setIgnoreCertificateErrors: (enabled: boolean): Promise<{ success: boolean }> =>
            ipcRenderer.invoke('security:set-ignore-certificate-errors', enabled),
    },


    // Extension APIs
    extensions: {
        load: (path: string): Promise<ExtensionResult> =>
            ipcRenderer.invoke('extension:load', path),

        loadDialog: (): Promise<ExtensionResult> =>
            ipcRenderer.invoke('extension:load-dialog'),

        unload: (extensionId: string): Promise<{ success: boolean; error?: string }> =>
            ipcRenderer.invoke('extension:unload', extensionId),

        list: (): Promise<LoadedExtension[]> =>
            ipcRenderer.invoke('extension:list'),

        openPopup: (extensionId: string): Promise<{ success: boolean }> =>
            ipcRenderer.invoke('extension:open-popup', extensionId),

        getPopupUrl: (extensionId: string): Promise<string | null> =>
            ipcRenderer.invoke('extension:get-popup-url', extensionId),

        installFromWebStore: (urlOrId: string): Promise<ExtensionResult> =>
            ipcRenderer.invoke('extension:install-from-webstore', urlOrId),
    },

    // Extension events
    onExtensionCreateTab: (callback: (url: string) => void) => {
        ipcRenderer.on('extension-create-tab', (_, url) => callback(url));
    },
});
