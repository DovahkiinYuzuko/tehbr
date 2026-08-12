import { parseCSV } from './csv.js';
import { parseHTML } from './html.js';
import { parseMarkdown } from './markdown.js';
import { parseTSV } from './tsv.js';
export async function parseContent(format, content, options) {
    const normalizedFormat = format.toLowerCase().trim();
    switch (normalizedFormat) {
        case 'csv':
            return parseCSV(content, options);
        case 'tsv':
            return parseTSV(content, options);
        case 'markdown':
        case 'md':
            return parseMarkdown(content);
        case 'html':
            return parseHTML(content);
        case 'ir':
        case 'json':
            return JSON.parse(content);
        default:
            throw new Error(`Unsupported input format: ${format}`);
    }
}
