/// <reference types="vite/client" />

import type { SystemStats } from './types';

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
        };
    }
}

export { };
