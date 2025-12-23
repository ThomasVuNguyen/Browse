import { Minus, Square, X } from 'lucide-react';

export function WindowControls() {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => window.electron.min()}
                className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                aria-label="Minimize"
            >
                <Minus size={14} />
            </button>
            <button
                onClick={() => window.electron.max()}
                className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                aria-label="Maximize"
            >
                <Square size={12} />
            </button>
            <button
                onClick={() => window.electron.close()}
                className="p-1.5 hover:bg-red-500 rounded text-gray-400 hover:text-white"
                aria-label="Close"
            >
                <X size={14} />
            </button>
        </div>
    );
}
