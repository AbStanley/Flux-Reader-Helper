export interface SaveWordDTO {
    text: string;
    definition?: string;
    context?: string;
}

export class WordsClient {
    private baseUrl: string;

    constructor() {
        // Fallback to localhost if env not set (or use window.location if proxied)
        this.baseUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:3000';
        if (this.baseUrl.endsWith('/api/ollama')) {
            // Strip the ollama specific part if strictly set to that
            this.baseUrl = this.baseUrl.replace('/api/ollama', '');
        }
    }

    async saveWord(word: SaveWordDTO): Promise<any> {
        const url = `${this.baseUrl}/api/words`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(word),
            });

            if (!response.ok) {
                throw new Error(`Failed to save word: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving word:', error);
            throw error;
        }
    }
}
