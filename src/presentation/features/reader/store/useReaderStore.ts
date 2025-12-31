import { create } from 'zustand';
import { SelectionMode } from '../../../../core/types'; // NEW
import { useTranslationStore } from './useTranslationStore';



interface ReaderState {
    // State
    tokens: string[];
    currentPage: number;
    selectedIndices: Set<number>;

    // Config
    text: string;
    sourceLang: string;
    targetLang: string;
    isReading: boolean;
    isGenerating: boolean; // Global generation status
    PAGE_SIZE: number;
    selectionMode: SelectionMode; // Updated type

    // Actions
    setConfig: (text: string, sourceLang: string, targetLang: string) => void;
    setText: (text: string) => void;
    setSourceLang: (lang: string) => void;
    setTargetLang: (lang: string) => void;
    setIsReading: (isReading: boolean) => void;
    setIsGenerating: (isGenerating: boolean) => void; // Setter
    setSelectionMode: (mode: SelectionMode) => void;
    setPage: (page: number) => void;
    handleSelection: (globalIndex: number) => Promise<void>;
    clearSelection: () => void;
}

// Helper: Group selected indices into contiguous blocks (Still used?)
// Actually, `setConfig` and `setText` used to reset translation state. I need to fix that too.

export const useReaderStore = create<ReaderState>((set, get) => ({
    // Initial State
    tokens: [],
    currentPage: 1,
    selectedIndices: new Set(),
    text: "",
    sourceLang: "Spanish",
    targetLang: "English",
    isReading: false,
    isGenerating: false,
    PAGE_SIZE: 500,
    selectionMode: SelectionMode.Word,

    // Actions
    setConfig: (text, sourceLang, targetLang) => {
        // Avoid resetting if unchanged
        if (text === get().text && sourceLang === get().sourceLang && targetLang === get().targetLang) {
            return;
        }

        const tokens = text.split(/(\s+)/);

        const { closeRichInfo, clearSelectionTranslations } = useTranslationStore.getState();
        closeRichInfo();
        clearSelectionTranslations();

        set({
            text,
            sourceLang,
            targetLang,
            tokens,
            currentPage: 1,
            selectedIndices: new Set(),
        });
    },

    setText: (text) => {
        // NEW: Clear translations and info panel
        const { closeRichInfo, clearSelectionTranslations } = useTranslationStore.getState();
        closeRichInfo();
        clearSelectionTranslations();

        const tokens = text.split(/(\s+)/);
        set({
            text,
            tokens,
            currentPage: 1,
            selectedIndices: new Set(),
        });
    },

    setSourceLang: (sourceLang) => set({ sourceLang }),
    setTargetLang: (targetLang) => set({ targetLang }),
    setIsReading: (isReading) => set({ isReading }),
    setIsGenerating: (isGenerating) => set({ isGenerating }),
    setSelectionMode: (selectionMode) => set({ selectionMode }),

    setPage: (currentPage) => {
        const { tokens, PAGE_SIZE } = get();
        const totalPages = Math.ceil(tokens.length / PAGE_SIZE);
        const newPage = Math.max(1, Math.min(currentPage, totalPages));
        set({ currentPage: newPage });
    },

    handleSelection: async (globalIndex) => {
        const { selectedIndices, selectionMode, tokens } = get();

        const newSelection = new Set(selectedIndices);

        if (selectionMode === SelectionMode.Sentence) {
            const range = getSentenceRange(globalIndex, tokens);
            const start = range[0];
            const end = range[range.length - 1];

            // Toggle logic: If the clicked token was selected, deselect the group.
            const wasSelected = newSelection.has(globalIndex);

            for (let i = start; i <= end; i++) {
                if (wasSelected) {
                    newSelection.delete(i);
                } else {
                    newSelection.add(i);
                }
            }

        } else {
            // Word mode (Default)
            if (newSelection.has(globalIndex)) {
                newSelection.delete(globalIndex);

                // Logic: If we deselect a word, check if adjacent whitespace becomes "orphaned"
                // (i.e., not next to another selected word) and deselect it too.
                const checkAndDeselect = (idx: number) => {
                    if (!newSelection.has(idx)) return;
                    // Check if *neither* neighbor is selected
                    const prev = idx - 1;
                    const next = idx + 1;
                    const prevSelected = prev >= 0 && newSelection.has(prev);
                    const nextSelected = next < tokens.length && newSelection.has(next);

                    if (!prevSelected && !nextSelected) {
                        newSelection.delete(idx);
                    }
                };

                // Check Left
                if (globalIndex > 0) checkAndDeselect(globalIndex - 1);
                // Check Right
                if (globalIndex < tokens.length - 1) checkAndDeselect(globalIndex + 1);

            } else {
                newSelection.add(globalIndex);
                // Note: We don't automatically select whitespace when selecting a word in Word mode.
                // It's only selected via Sentence mode.
            }
        }

        set({ selectedIndices: newSelection });
    },

    clearSelection: () => set({ selectedIndices: new Set() }),
}));

// Helper to find sentence boundaries
export const getSentenceRange = (index: number, tokens: string[]): number[] => {
    // Common abbreviations that shouldn't end a sentence
    const abbreviations = new Set([
        'mr.', 'mrs.', 'ms.', 'dr.', 'prof.', 'sr.', 'jr.', 'vs.', 'etc.', 'fig.', 'al.', 'gen.', 'rep.', 'sen.', 'gov.', 'est.', 'no.', 'op.', 'vol.', 'pp.'
    ]);

    const isSentenceEnd = (token: string) => {
        const t = token.trim();
        if (!t) return false;

        // Basic punctuation check
        const hasPunctuation = /[.!?]['"”’\)]*$/.test(t);
        if (!hasPunctuation) return false;

        // Check if it's an abbreviation
        const lowerToken = t.toLowerCase();
        // Remove trailing quotes/brackets for abbreviation check
        const cleaned = lowerToken.replace(/['"”’\)]+$/, '');

        if (abbreviations.has(cleaned)) {
            return false;
        }

        return true;
    };

    // 1. Search Start (Backwards)
    let start = index;

    // Look backwards from the token *before* the current one
    let i = index - 1;
    while (i >= 0) {
        const token = tokens[i];

        // Explicit newline check
        if (token.includes('\n')) {
            start = i + 1;
            break;
        }

        // If it's a non-whitespace word, check if it ENDS a sentence
        if (token.trim()) {
            if (isSentenceEnd(token)) {
                start = i + 1;
                break;
            }
        }

        // If we reach index 0, that's the start
        if (i === 0) {
            start = 0;
        }
        i--;
    }

    // 2. Search End (Forwards)
    let end = index;

    // Look forwards starting from current
    i = index;
    while (i < tokens.length) {
        const token = tokens[i];

        // CRITICAL FIX: explicit newline check
        if (token.includes('\n')) {
            end = Math.max(index, i - 1);
            break;
        }

        if (token.trim()) {
            if (isSentenceEnd(token)) {
                end = i;
                break;
            }
        }

        // If we reach the last token
        if (i === tokens.length - 1) {
            end = i;
        }
        i++;
    }

    // Optimization: Trim leading whitespace
    while (start <= end && (!tokens[start] || !tokens[start].trim())) {
        start++;
    }

    // Optimization: Trim trailing whitespace
    while (end >= start && (!tokens[end] || !tokens[end].trim())) {
        end--;
    }

    const range: number[] = [];
    for (let k = start; k <= end; k++) {
        range.push(k);
    }
    return range;
};
