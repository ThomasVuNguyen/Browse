import { Cpu, MemoryStick } from 'lucide-react';
import type { SystemStats } from '../types';

interface ResourceMonitorProps {
    stats: SystemStats;
}

export function ResourceMonitor({ stats }: ResourceMonitorProps) {
    return (
        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono select-none px-2">
            <div className="flex items-center gap-1" title="App CPU Usage">
                <Cpu size={12} />
                <span>{stats.cpu}%</span>
            </div>
            <div className="flex items-center gap-1" title="App Memory Usage">
                <MemoryStick size={12} />
                <span>{stats.mem} MB</span>
            </div>
        </div>
    );
}
