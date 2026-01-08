// Note: We might not be able to import directly from server if outside tsconfig scope. 
// Defining types locally for safety if needed, but let's try assuming monorepo structure allows it or define types.
// Actually, it's better to define client-side types to avoid strict dependency on server file structure if they are separate projects.

export interface Word {
    id: string;
    text: string;
    definition?: string;
    context?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    sourceTitle?: string;
    imageUrl?: string;
    pronunciation?: string;
    createdAt: string;
    examples?: Example[];
}

export interface Example {
    id: string;
    sentence: string;
    translation?: string;
}

export interface CreateWordRequest {
    text: string;
    definition?: string;
    context?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    sourceTitle?: string;
    imageUrl?: string;
    pronunciation?: string;
    examples?: { sentence: string; translation?: string }[];
}

const BASE_URL = 'http://localhost:3000/api/words';

export const wordsApi = {
    getAll: async (params?: { sort?: string; sourceLanguage?: string }) => {
        const searchParams = new URLSearchParams();
        if (params?.sort) searchParams.append('sort', params.sort);
        if (params?.sourceLanguage) searchParams.append('sourceLanguage', params.sourceLanguage);

        const response = await fetch(`${BASE_URL}?${searchParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch words');
        return response.json() as Promise<Word[]>;
    },

    create: async (data: CreateWordRequest) => {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create word');
        return response.json() as Promise<Word>;
    },

    delete: async (id: string) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete word');
    },

    update: async (id: string, data: Partial<CreateWordRequest>) => {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update word');
        return response.json() as Promise<Word>;
    }
};
