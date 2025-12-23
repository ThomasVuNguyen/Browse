import { useState } from 'react';
import { Trash2, Puzzle, FolderOpen, AlertCircle, Download, Globe, Loader2 } from 'lucide-react';
import type { LoadedExtension } from '../types';

interface ExtensionManagerProps {
    extensions: LoadedExtension[];
    isLoading: boolean;
    error: string | null;
    onLoadExtension: () => Promise<void>;
    onInstallFromWebStore: (urlOrId: string) => Promise<boolean>;
    onUnloadExtension: (id: string) => Promise<void>;
}

/**
 * Extension management panel for the settings dialog
 */
export function ExtensionManager({
    extensions,
    isLoading,
    error,
    onLoadExtension,
    onInstallFromWebStore,
    onUnloadExtension,
}: ExtensionManagerProps) {
    const [webStoreUrl, setWebStoreUrl] = useState('');
    const [isInstalling, setIsInstalling] = useState(false);

    const handleInstallFromWebStore = async () => {
        if (!webStoreUrl.trim()) return;

        setIsInstalling(true);
        const success = await onInstallFromWebStore(webStoreUrl.trim());
        if (success) {
            setWebStoreUrl('');
        }
        setIsInstalling(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Puzzle size={20} className="text-purple-400" />
                    <h2 className="font-semibold text-white">Extensions</h2>
                </div>
                <button
                    onClick={onLoadExtension}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                    <FolderOpen size={14} />
                    Load Unpacked
                </button>
            </div>

            {/* Install from Web Store */}
            <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                    <Globe size={16} className="text-blue-400" />
                    <span className="text-sm font-medium text-white">Install from Chrome Web Store</span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={webStoreUrl}
                        onChange={(e) => setWebStoreUrl(e.target.value)}
                        placeholder="Paste Chrome Web Store URL or extension ID..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleInstallFromWebStore()}
                    />
                    <button
                        onClick={handleInstallFromWebStore}
                        disabled={isLoading || isInstalling || !webStoreUrl.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                    >
                        {isInstalling ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Download size={14} />
                        )}
                        Install
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Example: https://chromewebstore.google.com/detail/extension-name/abcdefghijklmnopqrstuvwxyzabcdef
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Extensions list */}
            <div className="flex-1 overflow-y-auto p-4">
                {extensions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Puzzle size={32} />
                        </div>
                        <p className="text-center">No extensions installed</p>
                        <p className="text-center text-sm mt-1 text-gray-600">
                            Install from Chrome Web Store or load an unpacked extension
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {extensions.map((ext) => (
                            <div
                                key={ext.id}
                                className="p-4 bg-gray-800 rounded-lg flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                        <Puzzle size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{ext.name}</div>
                                        <div className="text-xs text-gray-500">
                                            v{ext.version} • {ext.enabled ? 'Enabled' : 'Disabled'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onUnloadExtension(ext.id)}
                                    disabled={isLoading}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                    title="Remove extension"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer info */}
            <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
                <p className="font-medium text-gray-400 mb-1">⚠️ Limitations:</p>
                <ul className="list-disc ml-4 space-y-0.5">
                    <li>Some extensions may not work fully (especially password managers)</li>
                    <li>Manifest V3 extensions have limited support</li>
                </ul>
            </div>
        </div>
    );
}
