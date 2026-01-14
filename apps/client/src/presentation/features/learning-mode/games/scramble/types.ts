/**
 * Sentence Scramble Game Types
 * Extensible for DB, Anki, and AI-generated phrase sources.
 */

/** A word "brick" in the scrambled pool */
export interface WordBrickData {
    /** Unique identifier for this word instance */
    id: string;
    /** The word text */
    word: string;
    /** Whether this word has been placed in a slot */
    isUsed: boolean;
}

/** A slot in the answer area */
export interface WordSlotData {
    /** Index position in the sentence */
    index: number;
    /** The word currently in this slot (empty string if unfilled) */
    word: string;
    /** Whether the slot is filled */
    isFilled: boolean;
    /** Visual status for feedback */
    status: 'none' | 'correct' | 'wrong' | 'revealed';
    /** ID of the word brick that filled this slot */
    sourceBrickId?: string;
}
