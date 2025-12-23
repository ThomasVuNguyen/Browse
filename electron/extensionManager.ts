import { session, BrowserWindow, app } from 'electron';
import { ElectronChromeExtensions } from 'electron-chrome-extensions';
import * as path from 'path';
import * as fs from 'fs';
import AdmZip from 'adm-zip';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fetchExtensionZip } = require('chrome-extension-fetch');

// Store extension state
interface ExtensionInfo {
    id: string;
    name: string;
    version: string;
    path: string;
    enabled: boolean;
}

let extensions: ElectronChromeExtensions | null = null;
let loadedExtensions: Map<string, ExtensionInfo> = new Map();
let mainWindow: BrowserWindow | null = null;

// Get extensions storage directory
function getExtensionsDir(): string {
    const userDataPath = app.getPath('userData');
    const extensionsDir = path.join(userDataPath, 'extensions');
    if (!fs.existsSync(extensionsDir)) {
        fs.mkdirSync(extensionsDir, { recursive: true });
    }
    return extensionsDir;
}

// Get downloads directory for CRX files
function getDownloadsDir(): string {
    const downloadsDir = path.join(getExtensionsDir(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir, { recursive: true });
    }
    return downloadsDir;
}

// Get extensions config file path
function getConfigPath(): string {
    return path.join(getExtensionsDir(), 'extensions.json');
}

// Load extensions config from disk
function loadConfig(): ExtensionInfo[] {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
        try {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load extensions config:', e);
        }
    }
    return [];
}

// Save extensions config to disk
function saveConfig(): void {
    const configPath = getConfigPath();
    const data = Array.from(loadedExtensions.values());
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

/**
 * Initialize the extension manager
 * Must be called after app is ready and main window is created
 */
export function initExtensionManager(
    win: BrowserWindow,
    createTabCallback: (url: string) => void
): ElectronChromeExtensions {
    mainWindow = win;

    // Create extensions instance for the persist:main partition
    extensions = new ElectronChromeExtensions({
        license: 'GPL-3.0', // Required by electron-chrome-extensions
        session: session.fromPartition('persist:main'),

        // Handle when extension wants to create a new tab
        createTab: async (details) => {
            const url = details.url || 'about:blank';
            createTabCallback(url);
            // Return the webContents of the main window for now
            // In a more complete implementation, we'd return the new tab's webContents
            return [mainWindow!.webContents, mainWindow!] as [Electron.WebContents, Electron.BaseWindow];
        },

        // Handle when extension wants to create a new window
        createWindow: async (details) => {
            const popup = new BrowserWindow({
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

            return popup as Electron.BaseWindow;
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
export async function loadExtensionFromPath(extensionPath: string): Promise<ExtensionInfo | null> {
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
        const extension = await session.fromPartition('persist:main').loadExtension(extensionPath, {
            allowFileAccess: true,
        });

        const info: ExtensionInfo = {
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
    } catch (e) {
        console.error('Failed to load extension:', e);
        throw e;
    }
}

/**
 * Unload an extension by ID
 */
export async function unloadExtension(extensionId: string): Promise<void> {
    const ext = loadedExtensions.get(extensionId);
    if (ext) {
        try {
            await session.fromPartition('persist:main').removeExtension(extensionId);
            loadedExtensions.delete(extensionId);
            saveConfig();
            console.log(`Unloaded extension: ${ext.name}`);
        } catch (e) {
            console.error('Failed to unload extension:', e);
            throw e;
        }
    }
}

/**
 * Get list of all loaded extensions
 */
export function getLoadedExtensions(): ExtensionInfo[] {
    return Array.from(loadedExtensions.values());
}

/**
 * Get extension popup URL if available
 */
export function getExtensionPopupUrl(extensionId: string): string | null {
    const allExtensions = session.fromPartition('persist:main').getAllExtensions();
    const ext = allExtensions.find(e => e.id === extensionId);

    if (ext && ext.manifest.action?.default_popup) {
        return `chrome-extension://${extensionId}/${ext.manifest.action.default_popup}`;
    } else if (ext && ext.manifest.browser_action?.default_popup) {
        return `chrome-extension://${extensionId}/${ext.manifest.browser_action.default_popup}`;
    }

    return null;
}

/**
 * Open extension popup in a new window
 */
export function openExtensionPopup(extensionId: string): BrowserWindow | null {
    const popupUrl = getExtensionPopupUrl(extensionId);
    if (!popupUrl) {
        return null;
    }

    const popup = new BrowserWindow({
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
export function getExtensionsManager(): ElectronChromeExtensions | null {
    return extensions;
}

/**
 * Extract extension ID from Chrome Web Store URL or return as-is if already an ID
 */
function extractExtensionId(input: string): string {
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
export async function installFromWebStore(urlOrId: string): Promise<ExtensionInfo | null> {
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

        const zip = new AdmZip(zipPath);
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
        } catch (cleanupErr) {
            console.warn('Cleanup warning:', cleanupErr);
        }

        // Load the extracted extension
        console.log('Loading extracted extension...');
        return await loadExtensionFromPath(extractDir);
    } catch (e) {
        console.error('Failed to install extension from Web Store:', e);
        throw e;
    }
}

