import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
            <span className="text-sm">{message}</span>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
}
