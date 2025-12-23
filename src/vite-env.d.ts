/// <reference types="vite/client" />

declare global {
    namespace JSX {
        interface IntrinsicElements {
            webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { src?: string; allowpopups?: string; webpreferences?: string; partition?: string }, HTMLElement>;
        }
    }

    interface Window {
        electron: {
            min: () => void;
            max: () => void;
            close: () => void;
            onSystemStats: (callback: (stats: { cpu: number; mem: number; totalMemGb: string }) => void) => void;
        }
    }
}
