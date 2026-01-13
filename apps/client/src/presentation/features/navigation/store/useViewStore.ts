import { create } from 'zustand';
import { AppView } from '../types';

interface ViewState {
    currentView: AppView;
    setView: (view: AppView) => void;
}

export const useViewStore = create<ViewState>((set) => ({
    currentView: AppView.Reading,
    setView: (view) => set({ currentView: view }),
}));
