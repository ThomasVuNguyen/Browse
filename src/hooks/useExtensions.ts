import { useState, useEffect, useCallback } from 'react';
import type { LoadedExtension } from '../types';

interface UseExtensionsReturn {
    extensions: LoadedExtension[];
    isLoading: boolean;
    error: string | null;
    loadExtension: () => Promise<void>;
    installFromWebStore: (urlOrId: string) => Promise<boolean>;
    unloadExtension: (id: string) => Promise<void>;
    openPopup: (id: string) => Promise<void>;
    refreshExtensions: () => Promise<void>;
}

/**
 * Hook to manage Chrome extensions
 */
export function useExtensions(): UseExtensionsReturn {
    const [extensions, setExtensions] = useState<LoadedExtension[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch list of loaded extensions
    const refreshExtensions = useCallback(async () => {
        if (!window.electron?.extensions) return;

        try {
            const list = await window.electron.extensions.list();
            setExtensions(list);
        } catch (e) {
            console.error('Failed to fetch extensions:', e);
        }
    }, []);

    // Load extension via folder dialog
    const loadExtension = useCallback(async () => {
        if (!window.electron?.extensions) {
            setError('Extension API not available');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await window.electron.extensions.loadDialog();
            if (result.success) {
                await refreshExtensions();
            } else {
                setError(result.error || 'Failed to load extension');
            }
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [refreshExtensions]);

    // Install extension from Chrome Web Store URL or ID
    const installFromWebStore = useCallback(async (urlOrId: string): Promise<boolean> => {
        if (!window.electron?.extensions) {
            setError('Extension API not available');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await window.electron.extensions.installFromWebStore(urlOrId);
            if (result.success) {
                await refreshExtensions();
                return true;
            } else {
                setError(result.error || 'Failed to install extension');
                return false;
            }
        } catch (e) {
            setError((e as Error).message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [refreshExtensions]);

    // Unload an extension
    const unloadExtension = useCallback(async (id: string) => {
        if (!window.electron?.extensions) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await window.electron.extensions.unload(id);
            if (result.success) {
                await refreshExtensions();
            } else {
                setError(result.error || 'Failed to unload extension');
            }
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [refreshExtensions]);

    // Open extension popup
    const openPopup = useCallback(async (id: string) => {
        if (!window.electron?.extensions) return;

        try {
            await window.electron.extensions.openPopup(id);
        } catch (e) {
            console.error('Failed to open popup:', e);
        }
    }, []);

    // Load extensions list on mount
    useEffect(() => {
        refreshExtensions();
    }, [refreshExtensions]);

    return {
        extensions,
        isLoading,
        error,
        loadExtension,
        installFromWebStore,
        unloadExtension,
        openPopup,
        refreshExtensions,
    };
}

