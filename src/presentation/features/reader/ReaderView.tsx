

import React from 'react';
import styles from './ReaderView.module.css';
import { Card, CardContent } from "../../components/ui/card";
import { useReader } from './hooks/useReader';
import { useTranslation } from './hooks/useTranslation'; // NEW
import { ReaderPagination } from './components/ReaderPagination';
import { ReaderToken } from './components/ReaderToken';
import { RichInfoPanel } from './components/RichInfoPanel'; // NEW

import { useAudioStore } from './store/useAudioStore';
import { PlayerControls } from './components/PlayerControls';

export const ReaderView: React.FC = () => {
    const {
        paginatedTokens,
        currentPage,
        totalPages,
        selectedIndices,
        PAGE_SIZE,
        setCurrentPage,
        handleTokenClick,
        getSelectionGroups
    } = useReader();

    // Translation Hook
    const {
        selectionTranslations,
        hoveredIndex,
        hoverTranslation,
        richTranslation,
        isRichInfoOpen,
        isRichInfoLoading,
        handleHover,
        clearHover,
        fetchRichTranslation,
        closeRichInfo
    } = useTranslation();

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
        e.preventDefault();
        const token = paginatedTokens[index];
        if (token) {
            play(token);
        }
    };

    const handleTokenMouseEnter = (index: number) => {
        handleHover(index);
    };

    // Better More Info handler:
    const onMoreInfoClick = (text: string) => {
        // We'll use the text as the primary key. 
        // Ideally we'd pass the sentence context. 
        // Since we are inside the View, lets try to find the sentence. 
        // For now, passing text is the MVP.
        fetchRichTranslation(text, "");
    };

    return (
        <div className="flex flex-row gap-4 max-w-[90%] mx-auto my-8 h-[80vh]">
            <Card className="flex-1 h-full border-none shadow-sm glass overflow-hidden flex flex-col">
                <CardContent className="p-8 md:p-12 relative flex-1 overflow-y-auto">
                    <PlayerControls />
                    <div className={styles.textArea}>
                        {paginatedTokens.map((token, index) => {
                            const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                            const isSelected = visualSelectedIndices.has(globalIndex);
                            const isHovered = hoveredIndex === index;
                            const isWhitespace = !token.trim();
                            const groupTranslation = groupStarts.get(globalIndex);
                            const position = tokenPositions.get(globalIndex);
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
                                    onMouseEnter={handleTokenMouseEnter}
                                    onMouseLeave={clearHover}
                                    onContextMenu={handleTokenContextMenu}
                                    onMoreInfo={onMoreInfoClick}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-8">
                        <ReaderPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </CardContent>
            </Card>

            <RichInfoPanel
                isOpen={isRichInfoOpen}
                isLoading={isRichInfoLoading}
                data={richTranslation}
                onClose={closeRichInfo}
            />
        </div>
    );
};



