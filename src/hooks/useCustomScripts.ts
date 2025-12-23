import { useState, useEffect } from 'react';
import type { CustomScript } from '../types';

export function useCustomScripts() {
    const [scripts, setScripts] = useState<CustomScript[]>(() => {
        const saved = localStorage.getItem('custom-scripts');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('custom-scripts', JSON.stringify(scripts));
    }, [scripts]);

    const addScript = (type: 'js' | 'css') => {
        const newScript: CustomScript = {
            id: crypto.randomUUID(),
            name: `New ${type.toUpperCase()} Script`,
            type,
            content: '',
            enabled: true,
        };
        setScripts([...scripts, newScript]);
    };

    const updateScript = (id: string, updates: Partial<CustomScript>) => {
        setScripts(scripts.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteScript = (id: string) => {
        setScripts(scripts.filter(s => s.id !== id));
    };

    const toggleScript = (id: string) => {
        setScripts(scripts.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    };

    return {
        scripts,
        addScript,
        updateScript,
        deleteScript,
        toggleScript,
    };
}
