import React, { memo } from 'react';
import styles from '../ReaderView.module.css';
import { cn } from '../../../../lib/utils';
import { HoverPosition } from '../../../../core/types';
import { ReaderTokenPopup } from './ReaderTokenPopup';
import { TokenText } from './TokenText';

interface ReaderTokenProps {
    token: string;
    index: number;
    globalIndex: number; // Passed from parent to avoid recalculation
    groupTranslation: string | undefined;
    position: string | undefined;

    // Hover State (Passed from parent)
    isHovered: boolean;
    isHoveredWord: boolean;
    hoverPosition?: HoverPosition;
    hoverTranslation?: string;

    // Audio State (Passed from parent)
    isAudioHighlighted: boolean;

    // Styling
    isTitle?: boolean;

    // Event Handlers
    onClick: (index: number) => void;
    onHover: (index: number) => void;
    onClearHover: () => void;
    onMoreInfo: (index: number, forceSingle?: boolean) => void;
    onPlay: (index: number, forceSingle?: boolean) => void;
    onSeek: (index: number) => void;
    onRegenerate: (index: number) => void;
}

const ReaderTokenComponent: React.FC<ReaderTokenProps> = ({
    token,
    index,
    globalIndex,
    groupTranslation,
    position,
    isHovered,
    isHoveredWord,
    hoverPosition,
    hoverTranslation,
    isAudioHighlighted,
    isTitle,
    onClick,
    onHover,
    onClearHover,
    onMoreInfo,
    onPlay,
    onSeek,
    onRegenerate
}) => {
    // Hide visual header markers (##, ###) completely
    const isHeaderMarker = /^#+$/.test(token.trim());
    if (isHeaderMarker) {
        return null; // Don't render
    }

    const isWhitespace = !token.trim();
    // Check if it contains newline
    const hasNewline = isWhitespace && token.includes('\n');

    const isSelected = !!position; // If position is assigned, it's selected/grouped

    const handleMouseEnter = () => {
        if (!isWhitespace) {
            onHover(index);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        if (!isWhitespace) {
            e.preventDefault();
            // Right click triggers specific word audio
            onPlay(index, true);
        }
    };

    if (hasNewline) {
        return <br />;
    }

    return (
        <span
            id={`token-${globalIndex}`}
            className={`
                ${styles.token} 
                ${isSelected ? styles.selected : ''} 
                ${!isWhitespace ? styles.interactive : ''}
                ${position ? styles[position] : ''} 
                ${groupTranslation ? styles.visualStart : ''}
                ${isAudioHighlighted ? styles.audioHighlight : ''}
                ${isHovered ? cn(
                styles.hoveredSentence,
                hoverPosition && styles[hoverPosition] // This handles border radius/shape for sentence
            ) : ''} 
                ${(isHoveredWord && !isSelected) ? styles.hoveredWord : ''}
                ${isHoveredWord ? styles.zIndexTop : ''}
                ${isTitle ? 'text-xl font-bold text-foreground inline-block my-2' : ''}
            `}
            onClick={() => {
                if (!isWhitespace) {
                    onClearHover();
                    onClick(index);
                }
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onClearHover}
            onDoubleClick={(e) => {
                // Double click gesture for audio seeking
                e.stopPropagation();
                if (!isWhitespace) {
                    onSeek(index);
                }
            }}
            onContextMenu={handleContextMenu}
            style={{ position: 'relative' }}
            tabIndex={0} // Allow focus to bring to front via CSS :focus-within
        >
            {groupTranslation && (
                <span className={styles.selectionPopupValid}>
                    <ReaderTokenPopup
                        translation={groupTranslation}
                        onPlay={() => onPlay(index, false)}
                        onMoreInfo={() => onMoreInfo(index, false)}
                        onRegenerate={() => onRegenerate(index)}
                    />
                </span>
            )}

            {/* Render token with markdown support */}
            <TokenText token={token} />

            {/* Show hover popup:
                - If NOT selected: Standard position (above).
                - If SELECTED: Show below to avoid clash with group translation + user request.
                - EXCEPTION: If selected is SINGLE word, disable below popup (green popup handles it).
             */}
            {(isHoveredWord) && hoverTranslation && !(isSelected && position === 'single') && (
                <span className={isSelected ? styles.hoverPopupBelow : styles.hoverPopup}>
                    <ReaderTokenPopup
                        translation={hoverTranslation}
                        onPlay={() => onPlay(index, true)}
                        onMoreInfo={() => onMoreInfo(index, true)}
                        onRegenerate={() => onRegenerate(index)}
                    />
                </span>
            )}
        </span>
    );
};

export const ReaderToken = memo(ReaderTokenComponent);
