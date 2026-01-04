import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Mode } from '../hooks/useAIHandler';

const LANGUAGES = [
    'English', 'Spanish', 'Russian', 'French', 'German', 'Italian',
    'Portuguese', 'Japanese', 'Chinese',
];

interface FluxPopupProps {
    selection: { text: string; x: number; y: number };
    result: string;
    loading: boolean;
    error: string | null;
    mode: Mode;
    targetLang: string;
    onModeChange: (mode: Mode) => void;
    onLangChange: (lang: string) => void;
    onAction: () => void;
    onClose: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export const FluxPopup: React.FC<FluxPopupProps> = ({
    selection,
    result,
    loading,
    error,
    mode,
    targetLang,
    onModeChange,
    onLangChange,
    onAction,
    onClose,
    onMouseEnter,
    onMouseLeave
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (result) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selection) {
            // @ts-ignore
            if (window.chrome?.storage?.local) {
                // @ts-ignore
                window.chrome.storage.local.set({ pendingText: selection.text }, () => {
                    // @ts-ignore
                    if (window.chrome?.runtime) {
                        // @ts-ignore
                        window.chrome.runtime.sendMessage({ type: 'TEXT_SELECTED', text: selection.text });
                        // @ts-ignore
                        window.chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
                    }
                });
            } else {
                // @ts-ignore
                if (window.chrome?.runtime) {
                    window.chrome.runtime.sendMessage({ type: 'TEXT_SELECTED', text: selection.text });
                    window.chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
                }
            }
        }
    };

    return (
        <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
                position: 'absolute',
                left: selection.x,
                top: selection.y,
                zIndex: 2147483647,
                fontFamily: 'Inter, system-ui, sans-serif'
            }}
            onMouseDown={e => e.stopPropagation()}
        >
            {/* Direct Popup View */}
            <div style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                width: '320px',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                fontSize: '14px',
                lineHeight: '1.5',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>Flux Analysis</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >✕</button>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                    {/* Row 1: Toggles & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Mode Toggle */}
                        <div style={{ background: '#334155', borderRadius: '6px', padding: '2px', display: 'flex' }}>
                            <button
                                onClick={() => onModeChange('EXPLAIN')}
                                style={{
                                    background: mode === 'EXPLAIN' ? '#475569' : 'transparent',
                                    color: mode === 'EXPLAIN' ? 'white' : '#94a3b8',
                                    border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                }}
                            >Explain</button>
                            <button
                                onClick={() => onModeChange('TRANSLATE')}
                                style={{
                                    background: mode === 'TRANSLATE' ? '#475569' : 'transparent',
                                    color: mode === 'TRANSLATE' ? 'white' : '#94a3b8',
                                    border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                }}
                            >Translate</button>
                        </div>

                        {/* Actions (Copy/Read) */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                                onClick={handleCopy}
                                title="Copy Result"
                                style={{
                                    background: '#334155', color: copied ? '#4ade80' : '#94a3b8', border: 'none',
                                    borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', minWidth: '28px', justifyContent: 'center'
                                }}
                            >
                                {copied ? (
                                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                )}
                            </button>

                            <button
                                onClick={handleSave}
                                title="Read in Flux"
                                style={{
                                    background: '#334155', color: '#94a3b8', border: 'none',
                                    borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* Row 2: Language & Go (Full Width) */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={targetLang}
                            onChange={(e) => onLangChange(e.target.value)}
                            style={{
                                flex: 1,
                                background: '#334155', color: 'white', border: 'none',
                                borderRadius: '6px', padding: '6px 12px', fontSize: '13px', outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>

                        <button
                            onClick={onAction}
                            style={{
                                background: '#3b82f6', color: 'white', border: 'none',
                                borderRadius: '6px', padding: '6px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '500'
                            }}
                        >
                            Go
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div>
                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', padding: '20px 0' }}>
                            <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                            Processing...
                        </div>
                    )}

                    {error && (
                        <div style={{ color: '#f87171', padding: '8px 0' }}>{error}</div>
                    )}

                    {!loading && !error && result && (
                        <div style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            background: '#0f172a',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            fontSize: '14px',
                            lineHeight: '1.6'
                        }}>
                            <ReactMarkdown
                                components={{
                                    // Override basic elements to ensure they look good with inline styles/Tailwind classes
                                    p: ({ node, ...props }) => <p style={{ marginBottom: '8px' }} {...props} />,
                                    ul: ({ node, ...props }) => <ul style={{ marginLeft: '16px', listStyleType: 'disc', marginBottom: '8px' }} {...props} />,
                                    ol: ({ node, ...props }) => <ol style={{ marginLeft: '16px', listStyleType: 'decimal', marginBottom: '8px' }} {...props} />,
                                    li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                                    strong: ({ node, ...props }) => <strong style={{ color: '#bae6fd', fontWeight: '600' }} {...props} />
                                }}
                            >
                                {result}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
