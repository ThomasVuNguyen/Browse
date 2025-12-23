import { Puzzle } from 'lucide-react';
import type { LoadedExtension } from '../types';

interface ExtensionButtonProps {
    extension: LoadedExtension;
    onOpenPopup: (id: string) => void;
}

/**
 * Toolbar button for a loaded Chrome extension
 */
export function ExtensionButton({ extension, onOpenPopup }: ExtensionButtonProps) {
    return (
        <button
            onClick={() => onOpenPopup(extension.id)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors active:scale-95"
            title={`${extension.name} v${extension.version}`}
        >
            <Puzzle size={16} />
        </button>
    );
}
