import { useState, useRef, useEffect, useCallback } from 'react';
import type { Tab, WebviewElement } from '../types';
import { DEFAULT_URL, DEFAULT_TAB_TITLE, SEARCH_URL } from '../constants';

interface UseTabsReturn {
    tabs: Tab[];
    activeTabId: string;
    activeTab: Tab | undefined;
    urlInput: string;
    webviewRefs: React.MutableRefObject<Record<string, WebviewElement | null>>;
    setActiveTabId: (id: string) => void;
    setUrlInput: (url: string) => void;
    createTab: () => void;
    closeTab: (e: React.MouseEvent, id: string) => void;
    handleNavigate: () => void;
    goBack: () => void;
    goForward: () => void;
    reload: () => void;
    handleWebviewRef: (id: string, el: WebviewElement | null) => void;
    reloadIgnoringCache: () => void;
}

/**
 * Hook to manage browser tabs, navigation, and webview references.
 */
export function useTabs(): UseTabsReturn {
    const [tabs, setTabs] = useState<Tab[]>([
        { id: '1', title: DEFAULT_TAB_TITLE, url: DEFAULT_URL }
    ]);
    const [activeTabId, setActiveTabId] = useState('1');
    const [urlInput, setUrlInput] = useState(DEFAULT_URL);
    const webviewRefs = useRef<Record<string, WebviewElement | null>>({});

    const activeTab = tabs.find((t) => t.id === activeTabId);

    // Update input when switching tabs
    useEffect(() => {
        if (activeTab) {
            setUrlInput(activeTab.url);
        }
    }, [activeTabId, activeTab]);

    const createTab = useCallback(() => {
        const newId = Date.now().toString();
        setTabs((prev) => [...prev, { id: newId, title: DEFAULT_TAB_TITLE, url: DEFAULT_URL }]);
        setActiveTabId(newId);
    }, []);

    const closeTab = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setTabs((prev) => {
            const newTabs = prev.filter((t) => t.id !== id);
            if (newTabs.length === 0) {
                // Create a new tab if all are closed
                const newId = Date.now().toString();
                return [{ id: newId, title: DEFAULT_TAB_TITLE, url: DEFAULT_URL }];
            }
            return newTabs;
        });

        setActiveTabId((currentActiveId) => {
            if (currentActiveId === id) {
                const remainingTabs = tabs.filter((t) => t.id !== id);
                return remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : Date.now().toString();
            }
            return currentActiveId;
        });
    }, [tabs]);

    const handleNavigate = useCallback(() => {
        if (!activeTab || !activeTabId) return;

        let url = urlInput;
        if (!url.startsWith('http')) {
            if (url.includes('.')) {
                url = 'https://' + url;
            } else {
                url = SEARCH_URL + encodeURIComponent(url);
            }
        }

        setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, url } : t)));
    }, [activeTab, activeTabId, urlInput]);

    const goBack = useCallback(() => {
        const wb = webviewRefs.current[activeTabId];
        if (wb && wb.canGoBack()) wb.goBack();
    }, [activeTabId]);

    const goForward = useCallback(() => {
        const wb = webviewRefs.current[activeTabId];
        if (wb && wb.canGoForward()) wb.goForward();
    }, [activeTabId]);

    const reload = useCallback(() => {
        const wb = webviewRefs.current[activeTabId];
        if (wb) wb.reload();
    }, [activeTabId]);

    const handleWebviewRef = useCallback((id: string, el: WebviewElement | null) => {
        webviewRefs.current[id] = el;
        if (!el) {
            return;
        }

        el.addEventListener('did-finish-load', () => {
            const title = el.getTitle();
            const url = el.getURL();
            setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, title, url } : t)));
            setActiveTabId((currentId) => {
                if (currentId === id) {
                    setUrlInput(url);
                }
                return currentId;
            });
        });
    }, []);

    const reloadIgnoringCache = useCallback(() => {
        const wb = webviewRefs.current[activeTabId];
        if (wb) wb.reloadIgnoringCache();
    }, [activeTabId]);

    return {
        tabs,
        activeTabId,
        activeTab,
        urlInput,
        webviewRefs,
        setActiveTabId,
        setUrlInput,
        createTab,
        closeTab,
        handleNavigate,
        goBack,
        goForward,
        reload,
        reloadIgnoringCache,
        handleWebviewRef,
    };
}
