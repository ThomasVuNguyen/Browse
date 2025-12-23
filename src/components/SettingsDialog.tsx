import { X, Trash2, Power, Code, FileText } from 'lucide-react';
import type { CustomScript } from '../types';
import { useState } from 'react';

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    scripts: CustomScript[];
    onAddScript: (type: 'js' | 'css') => void;
    onUpdateScript: (id: string, updates: Partial<CustomScript>) => void;
    onDeleteScript: (id: string) => void;
    onToggleScript: (id: string) => void;
}

export function SettingsDialog({
    isOpen,
    onClose,
    scripts,
    onAddScript,
    onUpdateScript,
    onDeleteScript,
    onToggleScript,
}: SettingsDialogProps) {
    const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);

    if (!isOpen) return null;

    const selectedScript = scripts.find(s => s.id === selectedScriptId);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-gray-800 w-[80vw] h-[80vh] rounded-xl shadow-2xl flex border border-gray-700 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-700 flex flex-col bg-gray-900/50">
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h2 className="font-semibold text-white">Scripts</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onAddScript('js')}
                                className="p-1 hover:bg-gray-700 rounded text-yellow-400"
                                title="Add JS Script"
                            >
                                <Code size={18} />
                            </button>
                            <button
                                onClick={() => onAddScript('css')}
                                className="p-1 hover:bg-gray-700 rounded text-blue-400"
                                title="Add CSS Style"
                            >
                                <FileText size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {scripts.map(script => (
                            <div
                                key={script.id}
                                onClick={() => setSelectedScriptId(script.id)}
                                className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 group transition-colors ${selectedScriptId === script.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                                    }`}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleScript(script.id);
                                    }}
                                    className={`p-1 rounded-full ${script.enabled ? 'text-green-400 bg-green-400/10' : 'text-gray-500 bg-gray-700'
                                        }`}
                                >
                                    <Power size={14} />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-sm text-gray-200">{script.name}</div>
                                    <div className="text-xs text-gray-500 uppercase">{script.type}</div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteScript(script.id);
                                        if (selectedScriptId === script.id) setSelectedScriptId(null);
                                    }}
                                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 rounded transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}

                        {scripts.length === 0 && (
                            <div className="text-center text-gray-500 mt-10 text-sm">
                                No scripts yet.<br />Click + to add one.
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-gray-900">
                    {selectedScript ? (
                        <>
                            <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800">
                                <input
                                    type="text"
                                    value={selectedScript.name}
                                    onChange={(e) => onUpdateScript(selectedScript.id, { name: e.target.value })}
                                    className="bg-transparent text-lg font-medium outline-none text-white placeholder-gray-500"
                                    placeholder="Script Name"
                                />
                                <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 relative">
                                <textarea
                                    value={selectedScript.content}
                                    onChange={(e) => onUpdateScript(selectedScript.id, { content: e.target.value })}
                                    className="w-full h-full bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm resize-none outline-none"
                                    placeholder={`Enter your ${selectedScript.type.toUpperCase()} here...`}
                                    spellCheck={false}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Code size={32} />
                            </div>
                            <p>Select a script to edit</p>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-700 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
