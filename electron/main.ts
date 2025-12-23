import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
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

    // Window controls IPC
    const { ipcMain } = require('electron');
    ipcMain.on('window-min', () => mainWindow?.minimize());
    ipcMain.on('window-max', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow?.maximize();
        }
    });
    ipcMain.on('window-close', () => mainWindow?.close());

    // System Stats Interval
    const os = require('os');

    let cpuAvg = 0;
    let prevCpus = os.cpus();

    setInterval(async () => {
        if (!mainWindow) return;

        const metrics = app.getAppMetrics();
        // sum up memory and cpu from all processes
        // memory.workingSetSize is in KB
        const totalMemKB = metrics.reduce((acc, m) => acc + m.memory.workingSetSize, 0);
        const memMB = Math.round(totalMemKB / 1024);

        // percentCPUUsage is a percentage (e.g. 100 = 1 core)
        const totalCpu = metrics.reduce((acc, m) => acc + m.cpu.percentCPUUsage, 0);
        const cpuPercent = Math.round(totalCpu); // can be > 100 for multi-core

        mainWindow.webContents.send('system-stats', {
            cpu: cpuPercent,
            mem: memMB,
            totalMemGb: '0' // Unused now or can be removed in frontend
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
