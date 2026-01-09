export type TranslationType = 'word' | 'sentence';

export type GrammaticalGender =
    | 'masculine'
    | 'feminine'
    | 'neuter'
    | 'common'
    | 'unknown';

export type PartOfSpeech =
    | 'noun'
    | 'verb'
    | 'adjective'
    | 'adverb'
    | 'pronoun'
    | 'preposition'
    | 'conjunction'
    | 'interjection'
    | 'article'
    | 'particle'
    | 'numeral'
    | 'determiner'
    | 'expression' // For idioms
    | 'unknown';

export type GrammaticalTense =
    | 'Present'
    | 'Preterite'
    | 'Imperfect'
    | 'Future'
    | 'Conditional'
    | 'Subjunctive'
    | 'Imperative'
    | 'Perfect'
    | 'Pluperfect'
    | 'Future Perfect'
    | 'Past' // Generic fallback
    | string; // Allow loosely typed strings for now if AI returns something unexpected, but we prefer the unions above. 
// Ideally we remove 'string' eventually, but for AI output it's safer to keep it or map it.
// Actually, per user request, let's try to be strict and use a catch-all 'other' or keeping it strictly union and handling normalization in parser.
// I'll stick to a strict list but add 'Other' or similar if needed. For now let's try to capture most.

export type GrammaticalNumber =
    | 'singular'
    | 'plural'
    | 'dual'
    | 'unknown';

// Mapping for strictness from loose strings
export const normalizePartOfSpeech = (pos: string): PartOfSpeech => {
    const lower = pos.toLowerCase();
    if (['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'article', 'particle', 'numeral', 'determiner'].includes(lower)) {
        return lower as PartOfSpeech;
    }
    if (lower.includes('idiom') || lower.includes('expression')) return 'expression';
    return 'unknown';
};
