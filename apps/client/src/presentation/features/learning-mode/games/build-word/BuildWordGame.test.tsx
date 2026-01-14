import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuildWordGame } from './BuildWordGame';
import { useBuildWordLogic } from './hooks/useBuildWordLogic';

// Mock the custom hook
vi.mock('./hooks/useBuildWordLogic');

describe('BuildWordGame', () => {
    const mockSetFocusedWordIndex = vi.fn();
    const mockHandleInput = vi.fn();
    const mockHandleSlotClick = vi.fn();
    const mockHandleGiveUp = vi.fn();
    const mockNextItem = vi.fn();
    const mockPlayAudio = vi.fn();

    const createMockLogic = (overrides = {}) => ({
        currentItem: {
            id: '1',
            question: 'Gato',
            answer: 'Cat',
            lang: { source: 'es', target: 'en' },
            audioUrl: undefined
        },
        slots: [
            [
                { char: 'C', isFilled: true, isStatic: false, status: 'correct' },
                { char: '', isFilled: false, isStatic: false, status: 'none' },
                { char: '', isFilled: false, isStatic: false, status: 'none' }
            ]
        ],
        letterPool: [
            { id: 'btn-0', char: 'c', isUsed: true },
            { id: 'btn-1', char: 'a', isUsed: false },
            { id: 'btn-2', char: 't', isUsed: false },
            { id: 'btn-3', char: 'x', isUsed: false }
        ],
        focusedWordIndex: 0,
        isRevealed: false,
        isComplete: false,
        setFocusedWordIndex: mockSetFocusedWordIndex,
        handleInput: mockHandleInput,
        handleSlotClick: mockHandleSlotClick,
        handleGiveUp: mockHandleGiveUp,
        nextItem: mockNextItem,
        playAudio: mockPlayAudio,
        ...overrides
    });

    beforeEach(() => {
        vi.clearAllMocks();
        (useBuildWordLogic as any).mockReturnValue(createMockLogic());
    });

    it('should render question', () => {
        render(<BuildWordGame />);
        expect(screen.getByText('Gato')).toBeDefined();
    });

    it('should render letter pool buttons', () => {
        render(<BuildWordGame />);
        expect(screen.getByText('a')).toBeDefined();
        expect(screen.getByText('t')).toBeDefined();
        expect(screen.getByText('x')).toBeDefined();
    });

    it('should render Replay button', () => {
        render(<BuildWordGame />);
        expect(screen.getByText('Replay')).toBeDefined();
    });

    it('should call playAudio when Replay clicked', () => {
        render(<BuildWordGame />);
        const replayBtn = screen.getByText('Replay');
        fireEvent.click(replayBtn);
        expect(mockPlayAudio).toHaveBeenCalledWith('Gato', 'es', undefined);
    });

    it('should call handleInput when letter button clicked', () => {
        render(<BuildWordGame />);
        const letterBtn = screen.getByText('a');
        fireEvent.click(letterBtn);
        expect(mockHandleInput).toHaveBeenCalledWith('a', 'btn-1');
    });

    it('should render Give Up button when not revealed', () => {
        render(<BuildWordGame />);
        expect(screen.getByText('Give Up')).toBeDefined();
    });

    it('should call handleGiveUp when Give Up clicked', () => {
        render(<BuildWordGame />);
        const giveUpBtn = screen.getByText('Give Up');
        fireEvent.click(giveUpBtn);
        expect(mockHandleGiveUp).toHaveBeenCalled();
    });

    it('should render Next Word button when revealed', () => {
        (useBuildWordLogic as any).mockReturnValue(createMockLogic({ isRevealed: true }));
        render(<BuildWordGame />);
        expect(screen.getByText(/Next Word/)).toBeDefined();
    });

    it('should call nextItem when Next Word clicked', () => {
        (useBuildWordLogic as any).mockReturnValue(createMockLogic({ isRevealed: true }));
        render(<BuildWordGame />);
        const nextBtn = screen.getByText(/Next Word/);
        fireEvent.click(nextBtn);
        expect(mockNextItem).toHaveBeenCalled();
    });

    it('should return null if no currentItem', () => {
        (useBuildWordLogic as any).mockReturnValue(createMockLogic({ currentItem: null }));
        const { container } = render(<BuildWordGame />);
        expect(container.firstChild).toBeNull();
    });

    it('should disable used letter buttons', () => {
        render(<BuildWordGame />);
        // 'c' is used (isUsed: true)
        const usedBtn = screen.getByText('c');
        expect(usedBtn).toHaveProperty('disabled', true);
    });
});
