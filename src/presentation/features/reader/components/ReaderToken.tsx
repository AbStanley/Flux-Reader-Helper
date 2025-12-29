import React from 'react';
import styles from '../ReaderView.module.css';

import { Search, Volume2 } from 'lucide-react'; // Import icon
import { cn } from '../../../../lib/utils';


interface ReaderTokenProps {
    token: string;
    index: number;
    isSelected: boolean;
    isHovered: boolean;
    isWhitespace: boolean;
    groupTranslation: string | undefined;
    position: string | undefined;
    hoverTranslation: string | null;
    onClick: (index: number) => void;
    onMouseEnter: (index: number) => void;
    onMouseLeave: () => void;
    onMoreInfo: (index: number) => void;
    onPlay: (index: number) => void; // New prop for audio
}

export const ReaderToken: React.FC<ReaderTokenProps & {
    isAudioHighlighted?: boolean;
    onContextMenu?: (index: number, e: React.MouseEvent) => void;
}> = ({
    token,
    index,
    isSelected,
    isHovered,
    isWhitespace,
    groupTranslation,
    position,
    hoverTranslation,
    isAudioHighlighted,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onContextMenu,
    onMoreInfo,
    onPlay
}) => {
        // Render helper for popup content
        const renderPopup = (translation: string) => {
            const buttonClass = cn(
                "ml-1 p-1 rounded-full cursor-pointer shadow-sm border border-white/10",
                "bg-white/20 hover:bg-white/30 text-white",
                "transition-all duration-300 ease-in-out",
                // Mobile: always visible
                "opacity-100 scale-100",
                // Desktop: hidden by default, visible on group hover
                "md:opacity-0 md:scale-75 md:w-0 md:p-0 md:ml-0",
                "md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:w-auto md:group-hover:p-1 md:group-hover:ml-1"
            );

            return (
                <span className="flex items-center group">
                    {translation}
                    <div className="flex items-center overflow-hidden transition-all duration-300 ease-in-out">
                        <button
                            className={buttonClass}
                            onClick={(e) => {
                                e.stopPropagation();
                                onPlay(index);
                            }}
                            title="Listen"
                        >
                            <Volume2 size={14} strokeWidth={3} />
                        </button>
                        <button
                            className={buttonClass}
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoreInfo(index);
                            }}
                            title="More Info"
                        >
                            <Search size={14} strokeWidth={3} />
                        </button>
                    </div>
                </span>
            );
        };

        return (
            <span
                className={`
                ${styles.token} 
                ${isSelected ? styles.selected : ''} 
                ${!isWhitespace ? styles.interactive : ''}
                ${position ? styles[position] : ''}
                ${isAudioHighlighted ? styles.audioHighlight : ''}
            `}
                onClick={() => !isWhitespace && onClick(index)}
                onMouseEnter={() => !isWhitespace && onMouseEnter(index)}
                onMouseLeave={onMouseLeave}
                onContextMenu={(e) => {
                    if (!isWhitespace && onContextMenu) {
                        onContextMenu(index, e);
                    }
                }}
                style={{ position: 'relative' }}
            >
                {groupTranslation && (
                    <span className={styles.selectionPopupValid}>
                        {renderPopup(groupTranslation)}
                    </span>
                )}

                {token}

                {isHovered && hoverTranslation && !isSelected && (
                    <span className={styles.hoverPopup}>
                        {renderPopup(hoverTranslation)}
                    </span>
                )}
            </span>
        );
    };
