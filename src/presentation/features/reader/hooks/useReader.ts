import { useServices } from '../../../contexts/ServiceContext';
import { useReaderStore } from '../store/useReaderStore';

export const useReader = () => {
    const { aiService } = useServices();

    // Store Selectors
    const tokens = useReaderStore(state => state.tokens);
    const currentPage = useReaderStore(state => state.currentPage);
    const PAGE_SIZE = useReaderStore(state => state.PAGE_SIZE);

    // Derived State (Selector logic or computed here)
    const paginatedTokens = useReaderStore(state => {
        const start = (state.currentPage - 1) * state.PAGE_SIZE;
        return state.tokens.slice(start, start + state.PAGE_SIZE);
    });

    const totalPages = Math.ceil(tokens.length / PAGE_SIZE);

    // Simple State Selectors
    const selectedIndices = useReaderStore(state => state.selectedIndices);
    const hoveredIndex = useReaderStore(state => state.hoveredIndex);
    const hoverTranslation = useReaderStore(state => state.hoverTranslation);

    // Actions
    const setPage = useReaderStore(state => state.setPage);
    const handleSelection = useReaderStore(state => state.handleSelection);
    const handleHover = useReaderStore(state => state.handleHover);
    const clearHover = useReaderStore(state => state.clearHover);

    // View Event Handlers
    const handleTokenClick = (index: number) => {
        const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
        handleSelection(globalIndex, aiService);
    };

    const handleMouseEnter = (index: number) => {
        handleHover(index, aiService);
    };

    const handleMouseLeave = () => {
        clearHover();
    };

    // Duplicate helper for View rendering (pure visual logic)
    const getSelectionGroups = (indices: Set<number>): number[][] => {
        const sorted = Array.from(indices).sort((a, b) => a - b);
        if (sorted.length === 0) return [];

        const groups: number[][] = [];
        let currentGroup: number[] = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const curr = sorted[i];

            // Check if there are only whitespace tokens between prev and curr
            let isContiguous = true;
            for (let k = prev + 1; k < curr; k++) {
                if (tokens[k].trim().length > 0) {
                    isContiguous = false;
                    break;
                }
            }

            if (isContiguous) {
                currentGroup.push(curr);
            } else {
                groups.push(currentGroup);
                currentGroup = [curr];
            }
        }
        groups.push(currentGroup);
        return groups;
    };

    // We also need `selectionTranslations` for the view to render the popups
    const selectionTranslations = useReaderStore(state => state.selectionTranslations);

    return {
        // State
        tokens,
        paginatedTokens,
        currentPage,
        totalPages,
        selectedIndices,
        hoveredIndex,
        hoverTranslation,
        selectionTranslations,
        PAGE_SIZE,

        // Actions
        setCurrentPage: setPage,
        handleTokenClick,
        handleMouseEnter,
        handleMouseLeave,
        getSelectionGroups
    };
};
