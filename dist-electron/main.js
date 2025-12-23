"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        icon: path_1.default.join(__dirname, '../public/icon.svg'),
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