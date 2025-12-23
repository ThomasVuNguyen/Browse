import { Home } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { Tab, WebviewElement, CustomScript } from '../types';

interface BrowserViewProps {
    tabs: Tab[];
    activeTabId: string;
    onWebviewRef: (id: string, el: WebviewElement | null) => void;
    customScripts: CustomScript[];
}

export function BrowserView({ tabs, activeTabId, onWebviewRef, customScripts }: BrowserViewProps) {
    const webviewRefs = useRef<Record<string, WebviewElement | null>>({});
    // Track injected CSS keys: tabId -> scriptId -> key
    const cssKeysRef = useRef<Record<string, Record<string, string>>>({});

    const handleWebviewRefLocal = (id: string, el: WebviewElement | null) => {
        webviewRefs.current[id] = el;
        onWebviewRef(id, el);

        if (el) {
            el.addEventListener('dom-ready', () => {
                // Page reloaded, previous CSS is gone. Reset keys for this tab.
                cssKeysRef.current[id] = {};
                injectScripts(id, el, customScripts);
            });
        }
    };

    const injectScripts = async (tabId: string, webview: WebviewElement, scripts: CustomScript[]) => {
        // Initialize keys map for this tab if needed
        if (!cssKeysRef.current[tabId]) cssKeysRef.current[tabId] = {};

        for (const script of scripts) {
            if (script.enabled) {
                if (script.type === 'css') {
                    // Check if already injected (and remove if we want to update, but for now just add new)
                    // Better approach for updates: Remove old if exists, then add new.
                    const oldKey = cssKeysRef.current[tabId][script.id];
                    if (oldKey) {
                        try { await webview.removeInsertedCSS(oldKey); } catch (e) { /* ignore */ }
                    }

                    try {
                        const key = await webview.insertCSS(script.content);
                        cssKeysRef.current[tabId][script.id] = key;
                    } catch (err) {
                        console.error('Failed to inject CSS:', err);
                    }
                } else {
                    try { await webview.executeJavaScript(script.content); } catch (e) { /* ignore */ }
                }
            }
        }
    };

    // Handle script updates (add/remove/update)
    useEffect(() => {
        Object.entries(webviewRefs.current).forEach(async ([tabId, webview]) => {
            if (!webview) return;

            // 1. Identify scripts to remove (disabled or deleted)
            const activeKeys = cssKeysRef.current[tabId] || {};
            const currentScriptIds = new Set(customScripts.map(s => s.id));

            // Remove keys for deleted scripts
            for (const [scriptId, key] of Object.entries(activeKeys)) {
                const script = customScripts.find(s => s.id === scriptId);
                // If script is deleted OR disabled, remove CSS
                if (!script || !script.enabled) {
                    try {
                        await webview.removeInsertedCSS(key);
                        delete cssKeysRef.current[tabId][scriptId];
                    } catch (e) { /* ignore */ }
                }
            }

            // 2. Inject or Update scripts
            // We'll simplisticly re-inject everything that is enabled. 
            // The injectScripts function handles removing the old key if it exists for that scriptId.
            // This ensures content updates are applied.
            injectScripts(tabId, webview, customScripts);
        });
    }, [customScripts]);

    return (
        <div className="flex-1 relative bg-white">
            {tabs.map((tab) => (
                // @ts-expect-error: React types don't fully support webview element props
                <webview
                    key={tab.id}
                    ref={(el: WebviewElement | null) => handleWebviewRefLocal(tab.id, el)}
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
