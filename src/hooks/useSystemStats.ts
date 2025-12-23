import { useState, useEffect } from 'react';
import type { SystemStats } from '../types';

const DEFAULT_STATS: SystemStats = { cpu: 0, mem: 0 };

/**
 * Hook to subscribe to system stats from the Electron main process.
 * Returns CPU percentage and memory usage in MB.
 */
export function useSystemStats(): SystemStats {
    const [stats, setStats] = useState<SystemStats>(DEFAULT_STATS);

    useEffect(() => {
        if (window.electron?.onSystemStats) {
            window.electron.onSystemStats((newStats) => setStats(newStats));
        }
    }, []);

    return stats;
}
