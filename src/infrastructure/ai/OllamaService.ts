import type { IAIService } from '../../core/interfaces/IAIService';

export class OllamaService implements IAIService {
    private baseUrl: string;
    private model: string;

    constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama2') {
        this.baseUrl = baseUrl;
        this.model = model;
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Ollama generation failed:', error);
            throw error;
        }
    }

    async translateText(text: string, targetLanguage: string = 'en', context?: string): Promise<string> {
        // Ollama translation usually requires a specific prompt engineering or a translation model.
        // For MVP, we'll use a prompt.
        let prompt = `You are a precise translator assistant. Translate the following to ${targetLanguage}.
Rules:
1. Translate ONLY the "Target Text".
2. The "Target Text" is a specific fragment extracted from the "Context".
3. Provide the translation for that fragment primarily.
4. If the fragment is an idiom or phrase, translate its meaning in that context.
5. If the fragment is a single word, provide its specific meaning in that context.
6. DO NOT output the whole sentence.
7. DO NOT be chatty. Just return the translated text.

Examples:
Context: "El gato negro salta la valla"
Target Text: "El gato"
Output: The cat

Context: "No creo que sea verdad lo que dices"
Target Text: "que sea"
Output: that it is

Context: "Por favor dame el pan"
Target Text: "dame"
Output: give me

Context: "She is running a business"
Target Text: "running"
Output: managing

Strictly output only the translation.`;

        if (context) {
            prompt += `\n\nContext: "${context}"`;
            prompt += `\nTarget Text: "${text}"`;
        } else {
            prompt += `\n\nTarget Text: "${text}"`;
        }

        const rawResponse = await this.generateText(prompt);

        // Post-processing to remove <think> blocks and whitespace
        return rawResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }

    async getAvailableModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.models?.map((m: any) => m.name) || [];
        } catch (error) {
            console.error('Failed to fetch Ollama models:', error);
            return [];
        }
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`); // Simple endpoint to check connectivity
            return response.ok;
        } catch {
            return false;
        }
    }
}
