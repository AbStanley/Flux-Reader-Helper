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
    // New:
    containerRef?: React.RefObject<HTMLDivElement | null>;
    groupEndId?: string;
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
    onRegenerate,
    containerRef,
    groupEndId,
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

    const tokenRef = React.useRef<HTMLSpanElement>(null);
    const popupContainerRef = React.useRef<HTMLSpanElement>(null);
    const [isRightAligned, setIsRightAligned] = React.useState(false);
    const [dynamicMarginTop, setDynamicMarginTop] = React.useState<number | undefined>(undefined);
    const [dynamicMaxWidth, setDynamicMaxWidth] = React.useState<number | undefined>(undefined);

    React.useLayoutEffect(() => {
        if ((groupTranslation || hoverTranslation) && tokenRef.current) {
            const rect = tokenRef.current.getBoundingClientRect();

            // Default to window bounds
            let rightEdge = window.innerWidth;
            let leftEdge = 0;

            if (containerRef?.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                rightEdge = containerRect.right;
                leftEdge = containerRect.left;
            }

            // 1. Calculate space available in container
            const containerPadding = 48; // ~3rem
            // Increased buffer to 40px to prevent horizontal scroll if content overflows slightly
            // (e.g. icons + long word)
            const internalPadding = 40;

            const spaceToRight = rightEdge - rect.left;

            // Refined Logic for Right Alignment
            // - If it's a GROUP translation (sentence), we prefer Left Alignment (growing right) 
            //   so it covers the sentence itself, rather than growing "backwards" (left) over previous text.
            //   Only switch to Right Alignment if we are extremely close to the edge (e.g. < 80px).
            // - If it's a Single Word popup, 350px is fine to avoid edge crowding.
            const threshold = groupTranslation ? 80 : 350;

            const isRight = spaceToRight < threshold;
            setIsRightAligned(isRight);

            const containerAvailable = isRight
                ? (rect.right - leftEdge - internalPadding - containerPadding)
                : (rightEdge - rect.left - internalPadding - containerPadding);

            // 2. Calculate Visual Group Width constraint
            // The popup should not ideally be wider than the sentence itself, but MUST be wide enough to be readable.
            let groupVisualWidth = 500; // Default fallback width
            if (groupEndId) {
                const endEl = document.getElementById(groupEndId);
                if (endEl) {
                    const endRect = endEl.getBoundingClientRect();
                    // If on same line, dist is straightforward. If wrapped, it's safer to use viewport/container width
                    const onSameLine = Math.abs(rect.top - endRect.top) < 20;

                    if (onSameLine) {
                        // + endRect.width to include the last word
                        groupVisualWidth = (endRect.left - rect.left) + endRect.width;
                    } else {
                        // Multiline: The sentence definitely spans full width, so allow full container width
                        groupVisualWidth = containerAvailable;
                    }
                }
            }

            // 3. Viewport Cap (Dynamic Soft Limit)
            // Instead of 350px, use percentage of viewport (e.g., 60%) to be "dynamic"
            const viewportSoftCap = window.innerWidth * 0.90;

            // Combine constraints:
            // - Can't exceed containerAvailable (Hard Limit)
            // - Can't exceed groupVisualWidth (Visual Preference) — BUT clamp this so it's not too small (e.g. <250px)
            // - Can't be unreasonably wide > viewportSoftCap

            // Allow effectively "Unbounded" up to container if multiline, or restricted to sentence width if single line.
            // Math.max(250) ensures that for very short words (e.g. "Cat"), we still get a usable popup.
            const visualConstraint = Math.max(250, groupVisualWidth);

            const finalWidth = Math.min(
                containerAvailable,
                visualConstraint,
                viewportSoftCap
            );

            // DEBUG LOGGING
            if (groupTranslation) {
                console.log('[ReaderToken] Width Calc:', {
                    containerAvailable,
                    groupVisualWidth,
                    viewportSoftCap,
                    finalWidth,
                    isRight
                });
            }

            setDynamicMaxWidth(Math.max(200, finalWidth));

            // Dynamic layout shift: Measure popup height and width
            // We use requestAnimationFrame or a brief timeout to ensure browser has painted the width change
            // before we measure height for margin-top. Actually useLayoutEffect should capture it if width set immediately?
            // Since we set width via state, it triggers re-render, so we might need another effect or rely on this one settling.
            // HOWEVER: We are setting state here. React will re-render.
            // On re-render, we need to measure height.
            // To avoid flickering, we can try to anticipate. But `offsetHeight` depends on text wrap.
            // We'll trust that the NEXT render measuring height will be correct or sufficient constant update.
        } else {
            setDynamicMarginTop(undefined);
            setDynamicMaxWidth(undefined);
        }
    }, [groupTranslation, hoverTranslation, isHovered, isSelected, containerRef, groupEndId]);

    // Height measurement effect (Separate to ensure it runs after width update)
    React.useLayoutEffect(() => {
        if (popupContainerRef.current && (groupTranslation || hoverTranslation)) {
            const height = popupContainerRef.current.offsetHeight;
            if (height > 0) {
                setDynamicMarginTop(height + 30);
            }
        }
    }, [dynamicMaxWidth, groupTranslation, hoverTranslation]);

    if (hasNewline) {
        return <br />;
    }

    return (
        <span
            ref={tokenRef}
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
            style={{
                position: 'relative',
                marginTop: dynamicMarginTop ? `${dynamicMarginTop}px` : undefined,
                transition: 'margin-top 0.2s ease-out'
            }}
            tabIndex={0} // Allow focus to bring to front via CSS :focus-within
        >
            {groupTranslation && (
                <span
                    ref={popupContainerRef}
                    className={cn(styles.selectionPopupValid, isRightAligned && styles.popupRight)}
                    style={{
                        maxWidth: dynamicMaxWidth ? `${dynamicMaxWidth}px` : undefined,
                    }}
                >
                    {/* DEBUG RENDER */}
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
                <span
                    className={cn(isSelected ? styles.hoverPopupBelow : styles.hoverPopup, isRightAligned && styles.popupRight)}
                    style={{ maxWidth: dynamicMaxWidth ? `${dynamicMaxWidth}px` : undefined }}
                >
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
