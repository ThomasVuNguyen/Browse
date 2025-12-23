/// <reference types="vite/client" />

import type { SystemStats, LoadedExtension } from './types';

interface ExtensionResult {
    success: boolean;
    extension?: LoadedExtension;
    error?: string;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            webview: React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    src?: string;
                    allowpopups?: string;
                    webpreferences?: string;
                    partition?: string;
                },
                HTMLElement
            >;
        }
    }

    interface Window {
        electron: {
            min: () => void;
            max: () => void;
            close: () => void;
            onSystemStats: (callback: (stats: SystemStats) => void) => void;

            // Extension APIs
            extensions: {
                load: (path: string) => Promise<ExtensionResult>;
                loadDialog: () => Promise<ExtensionResult>;
                unload: (extensionId: string) => Promise<{ success: boolean; error?: string }>;
                list: () => Promise<LoadedExtension[]>;
                openPopup: (extensionId: string) => Promise<{ success: boolean }>;
                getPopupUrl: (extensionId: string) => Promise<string | null>;
                installFromWebStore: (urlOrId: string) => Promise<ExtensionResult>;
            };

            // Extension events
            onExtensionCreateTab: (callback: (url: string) => void) => void;
        };
    }
}

export { };
