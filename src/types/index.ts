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
export interface WebviewElement extends HTMLElement {
    src: string;
    canGoBack: () => boolean;
    canGoForward: () => boolean;
    goBack: () => void;
    goForward: () => void;
    reload: () => void;
    getTitle: () => string;
    getURL: () => string;
    addEventListener: (event: string, callback: () => void) => void;
}
