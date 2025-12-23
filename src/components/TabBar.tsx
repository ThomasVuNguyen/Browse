import { Plus } from 'lucide-react';
import { Tab } from './Tab';
import { WindowControls } from './WindowControls';
import { ResourceMonitor } from './ResourceMonitor';
import type { Tab as TabType, SystemStats } from '../types';

interface TabBarProps {
    tabs: TabType[];
    activeTabId: string;
    stats: SystemStats;
    onTabSelect: (id: string) => void;
    onTabClose: (e: React.MouseEvent, id: string) => void;
    onNewTab: () => void;
}

export function TabBar({
    tabs,
    activeTabId,
    stats,
    onTabSelect,
    onTabClose,
    onNewTab,
}: TabBarProps) {
    return (
        <div className="flex bg-gray-900 pt-2 px-2 draggable select-none">
            {/* Tabs Scroll Area */}
            <div className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar mask-gradient-right">
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        tab={tab}
                        isActive={activeTabId === tab.id}
                        onSelect={() => onTabSelect(tab.id)}
                        onClose={(e) => onTabClose(e, tab.id)}
                    />
                ))}
                <button
                    onClick={onNewTab}
                    className="p-1.5 ml-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors flex-shrink-0"
                    aria-label="New Tab"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-2 pl-2 mb-1 border-l border-gray-800 ml-2">
                <ResourceMonitor stats={stats} />
                <WindowControls />
            </div>
        </div>
    );
}
