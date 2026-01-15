/**
 * Type definitions for external libraries that lack proper TypeScript support
 */

// EPUB.js types
export interface EpubBook {
    ready: Promise<void>;
    loaded: {
        navigation: Promise<{ toc: EpubTocItem[] }>;
    };
    spine: {
        items: EpubSpineItem[];
        get: (href: string) => EpubSpineItem | undefined;
    };
    load: (path: string) => Promise<unknown>;
    destroy: () => void;
    navigation?: {
        toc: EpubTocItem[];
    };
}

export interface EpubSpineItem {
    href: string;
    id: string;
    load: (loadFn?: (path: string) => Promise<unknown>) => Promise<string | Document>;
    unload: () => void;
}

export interface EpubTocItem {
    id: string;
    label: string;
    href: string;
    subitems?: EpubTocItem[];
}

// PDF.js types
// Import the actual TextItem type from pdfjs-dist for proper type checking
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

// Re-export for convenience - TextItem already has str, dir, fontName, hasEOL, etc.
export type PdfTextItem = TextItem;
export type PdfTextMarkedContent = TextMarkedContent;

export interface PdfTextContent {
    items: Array<PdfTextItem | PdfTextMarkedContent>;
    styles?: Record<string, unknown>;
}

export interface PdfPage {
    getTextContent: () => Promise<PdfTextContent>;
}

export interface PdfDocument {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PdfPage>;
}

// Anki Connect types
export interface AnkiCardInfo {
    cardId: number;
    fields: Record<string, { value: string; order: number }>;
    fieldOrder?: number;
    question?: string;
    answer?: string;
    deckName?: string;
    modelName?: string;
}

export interface AnkiModelInfo {
    modelName: string;
    fields: Record<string, { order: number }>;
}

export interface AnkiTagsResponse {
    models?: Array<{ name: string }>;
}

// Ollama types
export interface OllamaGenerateChunk {
    model?: string;
    created_at?: string;
    response?: string;
    done?: boolean;
}
