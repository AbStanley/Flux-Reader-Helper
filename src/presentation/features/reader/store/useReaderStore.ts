import { create } from 'zustand';

// Define a minimal interface for the AI Service to avoid circular dependency
interface IAService {
    translateText: (text: string, targetLang: string, context: string, sourceLang: string) => Promise<string>;
}

interface ReaderState {
    // State
    tokens: string[];
    currentPage: number;
    selectedIndices: Set<number>;
    hoveredIndex: number | null;
    hoverTranslation: string | null;
    selectionTranslations: Map<string, string>;

    // Config
    text: string;
    sourceLang: string;
    targetLang: string;
    isReading: boolean;
    PAGE_SIZE: number;

    // Actions
    setConfig: (text: string, sourceLang: string, targetLang: string) => void;
    setText: (text: string) => void;
    setSourceLang: (lang: string) => void;
    setTargetLang: (lang: string) => void;
    setIsReading: (isReading: boolean) => void;
    setPage: (page: number) => void;
    // handleSelection combines toggle + translate
    handleSelection: (globalIndex: number, aiService: IAService) => Promise<void>;
    handleHover: (index: number, aiService: IAService) => Promise<void>;
    clearHover: () => void;
}

// Helper: Extract context (current line) for a given token index
const getContextForIndex = (tokens: string[], index: number): string => {
    if (index < 0 || index >= tokens.length) return '';

    let startIndex = index;
    while (startIndex > 0 && !tokens[startIndex - 1].includes('\n')) {
        startIndex--;
    }

    let endIndex = index;
    while (endIndex < tokens.length - 1 && !tokens[endIndex + 1].includes('\n')) {
        endIndex++;
    }

    return tokens.slice(startIndex, endIndex + 1).join('');
};

// Helper: Group selected indices into contiguous blocks
const getSelectionGroups = (indices: Set<number>, tokens: string[]): number[][] => {
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

// Helper: Fetch translation with error handling
const fetchTranslation = async (
    text: string,
    context: string,
    sourceLang: string,
    targetLang: string,
    aiService: IAService
): Promise<string | null> => {
    if (!text.trim()) return null;
    try {
        return await aiService.translateText(text.trim(), targetLang, context, sourceLang);
    } catch (error: any) {
        return `Translation Error: ${error.message || 'Unknown failure'}`;
    }
};

export const useReaderStore = create<ReaderState>((set, get) => ({
    // Initial State
    tokens: [],
    currentPage: 1,
    selectedIndices: new Set(),
    hoveredIndex: null,
    hoverTranslation: null,
    selectionTranslations: new Map(),
    text: "",
    sourceLang: "German",
    targetLang: "English",
    isReading: false,
    PAGE_SIZE: 500,

    // Actions
    setConfig: (text, sourceLang, targetLang) => {
        // Avoid resetting if unchanged
        if (text === get().text && sourceLang === get().sourceLang && targetLang === get().targetLang) {
            return;
        }

        const tokens = text.split(/(\s+)/);

        set({
            text,
            sourceLang,
            targetLang,
            tokens,
            currentPage: 1,
            selectedIndices: new Set(),
            selectionTranslations: new Map(),
            hoveredIndex: null,
            hoverTranslation: null
        });
    },

    setText: (text) => {
        const tokens = text.split(/(\s+)/);
        set({
            text,
            tokens,
            currentPage: 1,
            selectedIndices: new Set(),
            selectionTranslations: new Map(),
            hoveredIndex: null,
            hoverTranslation: null
        });
    },

    setSourceLang: (sourceLang) => set({ sourceLang }),
    setTargetLang: (targetLang) => set({ targetLang }),
    setIsReading: (isReading) => set({ isReading }),

    setPage: (page) => {
        const { tokens, PAGE_SIZE } = get();
        const totalPages = Math.ceil(tokens.length / PAGE_SIZE);
        const newPage = Math.max(1, Math.min(page, totalPages));
        set({ currentPage: newPage });
    },

    handleSelection: async (globalIndex, aiService) => {
        const { tokens, selectedIndices, sourceLang, targetLang, selectionTranslations } = get();
        const token = tokens[globalIndex];
        if (!token.trim()) return;

        // Toggle selection
        const newSelection = new Set(selectedIndices);
        if (newSelection.has(globalIndex)) {
            newSelection.delete(globalIndex);
        } else {
            newSelection.add(globalIndex);
        }

        // Optimistic update
        set({ selectedIndices: newSelection });

        // If no selection, clear translations
        if (newSelection.size === 0) {
            set({ selectionTranslations: new Map() });
            return;
        }

        // Calculate groups and translate
        const groups = getSelectionGroups(newSelection, tokens);
        const newTranslations = new Map<string, string>();

        await Promise.all(groups.map(async (group) => {
            if (group.length === 0) return;
            const start = group[0];
            const end = group[group.length - 1];
            const key = `${start}-${end}`;

            // Cache hit
            if (selectionTranslations.has(key)) {
                newTranslations.set(key, selectionTranslations.get(key)!);
                return;
            }

            // Fetch
            const textToTranslate = tokens.slice(start, end + 1).join('');
            const context = getContextForIndex(tokens, start);
            const result = await fetchTranslation(textToTranslate, context, sourceLang, targetLang, aiService);

            newTranslations.set(key, result ?? "Error: Translation failed");
        }));

        set({ selectionTranslations: newTranslations });
    },

    handleHover: async (index, aiService) => {
        const { tokens, sourceLang, targetLang, PAGE_SIZE, currentPage } = get();
        const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
        const token = tokens[globalIndex];

        if (!token?.trim()) return;

        // Set hover immediately
        set({ hoveredIndex: index, hoverTranslation: null });

        const context = getContextForIndex(tokens, globalIndex);
        const result = await fetchTranslation(token, context, sourceLang, targetLang, aiService);

        // Check race condition (if still hovered)
        if (get().hoveredIndex === index && result) {
            set({ hoverTranslation: result });
        }
    },

    clearHover: () => {
        set({ hoveredIndex: null, hoverTranslation: null });
    }
}));
