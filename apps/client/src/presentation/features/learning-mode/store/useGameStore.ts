import { create } from 'zustand';
import type { GameItem, GameContentParams } from '../../../../core/services/game/interfaces';
import { gameContentService } from '../../../../core/services/game/GameContentService';

interface GameState {
    status: 'idle' | 'loading' | 'playing' | 'paused' | 'finished';
    items: GameItem[];
    currentIndex: number;
    score: number;
    streak: number;
    timeLeft: number;
    timerEnabled: boolean; // Config
    isTimerPaused: boolean; // Prevent race conditions during transitions
    health: number; // For "Lives" based modes
    maxHealth: number;

    // Actions
    startGame: (params: GameContentParams) => Promise<void>;
    submitAnswer: (isCorrect: boolean) => void;
    nextItem: () => void;
    endGame: () => void;
    reset: () => void;
    tick: () => void;
    setTime: (time: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    status: 'idle',
    items: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    timeLeft: 10,
    health: 3,
    maxHealth: 3,
    timerEnabled: true,
    isTimerPaused: false,

    startGame: async (params) => {
        const timerEnabled = params.config?.timerEnabled ?? true;
        set({ status: 'loading', items: [], currentIndex: 0, score: 0, streak: 0, health: 3, timeLeft: 10, timerEnabled, isTimerPaused: false });
        try {
            const items = await gameContentService.getItems(params);
            if (items.length === 0) {
                // TODO: Handle empty state better
                console.warn("No items found for game");
                set({ status: 'idle' });
                return;
            }
            // Shuffle items here if needed
            set({ items, status: 'playing' });
        } catch (error) {
            console.error("Failed to start game:", error);
            set({ status: 'idle' });
        }
    },

    submitAnswer: (isCorrect) => {
        const { score, streak, health } = get();
        // Pause timer immediately to prevent race conditions during feedback/audio
        set({ isTimerPaused: true });

        if (isCorrect) {
            set({
                score: score + 10 + (streak * 2), // Basic scoring algo
                streak: streak + 1
            });
        } else {
            set({
                streak: 0,
                health: Math.max(0, health - 1)
            });
        }
    },

    nextItem: () => {
        const { currentIndex, items, health } = get();
        if (health <= 0) {
            set({ status: 'finished' });
            return;
        }

        if (currentIndex < items.length - 1) {
            // Reset timer and unpause for next item
            set({ currentIndex: currentIndex + 1, timeLeft: 10, isTimerPaused: false });
        } else {
            set({ status: 'finished' });
        }
    },

    endGame: () => set({ status: 'finished' }),

    reset: () => set({
        status: 'idle',
        items: [],
        currentIndex: 0,
        score: 0,
        streak: 0,
        timeLeft: 10,
        health: 3,
        timerEnabled: true,
        isTimerPaused: false
    }),

    setTime: (time) => set({ timeLeft: time }),

    tick: () => {
        const { timeLeft, status, submitAnswer, nextItem, timerEnabled, isTimerPaused } = get();
        if (status !== 'playing' || !timerEnabled || isTimerPaused) return;

        if (timeLeft > 0) {
            set({ timeLeft: timeLeft - 1 });
        } else {
            // Timeout!
            submitAnswer(false); // Count as wrong
            // Auto advance after small delay? Or let UI handle it?
            // For now, let's just trigger next item immediately or let UI show timeout state.
            // Simpler: Just count wrong and move next.
            nextItem();
        }
    }
}));
