import type { KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, Search } from 'lucide-react';

interface NavigationBarProps {
    urlInput: string;
    onUrlChange: (url: string) => void;
    onNavigate: () => void;
    onBack: () => void;
    onForward: () => void;
    onReload: () => void;
}

export function NavigationBar({
    urlInput,
    onUrlChange,
    onNavigate,
    onBack,
    onForward,
    onReload,
}: NavigationBarProps) {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') onNavigate();
    };

    return (
        <div className="h-14 bg-gray-800 flex items-center px-4 gap-3 border-b border-gray-700 shadow-sm z-10">
            <div className="flex items-center gap-1">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors active:scale-95"
                    aria-label="Go Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <button
                    onClick={onForward}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors active:scale-95"
                    aria-label="Go Forward"
                >
                    <ArrowRight size={18} />
                </button>
                <button
                    onClick={onReload}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors active:scale-95"
                    aria-label="Reload"
                >
                    <RotateCcw size={16} />
                </button>
            </div>

            <div className="flex-1 flex items-center bg-gray-900/50 rounded-full px-4 h-9 border border-transparent focus-within:border-blue-500/50 focus-within:bg-gray-900 transition-all">
                <Search size={14} className="text-gray-500 mr-3" />
                <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => onUrlChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={(e) => e.target.select()}
                    placeholder="Search or enter website name"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-500 w-full"
                />
            </div>
        </div>
    );
}
