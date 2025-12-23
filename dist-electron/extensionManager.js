"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initExtensionManager = initExtensionManager;
exports.loadExtensionFromPath = loadExtensionFromPath;
exports.unloadExtension = unloadExtension;
exports.getLoadedExtensions = getLoadedExtensions;
exports.getExtensionPopupUrl = getExtensionPopupUrl;
exports.openExtensionPopup = openExtensionPopup;
exports.getExtensionsManager = getExtensionsManager;
exports.installFromWebStore = installFromWebStore;
const electron_1 = require("electron");
const electron_chrome_extensions_1 = require("electron-chrome-extensions");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const adm_zip_1 = __importDefault(require("adm-zip"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetchExtensionZip } = require('chrome-extension-fetch');
let extensions = null;
let loadedExtensions = new Map();
let mainWindow = null;
// Get extensions storage directory
function getExtensionsDir() {
    const userDataPath = electron_1.app.getPath('userData');
    const extensionsDir = path.join(userDataPath, 'extensions');
    if (!fs.existsSync(extensionsDir)) {
        fs.mkdirSync(extensionsDir, { recursive: true });
    }
    return extensionsDir;
}
// Get downloads directory for CRX files
function getDownloadsDir() {
    const downloadsDir = path.join(getExtensionsDir(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }
    return downloadsDir;
}
// Get extensions config file path
function getConfigPath() {
    return path.join(getExtensionsDir(), 'extensions.json');
}
// Load extensions config from disk
function loadConfig() {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
        try {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        }
        catch (e) {
            console.error('Failed to load extensions config:', e);
        }
    }
    return [];
}
// Save extensions config to disk
function saveConfig() {
    const configPath = getConfigPath();
    const data = Array.from(loadedExtensions.values());
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}
/**
 * Initialize the extension manager
 * Must be called after app is ready and main window is created
 */
function initExtensionManager(win, createTabCallback) {
    mainWindow = win;
    // Create extensions instance for the persist:main partition
    extensions = new electron_chrome_extensions_1.ElectronChromeExtensions({
        license: 'GPL-3.0', // Required by electron-chrome-extensions
        session: electron_1.session.fromPartition('persist:main'),
        // Handle when extension wants to create a new tab
        createTab: async (details) => {
            const url = details.url || 'about:blank';
            createTabCallback(url);
            // Return the webContents of the main window for now
            // In a more complete implementation, we'd return the new tab's webContents
            return [mainWindow.webContents, mainWindow];
        },
        // Handle when extension wants to create a new window
        createWindow: async (details) => {
            const popup = new electron_1.BrowserWindow({
                width: details.width || 400,
                height: details.height || 600,
                parent: mainWindow || undefined,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true,
                    partition: 'persist:main',
                },
            });
            if (details.url) {
                popup.loadURL(details.url);
            }
            return popup;
        },
    });
    // Load previously saved extensions
    const savedExtensions = loadConfig();
    for (const ext of savedExtensions) {
        if (ext.enabled && fs.existsSync(ext.path)) {
            loadExtensionFromPath(ext.path).catch(console.error);
        }
    }
    return extensions;
}
/**
 * Load an unpacked extension from a directory path
 */
async function loadExtensionFromPath(extensionPath) {
    if (!extensions) {
        throw new Error('Extension manager not initialized');
    }
    // Check if manifest.json exists
    const manifestPath = path.join(extensionPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        throw new Error('No manifest.json found in extension directory');
    }
    try {
        // Read manifest to get extension info
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        // Load the extension
        const extension = await electron_1.session.fromPartition('persist:main').loadExtension(extensionPath, {
            allowFileAccess: true,
        });
        const info = {
            id: extension.id,
            name: manifest.name || extension.name,
            version: manifest.version || '1.0.0',
            path: extensionPath,
            enabled: true,
        };
        loadedExtensions.set(extension.id, info);
        saveConfig();
        console.log(`Loaded extension: ${info.name} v${info.version}`);
        return info;
    }
    catch (e) {
        console.error('Failed to load extension:', e);
        throw e;
    }
}
/**
 * Unload an extension by ID
 */
async function unloadExtension(extensionId) {
    const ext = loadedExtensions.get(extensionId);
    if (ext) {
        try {
            await electron_1.session.fromPartition('persist:main').removeExtension(extensionId);
            loadedExtensions.delete(extensionId);
            saveConfig();
            console.log(`Unloaded extension: ${ext.name}`);
        }
        catch (e) {
            console.error('Failed to unload extension:', e);
            throw e;
        }
    }
}
/**
 * Get list of all loaded extensions
 */
function getLoadedExtensions() {
    return Array.from(loadedExtensions.values());
}
/**
 * Get extension popup URL if available
 */
function getExtensionPopupUrl(extensionId) {
    const allExtensions = electron_1.session.fromPartition('persist:main').getAllExtensions();
    const ext = allExtensions.find(e => e.id === extensionId);
    if (ext && ext.manifest.action?.default_popup) {
        return `chrome-extension://${extensionId}/${ext.manifest.action.default_popup}`;
    }
    else if (ext && ext.manifest.browser_action?.default_popup) {
        return `chrome-extension://${extensionId}/${ext.manifest.browser_action.default_popup}`;
    }
    return null;
}
/**
 * Open extension popup in a new window
 */
function openExtensionPopup(extensionId) {
    const popupUrl = getExtensionPopupUrl(extensionId);
    if (!popupUrl) {
        return null;
    }
    const popup = new electron_1.BrowserWindow({
        width: 400,
        height: 600,
        frame: true,
        parent: mainWindow || undefined,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            partition: 'persist:main',
        },
    });
    popup.loadURL(popupUrl);
    return popup;
}
/**
 * Get the extensions manager instance
 */
function getExtensionsManager() {
    return extensions;
}
/**
 * Extract extension ID from Chrome Web Store URL or return as-is if already an ID
 */
function extractExtensionId(input) {
    // If it's a Chrome Web Store URL, extract the ID
    // URL format: https://chrome.google.com/webstore/detail/extension-name/EXTENSION_ID
    // or: https://chromewebstore.google.com/detail/extension-name/EXTENSION_ID
    const urlPatterns = [
        /chrome\.google\.com\/webstore\/detail\/[^\/]+\/([a-z]{32})/i,
        /chromewebstore\.google\.com\/detail\/[^\/]+\/([a-z]{32})/i,
        /chrome\.google\.com\/webstore\/detail\/([a-z]{32})/i,
        /chromewebstore\.google\.com\/detail\/([a-z]{32})/i,
    ];
    for (const pattern of urlPatterns) {
        const match = input.match(pattern);
        if (match) {
            return match[1];
        }
    }
    // If it looks like an extension ID (32 lowercase letters), return as-is
    if (/^[a-z]{32}$/.test(input)) {
        return input;
    }
    throw new Error('Invalid Chrome Web Store URL or extension ID');
}
/**
 * Install an extension from Chrome Web Store URL or extension ID
 */
async function installFromWebStore(urlOrId) {
    const extensionId = extractExtensionId(urlOrId);
    console.log(`Installing extension from Web Store: ${extensionId}`);
    const extractDir = path.join(getExtensionsDir(), extensionId);
    try {
        // Download using chrome-extension-fetch
        // Note: This package saves to an 'extensions' folder in the current working directory
        console.log('Downloading extension from Chrome Web Store...');
        const result = await fetchExtensionZip(extensionId);
        if (!result || !result.zipPath) {
            throw new Error('Failed to download extension');
        }
        // The paths returned are relative to cwd
        const zipPath = path.resolve(result.zipPath);
        const crxPath = result.crxPath ? path.resolve(result.crxPath) : null;
        console.log('Downloaded ZIP:', zipPath);
        // Verify the file exists
        if (!fs.existsSync(zipPath)) {
            throw new Error(`ZIP file not found at: ${zipPath}`);
        }
        // Extract the ZIP file
        console.log('Extracting extension...');
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true });
        }
        fs.mkdirSync(extractDir, { recursive: true });
        const zip = new adm_zip_1.default(zipPath);
        zip.extractAllTo(extractDir, true);
        // Clean up download files
        try {
            if (crxPath && fs.existsSync(crxPath)) {
                fs.unlinkSync(crxPath);
            }
            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }
            // Also try to clean up the 'extensions' folder created by the package
            const extensionsFolder = path.resolve('extensions');
            if (fs.existsSync(extensionsFolder)) {
                fs.rmSync(extensionsFolder, { recursive: true });
            }
        }
        catch (cleanupErr) {
            console.warn('Cleanup warning:', cleanupErr);
        }
        // Load the extracted extension
        console.log('Loading extracted extension...');
        return await loadExtensionFromPath(extractDir);
    }
    catch (e) {
        console.error('Failed to install extension from Web Store:', e);
        throw e;
    }
}
//# sourceMappingURL=extensionManager.js.map