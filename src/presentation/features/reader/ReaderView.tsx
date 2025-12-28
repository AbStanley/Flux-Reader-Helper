import React from 'react';
import styles from './ReaderView.module.css';
import { Card, CardContent } from "../../components/ui/card";
import { useReader } from './hooks/useReader';
import { ReaderPagination } from './components/ReaderPagination';
import { ReaderToken } from './components/ReaderToken';

import { useAudioStore } from './store/useAudioStore';
import { PlayerControls } from './components/PlayerControls';

export const ReaderView: React.FC = () => {
    const {
        paginatedTokens,
        currentPage,
        totalPages,
        selectedIndices,
        hoveredIndex,
        hoverTranslation,
        selectionTranslations,
        PAGE_SIZE,
        setCurrentPage,
        handleTokenClick,
        handleMouseEnter,
        handleMouseLeave,
        getSelectionGroups
    } = useReader();

    // Audio Store consumption
    const { currentWordIndex, play } = useAudioStore();

    // Calculate grouping for rendering
    const groups = getSelectionGroups(selectedIndices);
    const groupStarts = new Map<number, string>(); // index -> translation

    // Map to store position of each token in a group for styling
    // 'single' | 'start' | 'middle' | 'end'
    const tokenPositions = new Map<number, string>();
    const visualSelectedIndices = new Set(selectedIndices);

    groups.forEach(group => {
        const start = group[0];
        const end = group[group.length - 1];
        const key = `${start}-${end}`;
        const translation = selectionTranslations.get(key);
        if (translation) {
            groupStarts.set(start, translation);
        }

        // Iterate through the full range including whitespace
        for (let i = start; i <= end; i++) {
            visualSelectedIndices.add(i);

            if (start === end) {
                tokenPositions.set(i, 'single');
            } else if (i === start) {
                tokenPositions.set(i, 'start');
            } else if (i === end) {
                tokenPositions.set(i, 'end');
            } else {
                tokenPositions.set(i, 'middle');
            }
        }
    });

    const handleTokenContextMenu = (index: number, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default browser context menu

        // Find the token text from paginatedTokens
        // We need the global index logic here as well
        // Wait, handleTokenClick uses globalIndex derived from page.
        // pass local index to a handler that converts to global?
        // ReaderToken gives back the index passed to it.
        // In the map below, we pass current `index` (local to page).



        // We need mapped tokens
        // Actually, we can just grab the text content from the event target or use the store
        // But let's use the store for correctness.
        // We'll need to export a helper or just get the token from useReader store directly?
        // useReader exposes `paginatedTokens`.
        const token = paginatedTokens[index];
        if (token) {
            play(token);
        }
    };

    return (
        <Card className="h-full border-none shadow-sm glass max-w-4xl mx-auto my-8">
            <CardContent className="p-8 md:p-12 relative">
                <PlayerControls />
                <div className={styles.textArea}>
                    {paginatedTokens.map((token, index) => {
                        const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                        const isSelected = visualSelectedIndices.has(globalIndex);
                        const isHovered = hoveredIndex === index;
                        const isWhitespace = !token.trim();
                        const groupTranslation = groupStarts.get(globalIndex);
                        const position = tokenPositions.get(globalIndex);

                        // Audio highlighting
                        // Check if currentWordIndex matches globalIndex
                        const isAudioHighlighted = currentWordIndex === globalIndex;

                        return (
                            <ReaderToken
                                key={index}
                                index={index}
                                token={token}
                                isSelected={isSelected}
                                isHovered={isHovered}
                                isWhitespace={isWhitespace}
                                groupTranslation={groupTranslation}
                                position={position}
                                hoverTranslation={hoverTranslation}
                                isAudioHighlighted={isAudioHighlighted}
                                onClick={handleTokenClick}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onContextMenu={handleTokenContextMenu}
                            />
                        );
                    })}
                </div>

                <ReaderPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </CardContent>
        </Card>
    );
};



