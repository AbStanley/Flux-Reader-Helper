import { create } from 'zustand';

import { WebSpeechAudioService } from '../../../../infrastructure/audio/WebSpeechAudioService';


interface AudioState {
    isPlaying: boolean;
    isPaused: boolean;
    currentWordIndex: number | null; // Global token index
    playbackRate: number;
    selectedVoice: SpeechSynthesisVoice | null;
    availableVoices: SpeechSynthesisVoice[];

    // Data for sync
    tokenOffsets: number[]; // Start index of each token in the full text string

    // Actions
    init: () => void;
    setVoice: (voice: SpeechSynthesisVoice) => void;
    setRate: (rate: number) => void;

    // Called when text changes
    setTokens: (tokens: string[]) => void;

    play: (text: string) => void;
    playSingle: (text: string) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
}

// Create a singleton service instance
const audioService = new WebSpeechAudioService();

export const useAudioStore = create<AudioState>((set, get) => ({
    isPlaying: false,
    isPaused: false,
    currentWordIndex: null,
    playbackRate: 1,
    selectedVoice: null,
    availableVoices: [],
    tokenOffsets: [],

    init: () => {
        const loadVoices = () => {
            const voices = audioService.getVoices();
            set({ availableVoices: voices });
            if (voices.length > 0 && !get().selectedVoice) {
                // Try to find a good default voice (Google, Microsoft)
                const defaultVoice = voices.find((v: SpeechSynthesisVoice) => v.default) || voices[0];
                set({ selectedVoice: defaultVoice });
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    },

    setVoice: (voice) => set({ selectedVoice: voice }),
    setRate: (rate) => set({ playbackRate: rate }),

    setTokens: (tokens) => {
        // Pre-calculate start indices for performance
        const offsets: number[] = [];
        let currentLen = 0;
        tokens.forEach(token => {
            offsets.push(currentLen);
            currentLen += token.length;
        });
        set({ tokenOffsets: offsets });
    },

    play: (text) => {
        const { selectedVoice, playbackRate, tokenOffsets } = get();

        // Stop any current playback first
        audioService.stop();

        set({ isPlaying: true, isPaused: false });

        audioService.play(
            text,
            selectedVoice,
            playbackRate,
            (charIndex: number) => {
                // Map charIndex to tokenIndex using binary search or simple find
                // Since onBoundary emits boundaries for words, we expect charIndex to match a token start

                // Simple loop for now (optimize to binary search if performance issues arise)
                // We want the largest offset <= charIndex
                let tokenIndex = -1;

                // Optimization: Start search from previous index? 
                // For now, let's just find it. `tokenOffsets` is sorted.
                // findLastIndex is not always available in all envs, so use simple loop backwards
                for (let i = tokenOffsets.length - 1; i >= 0; i--) {
                    if (tokenOffsets[i] <= charIndex) {
                        tokenIndex = i;
                        break;
                    }
                }

                if (tokenIndex !== -1) {
                    set({ currentWordIndex: tokenIndex });
                }
            },
            () => {
                set({ isPlaying: false, isPaused: false, currentWordIndex: null });
            }
        );
    },

    pause: () => {
        audioService.pause();
        set({ isPaused: true, isPlaying: false });
    },

    resume: () => {
        audioService.resume();
        set({ isPaused: false, isPlaying: true });
    },

    stop: () => {
        audioService.stop();
        set({ isPlaying: false, isPaused: false, currentWordIndex: null });
    },

    playSingle: (text: string) => {
        const { selectedVoice, playbackRate } = get();
        // Stop global playback if running, to avoid overlap
        audioService.stop();
        // Ensure global state is reset so highlights don't persist/move
        set({ isPlaying: false, isPaused: false, currentWordIndex: null });

        audioService.play(
            text,
            selectedVoice,
            playbackRate,
            () => { }, // No-op: Don't update highlight for single word
            () => { }  // No-op: No state change on end
        );
    }
}));
