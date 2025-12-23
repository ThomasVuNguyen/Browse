import { X } from 'lucide-react';
import type { Tab as TabType } from '../types';

interface TabProps {
    tab: TabType;
    isActive: boolean;
    onSelect: () => void;
    onClose: (e: React.MouseEvent) => void;
}

export function Tab({ tab, isActive, onSelect, onClose }: TabProps) {
    return (
        <div
            onClick={onSelect}
            className={`
        group relative flex items-center min-w-[120px] max-w-[200px] h-9 px-3 rounded-t-lg cursor-pointer text-sm transition-colors no-drag
        ${isActive ? 'bg-gray-800 text-gray-100' : 'bg-gray-900 text-gray-400 hover:bg-gray-800/50'}
      `}
        >
            <div className="truncate flex-1 mr-2">{tab.title}</div>
            <button
                onClick={onClose}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all"
                aria-label={`Close ${tab.title}`}
            >
                <X size={12} />
            </button>
        </div>
    );
}
