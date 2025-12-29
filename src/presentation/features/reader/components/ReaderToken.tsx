import React from 'react';
import styles from '../ReaderView.module.css';

import { Search } from 'lucide-react'; // Import icon

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
    onMoreInfo: (index: number) => void; // New prop
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
    onMoreInfo
}) => {
        // Render helper for popup content
        const renderPopup = (translation: string) => (
            <span className="flex items-center gap-1" >
                {translation}
                <button
                    className="ml-1 p-0.5 hover:bg-white/20 rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMoreInfo(index); // Pass index so parent can resolve full text/context
                    }}
                    title="More Info"
                >
                    <Search size={12} />
                </button>
            </span>
        );

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
