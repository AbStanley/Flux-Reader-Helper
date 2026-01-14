import type { GameContentParams, GameItem, IContentStrategy } from '../interfaces';
import { wordsApi, type Word } from '../../../../infrastructure/api/words';

export class DatabaseContentStrategy implements IContentStrategy {
    async validateAvailability(): Promise<boolean> {
        // Always available if the app is running (assuming DB is up)
        return true;
    }

    async fetchItems(config: GameContentParams['config']): Promise<GameItem[]> {
        try {
            const limit = config?.limit || 20;
            const reqSource = config?.language?.source;
            const reqTarget = config?.language?.target;

            // 1. Forward Fetch: Search exactly as requested
            // If Source selected, we look for DB.source == selectedSource
            const fwdPromise = wordsApi.getAll({
                take: limit,
                sourceLanguage: reqSource,
                targetLanguage: reqTarget
            });

            // 2. Reverse Fetch: Search for the opposite to support "Backwards" learning
            // If User wants Question to be "Russian" (reqSource='ru'), we also look for DB.target == 'ru'
            // and then swap them so the Definition (Russian) becomes the Question.
            let revPromise: Promise<{ items: Word[]; total: number }> | undefined;

            // Only perform reverse fetch if we have at least one filter and they aren't the same
            if ((reqSource || reqTarget) && reqSource !== reqTarget) {
                revPromise = wordsApi.getAll({
                    take: limit,
                    sourceLanguage: reqTarget, // swap filters
                    targetLanguage: reqSource
                });
            }

            const [fwdRes, revRes] = await Promise.all([
                fwdPromise,
                revPromise || Promise.resolve({ items: [], total: 0 })
            ]);

            const items: GameItem[] = [];

            // Map Forward Items
            fwdRes.items.forEach(word => {
                items.push(this.mapToGameItem(word, false));
            });

            // Map Reverse Items (Swapping Q/A)
            revRes.items.forEach(word => {
                // Ensure definition exists if we are going to use it as the Question
                if (word.definition) {
                    items.push(this.mapToGameItem(word, true));
                }
            });

            // Shuffle combined results if needed, or just return.
            // (Store will likely shuffle or we can simple sort random here slightly?)
            return items.sort(() => 0.5 - Math.random()).slice(0, limit);

        } catch (error) {
            console.error('Failed to fetch words from DB:', error);
            return [];
        }
    }

    private mapToGameItem(word: Word, swap: boolean): GameItem {
        const sourceLang = word.sourceLanguage || 'en';
        const targetLang = word.targetLanguage || 'en';

        return {
            id: word.id,
            // If swapped: Question is Definition (Target in DB), Answer is Text (Source in DB)
            question: swap ? (word.definition || '???') : word.text,
            answer: swap ? word.text : (word.definition || 'No definition'),

            context: word.context || (word.examples && word.examples.length > 0 ? word.examples[0].sentence : undefined),

            // Audio URL in DB is usually for the "text" (Source). 
            // If swapped, the Question (Definition) likely has no audio URL, so we leave undefined to force TTS.
            audioUrl: swap ? undefined : word.pronunciation,

            imageUrl: word.imageUrl,
            source: 'db',
            type: word.type === 'phrase' ? 'phrase' : 'word',
            lang: {
                source: this.normalizeLanguageCode(swap ? targetLang : sourceLang),
                target: this.normalizeLanguageCode(swap ? sourceLang : targetLang)
            },
            originalData: word
        };
    }

    private normalizeLanguageCode(lang: string): string {
        const map: Record<string, string> = {
            'english': 'en-US',
            'russian': 'ru-RU',
            'spanish': 'es-ES',
            'french': 'fr-FR',
            'german': 'de-DE',
            'italian': 'it-IT',
            'portuguese': 'pt-BR',
            'japanese': 'ja-JP',
            'chinese': 'zh-CN',
            'korean': 'ko-KR',
            // Short codes fallback overrides
            'en': 'en-US',
            'ru': 'ru-RU',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE'
        };

        const lower = lang.toLowerCase();
        return map[lower] || (lower.length === 2 ? lower : 'en-US'); // Fallback to en-US if unknown/long string to prevent errors
    }
}
