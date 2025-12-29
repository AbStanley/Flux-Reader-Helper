import React from 'react';
import styles from '../ReaderView.module.css';
import { ReaderToken } from './ReaderToken';
import { HoverPosition } from '../../../../core/types';

import { useTranslationStore } from '../store/useTranslationStore';

interface ReaderTextContentProps {
    paginatedTokens: string[];
    currentPage: number;
    PAGE_SIZE: number;
    visualGroupStarts: Map<number, string>;
    groupStarts: Map<number, string>;
    tokenPositions: Map<number, string>;
    highlightIndices: Set<number>;
    textAreaRef: React.RefObject<HTMLDivElement | null>;
    handleTokenClick: (index: number) => void;
    onMoreInfoClick: (index: number) => void;
    onPlayClick: (index: number) => void;
}

export const ReaderTextContent: React.FC<ReaderTextContentProps> = ({
    paginatedTokens,
    currentPage,
    PAGE_SIZE,
    visualGroupStarts,
    groupStarts,
    tokenPositions,
    highlightIndices,
    textAreaRef,
    handleTokenClick,
    onMoreInfoClick,
    onPlayClick
}) => {
    // We can access hoveredIndex directly from store for the specific word highlight check
    // to avoid passing it down if strictly needed, or pass as prop if we prefer purity.
    // For specific word highlight 'isHoveredWord', we need the index.
    const hoveredIndex = useTranslationStore(s => s.hoveredIndex);

    return (
        <div
            ref={textAreaRef}
            className={`${styles.textArea} p-8 min-[1200px]:p-12 pb-12`}
        >
            {paginatedTokens.map((token, index) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                // Prefer visual split translation, fallback (should cover initial render) to basic group start
                const groupTranslation = visualGroupStarts.get(globalIndex) || groupStarts.get(globalIndex);
                const position = tokenPositions.get(globalIndex);

                // Calculate hover position
                let hoverPosition: HoverPosition | undefined;
                const isHoveredSentence = highlightIndices.has(globalIndex);
                const isHoveredWord = hoveredIndex === globalIndex;

                if (isHoveredSentence) {
                    const prev = highlightIndices.has(globalIndex - 1);
                    const next = highlightIndices.has(globalIndex + 1);

                    if (!prev && !next) hoverPosition = HoverPosition.Single;
                    else if (!prev && next) hoverPosition = HoverPosition.Start;
                    else if (prev && next) hoverPosition = HoverPosition.Middle;
                    else if (prev && !next) hoverPosition = HoverPosition.End;
                }

                return (
                    <ReaderToken
                        key={index}
                        index={index}
                        token={token}
                        groupTranslation={groupTranslation}
                        position={position}
                        isHovered={isHoveredSentence} // Now represents the full sentence hover
                        isHoveredWord={isHoveredWord} // Specific word
                        hoverPosition={hoverPosition}
                        onClick={handleTokenClick}
                        onMoreInfo={onMoreInfoClick}
                        onPlay={onPlayClick}
                    />
                );
            })}
        </div>
    );
};
