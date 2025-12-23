import { Home } from 'lucide-react';
import type { Tab, WebviewElement } from '../types';

interface BrowserViewProps {
    tabs: Tab[];
    activeTabId: string;
    onWebviewRef: (id: string, el: WebviewElement | null) => void;
}

export function BrowserView({ tabs, activeTabId, onWebviewRef }: BrowserViewProps) {
    return (
        <div className="flex-1 relative bg-white">
            {tabs.map((tab) => (
                // @ts-expect-error: React types don't fully support webview element props
                <webview
                    key={tab.id}
                    ref={(el: WebviewElement | null) => onWebviewRef(tab.id, el)}
                    src={tab.url}
                    className="absolute top-0 w-full h-full bg-white"
                    style={{
                        left: activeTabId === tab.id ? '0' : '-9999px',
                        visibility: activeTabId === tab.id ? 'visible' : 'hidden',
                    }}
                    allowpopups="true"
                    partition="persist:main"
                />
            ))}

            {tabs.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 text-gray-400">
                    <div className="p-4 bg-gray-800 rounded-full mb-4">
                        <Home size={32} />
                    </div>
                    <p>No tabs open</p>
                </div>
            )}
        </div>
    );
}
