import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseContentStrategy } from './DatabaseContentStrategy';
import { wordsApi } from '../../../../infrastructure/api/words';

vi.mock('../../../../infrastructure/api/words');

describe('DatabaseContentStrategy', () => {
    let strategy: DatabaseContentStrategy;

    beforeEach(() => {
        strategy = new DatabaseContentStrategy();
        vi.clearAllMocks();
        (wordsApi.getAll as any).mockResolvedValue({ items: [], total: 0 });
    });

    it('should validate availability as always true', async () => {
        expect(await strategy.validateAvailability()).toBe(true);
    });

    it('should pass type="word" when gameMode is build-word', async () => {
        await strategy.fetchItems({ gameMode: 'build-word', limit: 10 });
        expect(wordsApi.getAll).toHaveBeenCalledWith(expect.objectContaining({
            type: 'word'
        }));
    });

    it('should pass type="word" when gameMode is multiple-choice', async () => {
        await strategy.fetchItems({ gameMode: 'multiple-choice', limit: 10 });
        expect(wordsApi.getAll).toHaveBeenCalledWith(expect.objectContaining({
            type: 'word'
        }));
    });

    it('should fetch phrases for scramble mode', async () => {
        await strategy.fetchItems({ gameMode: 'scramble', limit: 10 });

        // Scramble calls getAll twice. Once for phrases, once for words (for examples).
        // Verify we requested phrases
        expect(wordsApi.getAll).toHaveBeenCalledWith(expect.objectContaining({
            type: 'phrase'
        }));
    });

    it('should not enforce type="word" for generic modes', async () => {
        await strategy.fetchItems({ gameMode: 'dictation', limit: 10 });

        // Check the arguments of the first call
        const args = (wordsApi.getAll as any).mock.calls[0][0];
        expect(args.type).toBeUndefined();
    });
});
