import { describe, it, expect } from 'vitest';
import { cleanResponse, extractJson, normalizeRichTranslation } from './ResponseParser';

describe('ResponseParser', () => {
    describe('cleanResponse', () => {
        it('removes <think> blocks', () => {
            const input = '<think>This should be removed</think> {"key": "value"}';
            expect(cleanResponse(input)).toBe('{"key": "value"}');
        });

        it('handles multiline <think> blocks', () => {
            const input = `<think>
            This should be removed
            </think> {"key": "value"}`;
            expect(cleanResponse(input)).toBe('{"key": "value"}');
        });
    });

    describe('extractJson', () => {
        it('parses valid JSON', () => {
            const input = '{"translation": "hola", "segment": "hello"}';
            const result = extractJson(input);
            expect(result).toEqual({ translation: 'hola', segment: 'hello' });
        });

        it('parses JSON inside markdown code blocks', () => {
            const input = 'Here is the json:\n```json\n{"translation": "hola", "segment": "hello"}\n```';
            const result = extractJson(input);
            expect(result).toEqual({ translation: 'hola', segment: 'hello' });
        });

        it('falls back to regex extraction for malformed JSON', () => {
            const input = 'Some text "translation": "hola", "segment": "hello" end text';
            const result = extractJson(input) as Record<string, unknown>;

            expect(result.translation).toBe('hola');
            expect(result.segment).toBe('hello');
            // Check default valid values
            expect((result.grammar as Record<string, unknown>).partOfSpeech).toBe('unknown');
        });
    });

    describe('normalizeRichTranslation', () => {
        it('normalizes grammar fields (partOfSpeech, gender)', () => {
            const input = {
                translation: 'gato',
                segment: 'cat',
                grammar: {
                    partOfSpeech: 'Noun', // Capitalized, should become 'noun'
                    gender: 'MASCULINE', // Uppercase, should become 'masculine'
                    tense: 'Present' // explicit string union or string
                }
            };

            const result = normalizeRichTranslation(input);

            expect(result.grammar?.partOfSpeech).toBe('noun');
            expect(result.grammar?.gender).toBe('masculine');
            expect(result.grammar?.tense).toBe('Present');
        });

        it('handles unknown partOfSpeech', () => {
            const input = {
                grammar: {
                    partOfSpeech: 'Spaceship' // Invalid
                }
            };
            const result = normalizeRichTranslation(input);
            expect(result.grammar?.partOfSpeech).toBe('unknown');
        });

        it('handles idioms/expressions as expression', () => {
            const input = {
                grammar: {
                    partOfSpeech: 'Idiomatic Expression'
                }
            };
            const result = normalizeRichTranslation(input);
            expect(result.grammar?.partOfSpeech).toBe('expression');
        });

        it('normalizes translation type', () => {
            const input = {
                type: 'WORD', // uppercase
                translation: 'word',
                segment: 'word'
            };
            const result = normalizeRichTranslation(input);
            expect(result.type).toBe('word');

            const input2 = {
                type: 'Sentence', // Mixed case
                translation: 'sentence',
                segment: 'sentence'
            };
            const result2 = normalizeRichTranslation(input2);
            expect(result2.type).toBe('sentence');
        });

        it('normalizes mixed string/object examples', () => {
            const input = {
                examples: [
                    "Just a string",
                    { sentence: "Structured example", translation: "Translated" }
                ]
            };

            const result = normalizeRichTranslation(input);

            expect(result.examples[0]).toEqual({ sentence: "Just a string", translation: "" });
            expect(result.examples[1]).toEqual({ sentence: "Structured example", translation: "Translated" });
        });
    });
});
