"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const extensionManager_1 = require("./extensionManager");
let mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        icon: path_1.default.join(__dirname, process.platform === 'win32' ? '../public/icon.ico' : '../public/icon.png'),
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true
        },
        autoHideMenuBar: true,
        frame: false,
    });
    const startUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : `file://${path_1.default.join(__dirname, '../dist/index.html')}`;
    mainWindow.loadURL(startUrl);
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Initialize extension manager
    (0, extensionManager_1.initExtensionManager)(mainWindow, (url) => {
        // Notify renderer to create a new tab with this URL
        mainWindow?.webContents.send('extension-create-tab', url);
    });
    // Window controls IPC
    electron_1.ipcMain.on('window-min', () => mainWindow?.minimize());
    electron_1.ipcMain.on('window-max', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        }
        else {
            mainWindow?.maximize();
        }
    });
    electron_1.ipcMain.on('window-close', () => mainWindow?.close());
    // Extension IPC handlers
    electron_1.ipcMain.handle('extension:load', async (_event, extensionPath) => {
        try {
            const ext = await (0, extensionManager_1.loadExtensionFromPath)(extensionPath);
            return { success: true, extension: ext };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    });
    electron_1.ipcMain.handle('extension:load-dialog', async () => {
        const result = await electron_1.dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            title: 'Select Extension Folder',
            buttonLabel: 'Load Extension',
        });
        if (result.canceled || result.filePaths.length === 0) {
            return { success: false, error: 'No folder selected' };
        }
        try {
            const ext = await (0, extensionManager_1.loadExtensionFromPath)(result.filePaths[0]);
            return { success: true, extension: ext };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    });
    electron_1.ipcMain.handle('extension:unload', async (_event, extensionId) => {
        try {
            await (0, extensionManager_1.unloadExtension)(extensionId);
            return { success: true };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    });
    electron_1.ipcMain.handle('extension:list', () => {
        return (0, extensionManager_1.getLoadedExtensions)();
    });
    electron_1.ipcMain.handle('extension:open-popup', (_event, extensionId) => {
        const popup = (0, extensionManager_1.openExtensionPopup)(extensionId);
        return { success: popup !== null };
    });
    electron_1.ipcMain.handle('extension:get-popup-url', (_event, extensionId) => {
        return (0, extensionManager_1.getExtensionPopupUrl)(extensionId);
    });
    electron_1.ipcMain.handle('extension:install-from-webstore', async (_event, urlOrId) => {
        try {
            const ext = await (0, extensionManager_1.installFromWebStore)(urlOrId);
            return { success: true, extension: ext };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    });
    // App metrics interval - sends CPU & memory stats to renderer
    setInterval(() => {
        if (!mainWindow)
            return;
        const metrics = electron_1.app.getAppMetrics();
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
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map