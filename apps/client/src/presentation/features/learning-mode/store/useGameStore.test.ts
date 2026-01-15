import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useGameStore } from './useGameStore';
import { gameContentService } from '../../../../core/services/game/GameContentService';
import type { GameItem } from '../../../../core/services/game/interfaces';



describe('useGameStore', () => {
    beforeEach(() => {
        useGameStore.getState().reset();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should have default config', () => {
        const { config } = useGameStore.getState();
        expect(config.mode).toBe('multiple-choice');
        expect(config.source).toBe('db');
        expect(config.timerEnabled).toBe(true);
        expect(config.aiHost).toBeUndefined();
    });

    it('should update config and aiHost', () => {
        useGameStore.getState().updateConfig({ mode: 'build-word', timerEnabled: false, aiHost: 'http://test:1234' });
        const { config } = useGameStore.getState();
        expect(config.mode).toBe('build-word');
        expect(config.timerEnabled).toBe(false);
        expect(config.aiHost).toBe('http://test:1234');
    });

    it('should not tick if status is not playing', () => {
        useGameStore.setState({ status: 'idle', timeLeft: 100 });
        useGameStore.getState().tick();
        expect(useGameStore.getState().timeLeft).toBe(100);
    });

    it('should tick if playing and timer enabled', () => {
        useGameStore.setState({
            status: 'playing',
            timeLeft: 100,
            config: { ...useGameStore.getState().config, timerEnabled: true }
        });
        useGameStore.getState().tick();
        expect(useGameStore.getState().timeLeft).toBe(99);
    });

    it('should submit wrong answer on timeout', () => {
        const submitSpy = vi.spyOn(useGameStore.getState(), 'submitAnswer');
        useGameStore.setState({
            status: 'playing',
            timeLeft: 0,
            config: { ...useGameStore.getState().config, timerEnabled: true }
        });
        useGameStore.getState().tick();
        expect(submitSpy).toHaveBeenCalledWith(false);
    });

    const createMockItem = (id: string): GameItem => ({
        id,
        question: 'q',
        answer: 'a',
        source: 'db',
        type: 'word'
    });

    it('should prevent nextItem if not playing', () => {
        useGameStore.setState({ status: 'idle', currentIndex: 0, items: [createMockItem('1'), createMockItem('2')] });
        useGameStore.getState().nextItem();
        expect(useGameStore.getState().currentIndex).toBe(0);
    });

    it('should advance item if playing', () => {
        useGameStore.setState({ status: 'playing', currentIndex: 0, items: [createMockItem('1'), createMockItem('2')] });
        useGameStore.getState().nextItem();
        expect(useGameStore.getState().currentIndex).toBe(1);
        expect(useGameStore.getState().timeLeft).toBe(100);
    });

    it('should record history on answer', () => {
        useGameStore.setState({
            items: [createMockItem('101'), createMockItem('102')],
            currentIndex: 0,
            history: {}
        });

        useGameStore.getState().submitAnswer(true);
        expect(useGameStore.getState().history['101']).toBe(true); // Correct

        useGameStore.setState({ currentIndex: 1 });
        useGameStore.getState().submitAnswer(false);
        expect(useGameStore.getState().history['102']).toBe(false); // Incorrect
    });

    it('should update score and streak correctly', () => {
        useGameStore.setState({
            score: 0,
            streak: 0,
            items: [createMockItem('1'), createMockItem('2')]
        });

        // Correct answer: +10 + (0 * 2) = 10
        useGameStore.getState().submitAnswer(true);
        expect(useGameStore.getState().score).toBe(10);
        expect(useGameStore.getState().streak).toBe(1);

        // Next item (manual update for test)
        useGameStore.setState({ currentIndex: 1 });

        // Correct answer: +10 + (1 * 2) = 12. Total = 22
        useGameStore.getState().submitAnswer(true);
        expect(useGameStore.getState().score).toBe(22);
        expect(useGameStore.getState().streak).toBe(2);
    });

    it('should call syncProgress', async () => {
        const syncSpy = vi.spyOn(gameContentService, 'syncProgress').mockResolvedValue(undefined);

        useGameStore.setState({
            config: { ...useGameStore.getState().config, source: 'anki' },
            history: { '101': true },
            items: [createMockItem('101')]
        });

        await useGameStore.getState().syncProgress();

        expect(syncSpy).toHaveBeenCalledWith(
            'anki',
            expect.any(Array),
            { '101': true }
        );
    });
});
