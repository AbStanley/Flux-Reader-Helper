/// <reference types="chrome" />
import type { IAIService } from '../../core/interfaces/IAIService';
import { getTranslatePrompt, getRichTranslationPrompt } from './prompts/TranslationPrompts';
import { cleanResponse, extractJson, normalizeRichTranslation } from './utils/ResponseParser';
import { OllamaTransport } from './OllamaTransport';

/**
 * OllamaService: The AI Connector
 * 
 * Refactored to separate Transport Logic (OllamaTransport) from Business Logic.
 */
export class OllamaService implements IAIService {
    private transport: OllamaTransport;
    private model: string;

    constructor(baseUrl: string = '', model: string = 'llama2') {
        // Ensure protocol
        if (baseUrl && !baseUrl.startsWith('http')) {
            baseUrl = `http://${baseUrl}`;
        }
        if (baseUrl.endsWith('/')) {
            baseUrl = baseUrl.slice(0, -1);
        }
        console.log('[OllamaService] Initializing with baseUrl:', baseUrl || '(empty/relative)');

        this.transport = new OllamaTransport(baseUrl);
        this.model = model;
    }

    setModel(model: string) {
        this.model = model;
    }

    getModel(): string {
        return this.model;
    }

    async generateText(prompt: string, options?: {
        onProgress?: (chunk: string, fullText: string) => void;
        signal?: AbortSignal;
        [key: string]: any
    }): Promise<string> {
        try {
            const body = {
                model: this.model,
                prompt: prompt,
                ...options
            };

            // Transport handles 'stream' flag based on onProgress presence
            return await this.transport.generate(body, {
                onProgress: options?.onProgress,
                signal: options?.signal
            });
        } catch (error: any) {
            console.error('Ollama generation failed:', error);
            throw error;
        }
    }

    async translateText(text: string, targetLanguage: string = 'en', context?: string, sourceLanguage?: string): Promise<string> {
        console.log(`[OllamaService] translateText`, { text, target: targetLanguage, source: sourceLanguage });
        const prompt = getTranslatePrompt(text, targetLanguage, context, sourceLanguage);
        const rawResponse = await this.generateText(prompt);
        return cleanResponse(rawResponse);
    }

    async explainText(text: string, targetLanguage: string = 'en', context?: string): Promise<string> {
        console.log(`[OllamaService] explainText`, { text, target: targetLanguage });
        const { getExplainPrompt } = await import('./prompts/TranslationPrompts');
        const prompt = getExplainPrompt(text, targetLanguage, context);
        const rawResponse = await this.generateText(prompt);
        return cleanResponse(rawResponse);
    }

    async getRichTranslation(text: string, targetLanguage: string = 'en', context?: string, sourceLanguage?: string): Promise<any> {
        console.log(`[OllamaService] getRichTranslation`, { text, target: targetLanguage, source: sourceLanguage });
        const prompt = getRichTranslationPrompt(text, targetLanguage, context, sourceLanguage);
        const rawResponse = await this.generateText(prompt, { num_predict: 4096 });
        try {
            const data = extractJson(rawResponse);
            return normalizeRichTranslation(data);
        } catch (e) {
            console.error("Failed to parse rich translation JSON", rawResponse);
            throw new Error("Failed to parse rich translation response");
        }
    }

    async getAvailableModels(): Promise<string[]> {
        try {
            const data = await this.transport.getTags();
            return data?.models?.map((m: any) => m.name) || [];
        } catch (error) {
            return [];
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const data = await this.transport.getTags();
            return !!data;
        } catch {
            return false;
        }
    }
}
