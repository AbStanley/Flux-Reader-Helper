import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GameSetup } from './GameSetup';
import { useGameStore } from '../store/useGameStore';
import { wordsApi } from '@/infrastructure/api/words';

// Mocks
vi.mock('../store/useGameStore');
vi.mock('@/infrastructure/api/words');

describe('GameSetup', () => {
    const updateConfigSpy = vi.fn();
    const startGameSpy = vi.fn();

    const mockStore = {
        config: {
            mode: 'multiple-choice',
            source: 'db',
            timerEnabled: true,
            sourceLang: 'all',
            targetLang: 'all'
        },
        updateConfig: updateConfigSpy,
        startGame: startGameSpy
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useGameStore as any).mockReturnValue(mockStore);
    });

    it('should render correctly', async () => {
        (wordsApi.getAll as any).mockResolvedValue({ items: [] });
        render(<GameSetup />);

        expect(screen.getByText('Training Arena')).toBeDefined();
        expect(screen.getByText('Saved Words')).toBeDefined(); // Tab
    });

    it('should fetch languages for DB source', async () => {
        const mockItems = [
            { sourceLanguage: 'en', targetLanguage: 'es' },
            { sourceLanguage: 'en', targetLanguage: 'fr' }
        ];
        (wordsApi.getAll as any).mockResolvedValue({ items: mockItems });

        render(<GameSetup />);

        await waitFor(() => {
            expect(wordsApi.getAll).toHaveBeenCalled();
        });

        // Opening Select usually requires interaction in tests if not using userEvent setup or if examining internal state.
        // But we can check if Selects are present.
        expect(screen.getAllByText('Any Language').length).toBeGreaterThan(0);
    });

    it('should call startGame on button click', () => {
        (wordsApi.getAll as any).mockResolvedValue({ items: [] });
        render(<GameSetup />);

        const startBtn = screen.getByText('START GAME');
        fireEvent.click(startBtn);

        expect(startGameSpy).toHaveBeenCalled();
    });
});
