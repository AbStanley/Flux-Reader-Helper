export const AppView = {
    Reading: 'READING',
    WordManager: 'WORD_MANAGER',
    LearningMode: 'LEARNING_MODE'
} as const;

export type AppView = typeof AppView[keyof typeof AppView];
