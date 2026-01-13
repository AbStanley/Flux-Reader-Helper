export const AppView = {
    Reading: 'READING',
    WordManager: 'WORD_MANAGER'
} as const;

export type AppView = typeof AppView[keyof typeof AppView];
