import { create } from 'zustand';

interface ViewState {
    currentView: 'READING' | 'WORD_MANAGER';
    setView: (view: 'READING' | 'WORD_MANAGER') => void;
}

export const useViewStore = create<ViewState>((set) => ({
    currentView: 'READING',
    setView: (view) => set({ currentView: view }),
}));
