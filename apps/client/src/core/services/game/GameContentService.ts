import type { GameContentParams, GameItem, IContentStrategy } from './interfaces';
import { DatabaseContentStrategy } from './strategies/DatabaseContentStrategy';

export class GameContentService {
    private strategies: Record<string, IContentStrategy>;

    constructor() {
        this.strategies = {
            'db': new DatabaseContentStrategy(),
        };
    }

    registerStrategy(source: string, strategy: IContentStrategy) {
        this.strategies[source] = strategy;
    }

    async getItems(params: GameContentParams): Promise<GameItem[]> {
        const strategy = this.strategies[params.source];
        if (!strategy) {
            console.warn(`Strategy for source '${params.source}' not found. Falling back to DB.`);
            // Fallback or throw? Let's throw to be explicit during dev.
            if (params.source === 'anki' || params.source === 'ai') {
                // Temporary mock for development until implemented
                console.log("Mocking response for " + params.source);
                return [];
            }
            throw new Error(`Strategy for source '${params.source}' not implemented.`);
        }

        const isAvailable = await strategy.validateAvailability();
        if (!isAvailable) {
            throw new Error(`Source '${params.source}' is currently unavailable.`);
        }

        return strategy.fetchItems(params.config);
    }
}

export const gameContentService = new GameContentService();
