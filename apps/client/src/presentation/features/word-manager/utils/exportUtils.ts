import { type Word } from "../../../../infrastructure/api/words";

export const exportToCSV = (words: Word[]) => {
    const headers = ['Text', 'Definition', 'Context', 'Source Language', 'Target Language', 'Source Title', 'Image URL', 'Pronunciation', 'Examples'];
    const rows = words.map(word => {
        const examplesStr = word.examples?.map(e => `${e.sentence} [${e.translation || ''}]`).join(' | ') || '';
        return [
            word.text,
            word.definition,
            word.context,
            word.sourceLanguage,
            word.targetLanguage,
            word.sourceTitle,
            word.imageUrl,
            word.pronunciation,
            examplesStr
        ].map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadFile(csvContent, 'words_export.csv', 'text/csv');
};

export const exportToAnki = (words: Word[]) => {
    // Anki typically imports tab-separated values or semicolon-separated.
    // We'll use a simple TSV format which is robust.
    // Format: Front (Word) | Back (Definition + Details) | Audio | Image

    const rows = words.map(word => {
        const front = word.text;

        let back = `<b>${word.definition || ''}</b><br><br>`;
        if (word.pronunciation) back += `/${word.pronunciation}/<br>`;
        if (word.context) back += `<i>Context: ${word.context}</i><br>`;
        if (word.examples && word.examples.length > 0) {
            back += '<ul>';
            word.examples.forEach(ex => {
                back += `<li>${ex.sentence} <small>(${ex.translation})</small></li>`;
            });
            back += '</ul>';
        }
        if (word.sourceTitle) back += `<br><small>Source: ${word.sourceTitle}</small>`;

        // Escape HTML content is implicitly handled by Anki if allows HTML, but we should be careful with tabs/newlines.
        // We replace newlines with <br> in content fields to keep one line per record.
        const clean = (str: string) => str.replace(/\n/g, '<br>').replace(/\t/g, '    ');

        const frontField = clean(front);
        const backField = clean(back);
        const imageField = word.imageUrl ? `<img src="${word.imageUrl}">` : '';

        // Tags
        const tags = [word.sourceLanguage, word.sourceTitle].filter(Boolean).map(t => t?.replace(/ /g, '_')).join(' ');

        return `${frontField}\t${backField}\t${imageField}\t${tags}`;
    });

    const content = rows.join('\n');
    downloadFile(content, 'anki_import.txt', 'text/plain');
};

const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
