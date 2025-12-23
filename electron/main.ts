import { app, BrowserWindow, ipcMain, dialog, session } from 'electron';
import path from 'path';
import {
    initExtensionManager,
    loadExtensionFromPath,
    unloadExtension,
    getLoadedExtensions,
    openExtensionPopup,
    getExtensionPopupUrl,
    installFromWebStore,
} from './extensionManager';

let mainWindow: BrowserWindow | null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, process.platform === 'win32' ? '../public/icon.ico' : '../public/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true
        },
        autoHideMenuBar: true,
        frame: false,
    });

    const startUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Initialize extension manager
    initExtensionManager(mainWindow, (url: string) => {
        // Notify renderer to create a new tab with this URL
        mainWindow?.webContents.send('extension-create-tab', url);
    });

    // Window controls IPC
    ipcMain.on('window-min', () => mainWindow?.minimize());
    ipcMain.on('window-max', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow?.maximize();
        }
    });
    ipcMain.on('window-close', () => mainWindow?.close());

    ipcMain.handle('security:set-ignore-certificate-errors', (_event, enabled: boolean) => {
        try {
            const defaultSession = session.defaultSession;
            const mainSession = session.fromPartition('persist:main');
            const handler = (_request: unknown, callback: (result: number) => void) => {
                callback(enabled ? 0 : -3);
            };

            defaultSession.setCertificateVerifyProc(handler);
            mainSession.setCertificateVerifyProc(handler);
            return { success: true };
        } catch {
            return { success: false };
        }
    });


    // Extension IPC handlers
    ipcMain.handle('extension:load', async (_event, extensionPath: string) => {
        try {
            const ext = await loadExtensionFromPath(extensionPath);
            return { success: true, extension: ext };
        } catch (e) {
            return { success: false, error: (e as Error).message };
        }
    });

    ipcMain.handle('extension:load-dialog', async () => {
        const result = await dialog.showOpenDialog(mainWindow!, {
            properties: ['openDirectory'],
            title: 'Select Extension Folder',
            buttonLabel: 'Load Extension',
        });

        if (result.canceled || result.filePaths.length === 0) {
            return { success: false, error: 'No folder selected' };
        }

        try {
            const ext = await loadExtensionFromPath(result.filePaths[0]);
            return { success: true, extension: ext };
        } catch (e) {
            return { success: false, error: (e as Error).message };
        }
    });

    ipcMain.handle('extension:unload', async (_event, extensionId: string) => {
        try {
            await unloadExtension(extensionId);
            return { success: true };
        } catch (e) {
            return { success: false, error: (e as Error).message };
        }
    });

    ipcMain.handle('extension:list', () => {
        return getLoadedExtensions();
    });

    ipcMain.handle('extension:open-popup', (_event, extensionId: string) => {
        const popup = openExtensionPopup(extensionId);
        return { success: popup !== null };
    });

    ipcMain.handle('extension:get-popup-url', (_event, extensionId: string) => {
        return getExtensionPopupUrl(extensionId);
    });

    ipcMain.handle('extension:install-from-webstore', async (_event, urlOrId: string) => {
        try {
            const ext = await installFromWebStore(urlOrId);
            return { success: true, extension: ext };
        } catch (e) {
            return { success: false, error: (e as Error).message };
        }
    });

    // App metrics interval - sends CPU & memory stats to renderer
    setInterval(() => {
        if (!mainWindow) return;

        const metrics = app.getAppMetrics();
        // Sum up memory and CPU from all processes
        // memory.workingSetSize is in KB
        const totalMemKB = metrics.reduce((acc, m) => acc + m.memory.workingSetSize, 0);
        const memMB = Math.round(totalMemKB / 1024);

        // percentCPUUsage is a percentage (e.g. 100 = 1 core)
        const totalCpu = metrics.reduce((acc, m) => acc + m.cpu.percentCPUUsage, 0);
        const cpuPercent = Math.round(totalCpu);

        mainWindow.webContents.send('system-stats', {
            cpu: cpuPercent,
            mem: memMB,
        });
    }, 1000);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
