import { describe, it, expect } from 'vitest';
import { getSentenceRange } from './text-utils';

describe('getSentenceRange', () => {
    it('should select a simple sentence', () => {
        const tokens = ['Hello', ' ', 'world', '.', ' ', 'Next', ' ', 'sentence', '.'];
        // "world" is at index 2.
        // Expected sentence: "Hello world." -> indices 0 to 4
        // getSentenceRange(2, tokens) should return [0, 1, 2, 3] (trailing space might be included depending on logic, let's check implementation)
        // Implementation:
        // backwards:
        // world (2) -> not end
        // " " (1) -> not end
        // Hello (0) -> start (stops at 0)
        // start = 0
        // forwards:
        // world (2) -> not end
        // . (3) -> is end
        // end = 3
        // range: 0, 1, 2, 3
        const result = getSentenceRange(2, tokens);
        expect(result).toEqual([0, 1, 2, 3]);
    });

    it('should select a sentence with abbreviation', () => {
        const tokens = ['Hello', ' ', 'Mr.', ' ', 'Smith', '.', ' ', 'Next', '.'];
        // "Smith" is at index 4.
        // "Mr." (2) checks isSentenceEnd.
        // abbreviations has "mr." -> returns false.
        // So backwards from 4:
        // " " (3)
        // "Mr." (2) -> not end
        // " " (1)
        // "Hello" (0) -> start
        // forwards from 4:
        // "Smith" (4)
        // "." (5) -> end
        // end = 5
        // range: 0, 1, 2, 3, 4, 5
        const result = getSentenceRange(4, tokens);
        expect(result).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('should respect boundaries', () => {
        const tokens = ['First', '.', ' ', 'Second', ' ', 'sentence', '.', ' ', 'Third', '.'];
        // "sentence" is at index 5.
        // backwards from 5:
        // " " (4)
        // "Second" (3) -> isSentenceEnd? false
        // " " (2)
        // "." (1) -> isSentenceEnd? true.
        // start = 1 + 1 = 2?
        // Wait, line 43: if token.trim() && isSentenceEnd(token). "." is trimmed ".". isSentenceEnd(".") is true.
        // start = i + 1 = 2.
        // So start is 2 (" ").
        // Optimization line 86: while start <= end && (!tokens[start] || !tokens[start].trim()) start++
        // tokens[2] is " ". It's trimmed to empty? " ".trim() is "".
        // So start increments to 3 ("Second").
        // forwards from 5:
        // "sentence" (5)
        // "." (6) -> end = 6.
        // result indices: 3, 4, 5, 6 ("Second sentence.")
        const result = getSentenceRange(5, tokens);
        expect(result).toEqual([3, 4, 5, 6]);
    });
});
