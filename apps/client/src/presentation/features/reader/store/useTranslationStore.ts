import { create } from 'zustand';
import { createTranslationSlice } from './slices/translationSlice';
import type { TranslationSlice } from './slices/translationSlice';
import { createRichDetailsSlice } from './slices/richDetailsSlice';
import type { RichDetailsSlice, RichDetailsTab } from './slices/richDetailsSlice';

// Re-export types for consumers
export type { RichDetailsTab };

export type TranslationState = TranslationSlice & RichDetailsSlice;

import { persist } from 'zustand/middleware';

export const useTranslationStore = create<TranslationState>()(
    persist(
        (...a) => ({
            ...createTranslationSlice(...a),
            ...createRichDetailsSlice(...a),
        }),
        {
            name: 'translation-storage',
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    const parsed = JSON.parse(str);
                    return {
                        state: {
                            ...parsed.state,
                            selectionTranslations: new Map(parsed.state.selectionTranslations),
                        },
                    };
                },
                setItem: (name, value) => {
                    const str = JSON.stringify({
                        state: {
                            ...value.state,
                            selectionTranslations: Array.from(value.state.selectionTranslations.entries()),
                        },
                    });
                    localStorage.setItem(name, str);
                },
                removeItem: (name) => localStorage.removeItem(name),
            },
            partialize: (state) => ({
                selectionTranslations: state.selectionTranslations,
                showTranslations: state.showTranslations
            } as any),
        }
    )
);

