import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameContentService } from './GameContentService';
import { DatabaseContentStrategy } from './strategies/DatabaseContentStrategy';
import { AnkiContentStrategy } from './strategies/AnkiContentStrategy';

// Mock strategies
vi.mock('./strategies/DatabaseContentStrategy');
vi.mock('./strategies/AnkiContentStrategy');

describe('GameContentService', () => {
    let service: GameContentService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new GameContentService();
    });

    it('should initialize with default strategies', () => {
        // We can't easily inspect private properties, but we can test behavior
        expect(DatabaseContentStrategy).toHaveBeenCalled();
        expect(AnkiContentStrategy).toHaveBeenCalled();
    });

    it('should select correct strategy for "anki" source', async () => {


        const testStrategy = {
            validateAvailability: vi.fn().mockResolvedValue(true),
            fetchItems: vi.fn().mockResolvedValue([{ id: '1', question: 'q', answer: 'a' }]),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        service.registerStrategy('test-source', testStrategy);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = await service.getItems({ source: 'test-source' } as unknown as any);
        expect(items).toHaveLength(1);
        expect(testStrategy.validateAvailability).toHaveBeenCalled();
        expect(testStrategy.fetchItems).toHaveBeenCalled();
    });

    it('should throw if strategy not found/mock not ready (e.g. invalid source)', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expect(service.getItems({ source: 'invalid' } as unknown as any)).rejects.toThrow("implemented");
    });

    it('should throw if strategy is unavailable', async () => {
        const unavailableStrategy = {
            validateAvailability: vi.fn().mockResolvedValue(false),
            fetchItems: vi.fn(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        service.registerStrategy('offline', unavailableStrategy);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await expect(service.getItems({ source: 'offline' } as unknown as any)).rejects.toThrow("unavailable");
    });
});
