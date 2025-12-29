import { useEffect } from 'react';
import { useServices } from '../../../contexts/ServiceContext';
import { useTranslationStore } from '../store/useTranslationStore';
import { useReaderStore } from '../store/useReaderStore';

export const useTranslation = () => {
    const { aiService } = useServices();

    // Reader Store State (Dependencies)
    const tokens = useReaderStore(state => state.tokens);
    const selectedIndices = useReaderStore(state => state.selectedIndices);
    const currentPage = useReaderStore(state => state.currentPage);
    const PAGE_SIZE = useReaderStore(state => state.PAGE_SIZE);
    const sourceLang = useReaderStore(state => state.sourceLang);
    const targetLang = useReaderStore(state => state.targetLang);

    // Translation Store State
    const selectionTranslations = useTranslationStore(state => state.selectionTranslations);
    const hoveredIndex = useTranslationStore(state => state.hoveredIndex);
    const hoverTranslation = useTranslationStore(state => state.hoverTranslation);

    // Rich Info State
    const richTranslation = useTranslationStore(state => state.richTranslation);
    const isRichInfoOpen = useTranslationStore(state => state.isRichInfoOpen);
    const isRichInfoLoading = useTranslationStore(state => state.isRichInfoLoading);

    // Translation Store Actions
    const translateSelection = useTranslationStore(state => state.translateSelection);
    const handleHoverAction = useTranslationStore(state => state.handleHover);
    const clearHover = useTranslationStore(state => state.clearHover);
    const fetchRichTranslationAction = useTranslationStore(state => state.fetchRichTranslation);
    const closeRichInfo = useTranslationStore(state => state.closeRichInfo);
    const toggleRichInfo = useTranslationStore(state => state.toggleRichInfo);

    // Effect: Automatically trigger translation when selection changes
    useEffect(() => {
        translateSelection(selectedIndices, tokens, sourceLang, targetLang, aiService);
    }, [selectedIndices, tokens, sourceLang, targetLang, aiService, translateSelection]);

    // Derived Actions (Inject Service)
    const handleHover = (index: number) => {
        handleHoverAction(index, tokens, currentPage, PAGE_SIZE, sourceLang, targetLang, aiService);
    };

    const fetchRichTranslation = (text: string, context: string) => {
        fetchRichTranslationAction(text, context, sourceLang, targetLang, aiService);
    };

    return {
        // State
        selectionTranslations,
        hoveredIndex,
        hoverTranslation,
        richTranslation,
        isRichInfoOpen,
        isRichInfoLoading,

        // Actions
        handleHover,
        clearHover,
        fetchRichTranslation,
        closeRichInfo,
        toggleRichInfo
    };
};
