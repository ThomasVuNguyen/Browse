/** Represents a browser tab */
export interface Tab {
    id: string;
    title: string;
    url: string;
}

/** System resource stats from Electron main process */
export interface SystemStats {
    cpu: number;
    mem: number;
}

/** Electron webview element with navigation methods */
export interface WebviewElement {
    src: string;
    canGoBack: () => boolean;
    canGoForward: () => boolean;
    goBack: () => void;
    goForward: () => void;
    reload: () => void;
    reloadIgnoringCache: () => void;
    getTitle: () => string;
    getURL: () => string;
    addEventListener: (event: string, callback: () => void) => void;
    insertCSS: (css: string) => Promise<string>;
    removeInsertedCSS: (key: string) => Promise<void>;
    executeJavaScript: (code: string) => Promise<unknown>;
}

export interface CustomScript {
    id: string;
    name: string;
    type: 'js' | 'css';
    content: string;
    enabled: boolean;
}

/** Loaded Chrome extension info */
export interface LoadedExtension {
    id: string;
    name: string;
    version: string;
    path: string;
    enabled: boolean;
}

