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

    setInterval(() => {
        if (!mainWindow) return;

        const cpus = os.cpus();
        let idle = 0;
        let total = 0;

        for (let i = 0; i < cpus.length; i++) {
            const cpu = cpus[i];
            const prevCpu = prevCpus[i];

            for (const type in cpu.times) {
                total += cpu.times[type] - prevCpu.times[type];
            }
            idle += cpu.times.idle - prevCpu.times.idle;
        }

        prevCpus = cpus;
        const usage = 1 - idle / total;
        const cpuPercent = Math.round(usage * 100);

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = Math.round((usedMem / totalMem) * 100);

        mainWindow.webContents.send('system-stats', {
            cpu: cpuPercent,
            mem: memPercent,
            totalMemGb: (totalMem / 1024 / 1024 / 1024).toFixed(1)
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
