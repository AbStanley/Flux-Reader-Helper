import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, Volume2, RefreshCcw } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface ReaderTokenPopupProps {
    translation: string;
    onPlay: () => void;
    onMoreInfo: () => void;
    onRegenerate: () => void;
}

export const ReaderTokenPopup: React.FC<ReaderTokenPopupProps> = ({
    translation,
    onPlay,
    onMoreInfo,
    onRegenerate
}) => {
    const buttonClass = cn(
        "ml-1 p-1 rounded-full cursor-pointer shadow-sm border border-white/10",
        "bg-white/20 hover:bg-white/30 text-white",
        "transition-all duration-300 ease-in-out",
        // Mobile: always visible
        "opacity-100 scale-100",
        // Desktop: hidden by default, visible on group hover
        "min-[1200px]:opacity-0 min-[1200px]:scale-75 min-[1200px]:w-0 min-[1200px]:p-0 min-[1200px]:ml-0",
        "min-[1200px]:group-hover:opacity-100 min-[1200px]:group-hover:scale-100 min-[1200px]:group-hover:w-auto min-[1200px]:group-hover:p-1 min-[1200px]:group-hover:ml-1"
    );

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <span
            className="flex items-center group"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <ReactMarkdown>{translation}</ReactMarkdown>
            <div className="flex items-center overflow-hidden transition-all duration-300 ease-in-out">
                <button
                    className={buttonClass}
                    onClick={(e) => handleInteraction(e, onPlay)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Listen"
                >
                    <Volume2 size={14} strokeWidth={3} />
                </button>
                <button
                    className={buttonClass}
                    onClick={(e) => handleInteraction(e, onMoreInfo)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="More Info"
                >
                    <Search size={14} strokeWidth={3} />
                </button>
                <button
                    className={buttonClass}
                    onClick={(e) => handleInteraction(e, onRegenerate)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    title="Regenerate Translation"
                >
                    <RefreshCcw size={14} strokeWidth={3} />
                </button>
            </div>
        </span>
    );
};
