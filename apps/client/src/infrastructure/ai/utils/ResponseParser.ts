import { normalizePartOfSpeech, type GrammaticalGender, type TranslationType } from "../../../core/types/Linguistics";

export const cleanResponse = (response: string): string => {
    // Remove <think> blocks
    return response.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
};

export const extractJson = (response: string): any => {
    let clean = cleanResponse(response);

    // Extract JSON block if present (Markdown code fence)
    const jsonBlockMatch = clean.match(/```json([\s\S]*?)```/);
    if (jsonBlockMatch) {
        clean = jsonBlockMatch[1];
    } else {
        // Fallback: Try to find the first '{' and last '}'
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            clean = clean.substring(start, end + 1);
        }
    }

    clean = clean.trim();

    try {
        return JSON.parse(clean);
    } catch (e) {
        // Fallback: simple regex extraction if JSON parse fails
        const translationMatch = response.match(/"translation":\s*"([^"]+)"/);
        const segmentMatch = response.match(/"segment":\s*"([^"]+)"/);

        if (translationMatch) {
            return {
                type: 'word', // Default fallback
                translation: translationMatch[1],
                segment: segmentMatch ? segmentMatch[1] : "",
                // Return empty structures for the rest so UI doesn't crash
                grammar: { partOfSpeech: "unknown" },
                examples: [],
                alternatives: []
            };
        }
        throw e;
    }
};

export const normalizeRichTranslation = (data: any): any => {
    // Normalize type
    if (data.type) {
        const typeLower = data.type.toLowerCase();
        if (typeLower === 'word' || typeLower === 'sentence') {
            data.type = typeLower as TranslationType;
        } else {
            // Default or fallback logic if needed, but for now strict check or leave as is (which TS might complain about if we returned strict type, but we return 'any')
            // Let's force it to be valid if possible, or undefined if invalid
            data.type = undefined;
        }
    }

    // Normalize examples
    if (data.examples && Array.isArray(data.examples)) {
        data.examples = data.examples.map((ex: any) => {
            if (typeof ex === 'string') {
                return { sentence: ex, translation: "" };
            }
            return {
                sentence: ex.sentence || ex.example || ex.text || ex.source || "",
                translation: ex.translation || ex.meaning || ""
            };
        }).filter((ex: any) => ex.sentence);
    }

    // Normalize Grammar Fields
    if (data.grammar) {
        if (data.grammar.partOfSpeech) {
            data.grammar.partOfSpeech = normalizePartOfSpeech(data.grammar.partOfSpeech);
        }

        // Normalize Gender to lowercase to match union
        if (data.grammar.gender) {
            data.grammar.gender = data.grammar.gender.toLowerCase() as GrammaticalGender;
        }
    }

    return data;
};
