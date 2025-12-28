import React from 'react';
import styles from '../ReaderView.module.css';

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
    onContextMenu
}) => {
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
                        {groupTranslation}
                    </span>
                )}

                {token}

                {isHovered && hoverTranslation && !isSelected && (
                    <span className={styles.hoverPopup}>{hoverTranslation}</span>
                )}
            </span>
        );
    };
