import { useWordsStore } from '../../word-manager/store/useWordsStore';

export const useWords = () => {
    const words = useWordsStore(state => state.words);
    const isLoading = useWordsStore(state => state.isLoading);
    const error = useWordsStore(state => state.error);
    const fetchWords = useWordsStore(state => state.fetchWords);
    const addWord = useWordsStore(state => state.addWord);
    const deleteWord = useWordsStore(state => state.deleteWord);
    const updateWord = useWordsStore(state => state.updateWord);

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
