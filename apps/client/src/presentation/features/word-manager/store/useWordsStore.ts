import { create } from 'zustand';
import { wordsApi, type Word, type CreateWordRequest } from '../../../../infrastructure/api/words';

interface WordsState {
    words: Word[];
    isLoading: boolean;
    error: string | null;
    fetchWords: (params?: { sort?: string; sourceLanguage?: string }) => Promise<void>;
    addWord: (data: CreateWordRequest) => Promise<Word>;
    deleteWord: (id: string) => Promise<void>;
    updateWord: (id: string, data: Partial<CreateWordRequest>) => Promise<Word>;
}

export const useWordsStore = create<WordsState>((set) => ({
    words: [],
    isLoading: false,
    error: null,

    fetchWords: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const data = await wordsApi.getAll(params);
            set({ words: data });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'An error occurred' });
        } finally {
            set({ isLoading: false });
        }
    },

    addWord: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const newWord = await wordsApi.create(data);
            set(state => ({ words: [newWord, ...state.words] }));
            return newWord;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to add word';
            set({ error: errorMsg });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteWord: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await wordsApi.delete(id);
            set(state => ({ words: state.words.filter(w => w.id !== id) }));
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to delete word' });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    updateWord: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const updatedWord = await wordsApi.update(id, data);
            set(state => ({ words: state.words.map(w => w.id === id ? updatedWord : w) }));
            return updatedWord;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to update word' });
            throw err;
        } finally {
            set({ isLoading: false });
        }
    }
}));
