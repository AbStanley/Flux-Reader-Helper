import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore', () => {
    beforeEach(() => {
        useGameStore.getState().reset();
    });

    it('should have default config', () => {
        const { config } = useGameStore.getState();
        expect(config.mode).toBe('multiple-choice');
        expect(config.source).toBe('db');
        expect(config.timerEnabled).toBe(true);
    });

    it('should update config', () => {
        useGameStore.getState().updateConfig({ mode: 'build-word', timerEnabled: false });
        const { config } = useGameStore.getState();
        expect(config.mode).toBe('build-word');
        expect(config.timerEnabled).toBe(false);
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
        const submitSpy = vi.fn();
        useGameStore.setState({
            status: 'playing',
            timeLeft: 0,
            submitAnswer: submitSpy,
            config: { ...useGameStore.getState().config, timerEnabled: true }
        });
        useGameStore.getState().tick();
        expect(submitSpy).toHaveBeenCalledWith(false);
    });

    it('should prevent nextItem if not playing', () => {
        useGameStore.setState({ status: 'idle', currentIndex: 0, items: [{ id: '1' } as any, { id: '2' } as any] });
        useGameStore.getState().nextItem();
        expect(useGameStore.getState().currentIndex).toBe(0);
    });

    it('should advance item if playing', () => {
        useGameStore.setState({ status: 'playing', currentIndex: 0, items: [{ id: '1' } as any, { id: '2' } as any] });
        useGameStore.getState().nextItem();
        expect(useGameStore.getState().currentIndex).toBe(1);
        expect(useGameStore.getState().timeLeft).toBe(100);
    });
});
