import { useState, useCallback, useEffect } from 'react';
import { type Word, type CreateWordRequest, wordsApi } from '../../../../infrastructure/api/words';

export const useWords = () => {
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWords = useCallback(async (params?: { sort?: string; sourceLanguage?: string }) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await wordsApi.getAll(params);
            setWords(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addWord = useCallback(async (data: CreateWordRequest) => {
        setIsLoading(true);
        try {
            const newWord = await wordsApi.create(data);
            setWords(prev => [newWord, ...prev]);
            return newWord;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add word');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteWord = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            await wordsApi.delete(id);
            setWords(prev => prev.filter(w => w.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete word');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateWord = useCallback(async (id: string, data: Partial<CreateWordRequest>) => {
        setIsLoading(true);
        try {
            const updatedWord = await wordsApi.update(id, data);
            setWords(prev => prev.map(w => w.id === id ? updatedWord : w));
            return updatedWord;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update word');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    return {
        words,
        isLoading,
        error,
        fetchWords,
        addWord,
        deleteWord,
        updateWord
    };
};
