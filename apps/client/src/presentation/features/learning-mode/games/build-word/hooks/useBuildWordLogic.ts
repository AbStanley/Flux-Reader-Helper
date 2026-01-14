import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { useGameAudio } from '../../hooks/useGameAudio';
import { soundService } from '@/core/services/SoundService';
import type { SlotData, LetterParams } from '../types';

export const useBuildWordLogic = () => {
    const { items, currentIndex, submitAnswer, nextItem, isTimerPaused, timeLeft, config } = useGameStore();
    const timerEnabled = config.timerEnabled;
    const { playAudio, stopAudio } = useGameAudio();
    const currentItem = items[currentIndex];

    // Local Game State
    const [targetWords, setTargetWords] = useState<string[]>([]);
    const [slots, setSlots] = useState<SlotData[][]>([]);
    const [letterPool, setLetterPool] = useState<LetterParams[]>([]);
    const [focusedWordIndex, setFocusedWordIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    // Initialization Logic
    useEffect(() => {
        if (!currentItem) return;

        // 1. Parse Answer
        const raw = currentItem.answer;
        const targets = raw.split(/[,;]+/)
            .map(s => {
                let clean = s.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s*\[.*?\]\s*/g, ' ').replace(/\s*\{.*?\}\s*/g, ' ').trim();
                if (clean.includes('/')) clean = clean.split('/')[0].trim();
                return clean;
            })
            .filter(s => s.length > 0);

        setTargetWords(targets);
        setFocusedWordIndex(0);
        setIsComplete(false);
        setIsRevealed(false);

        // 2. Initialize Slots
        const newSlots = targets.map((word) => {
            return word.split('').map(char => {
                const isStatic = !/[\p{L}\p{N}]/u.test(char);
                return {
                    char: isStatic ? char : '',
                    isFilled: isStatic,
                    isStatic,
                    status: 'none' as const
                };
            });
        });
        setSlots(newSlots);

        // 3. Generate Letter Pool
        const combinedChars = targets.join('').split('').filter(c => /[\p{L}\p{N}]/u.test(c));
        const neededCount = combinedChars.length;
        const distractorCount = Math.max(3, Math.floor(neededCount * 0.4));

        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const extras: string[] = [];
        for (let i = 0; i < distractorCount; i++) {
            extras.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
        }

        const pool = [...combinedChars, ...extras].sort(() => 0.5 - Math.random()).map((char, idx) => ({
            id: `btn-${idx}-${char}`,
            char,
            isUsed: false
        }));
        setLetterPool(pool);

        // 4. Play Audio
        playAudio(currentItem.question, currentItem.lang?.source, currentItem.audioUrl);

        return () => {
            stopAudio();
        };
    }, [currentItem, playAudio, stopAudio]);

    // Check Function
    const checkCompletion = useCallback((currentSlots: SlotData[][]) => {
        if (!currentItem) return;
        const allFilled = currentSlots.every(row => row.every(s => s.isFilled));
        if (!allFilled) return;

        const allCorrect = currentSlots.every(row => row.every(s => s.isStatic || s.status === 'correct'));

        if (allCorrect) {
            setIsComplete(true);
            soundService.playCorrect();
            submitAnswer(true);
            playAudio(currentItem.answer, currentItem.lang?.target, undefined);
            setTimeout(() => nextItem(), 800);
        }
    }, [currentItem, submitAnswer, playAudio, nextItem]);

    // Handle Reveal / Timeout
    const handleReveal = useCallback(() => {
        if (isRevealed || isComplete) return;

        setIsRevealed(true);
        soundService.playWrong();

        setSlots(prev => prev.map((row, wIdx) => {
            return row.map((slot, sIdx) => {
                const targetChar = targetWords[wIdx][sIdx];
                return {
                    ...slot,
                    char: targetChar,
                    isFilled: true,
                    status: slot.status === 'correct' ? 'correct' : 'revealed'
                };
            });
        }));

        playAudio(currentItem.answer, currentItem.lang?.target, undefined);
    }, [isRevealed, isComplete, targetWords, currentItem, playAudio]);

    // Handle Give Up
    const handleGiveUp = useCallback(() => {
        if (isRevealed || isComplete) return;
        submitAnswer(false);
        handleReveal();
    }, [isRevealed, isComplete, submitAnswer, handleReveal]);

    // Watch for Timeout
    useEffect(() => {
        if (timerEnabled && timeLeft === 0 && !isRevealed && !isComplete) {
            handleReveal();
        }
    }, [timeLeft, timerEnabled, isRevealed, isComplete, handleReveal]);

    // Input Handlers
    const handleInput = useCallback((char: string, btnId?: string) => {
        if (isComplete || isTimerPaused || isRevealed) return;

        const currentWordSlots = slots[focusedWordIndex];
        const nextEmptyIdx = currentWordSlots.findIndex(s => !s.isFilled);

        if (nextEmptyIdx === -1) {
            soundService.playWrong();
            return;
        }

        const targetChar = targetWords[focusedWordIndex][nextEmptyIdx];
        const isCorrectChar = char.toLowerCase() === targetChar.toLowerCase();

        let actualBtnId = btnId;
        if (!actualBtnId) {
            const match = letterPool.find(p => p.char.toLowerCase() === char.toLowerCase() && !p.isUsed);
            if (match) actualBtnId = match.id;
        }

        if (!actualBtnId) {
            soundService.playWrong();
            return;
        }

        if (isCorrectChar) {
            soundService.playClick();
        } else {
            soundService.playWrong();
        }

        const newSlots = [...slots];
        newSlots[focusedWordIndex][nextEmptyIdx] = {
            ...newSlots[focusedWordIndex][nextEmptyIdx],
            char: char,
            isFilled: true,
            sourceBtnId: actualBtnId,
            status: isCorrectChar ? 'correct' : 'wrong'
        };
        setSlots(newSlots);
        setLetterPool(prev => prev.map(p => p.id === actualBtnId ? { ...p, isUsed: true } : p));
        checkCompletion(newSlots);
    }, [slots, focusedWordIndex, letterPool, isComplete, isTimerPaused, isRevealed, targetWords, checkCompletion]);

    const handleBackspace = useCallback(() => {
        if (isComplete || isTimerPaused || isRevealed) return;

        const currentWordSlots = [...slots[focusedWordIndex]];
        let foundIdx = -1;
        for (let i = currentWordSlots.length - 1; i >= 0; i--) {
            if (currentWordSlots[i].isFilled && !currentWordSlots[i].isStatic) {
                foundIdx = i;
                break;
            }
        }

        if (foundIdx === -1) {
            if (focusedWordIndex > 0) {
                setFocusedWordIndex(focusedWordIndex - 1);
            }
            return;
        }

        const slot = currentWordSlots[foundIdx];
        const newSlots = [...slots];
        newSlots[focusedWordIndex][foundIdx] = {
            ...slot,
            char: '',
            isFilled: false,
            sourceBtnId: undefined,
            status: 'none'
        };
        setSlots(newSlots);

        if (slot.sourceBtnId) {
            setLetterPool(prev => prev.map(p => p.id === slot.sourceBtnId ? { ...p, isUsed: false } : p));
        }
        soundService.playBackspace();
    }, [slots, focusedWordIndex, isComplete, isTimerPaused, isRevealed]);

    const handleSlotClick = useCallback((wordIdx: number, slotIdx: number) => {
        if (isComplete || isTimerPaused || isRevealed) return;

        const slot = slots[wordIdx][slotIdx];
        if (slot.isStatic || !slot.isFilled) {
            if (wordIdx !== focusedWordIndex) setFocusedWordIndex(wordIdx);
            return;
        }

        const newSlots = [...slots];
        newSlots[wordIdx][slotIdx] = {
            ...slot,
            char: '',
            isFilled: false,
            sourceBtnId: undefined,
            status: 'none'
        };
        setSlots(newSlots);

        if (slot.sourceBtnId) {
            setLetterPool(prev => prev.map(p => p.id === slot.sourceBtnId ? { ...p, isUsed: false } : p));
        }
        if (wordIdx !== focusedWordIndex) setFocusedWordIndex(wordIdx);
        soundService.playBackspace();
    }, [slots, focusedWordIndex, isComplete, isTimerPaused, isRevealed]);

    // Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                setFocusedWordIndex(prev => (prev + 1) % slots.length);
            } else if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                handleInput(e.key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleBackspace, handleInput, slots.length]);

    return {
        currentItem,
        slots,
        letterPool,
        focusedWordIndex,
        isRevealed,
        isComplete,
        setFocusedWordIndex,
        handleInput,
        handleSlotClick,
        handleGiveUp,
        nextItem,
        playAudio
    };
};
