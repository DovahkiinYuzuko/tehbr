import { parseCSV } from './csv.js';
import { parseHTML } from './html.js';
import { parseJSON } from './json.js';
import { parseMarkdown } from './markdown.js';
import { parseTSV } from './tsv.js';
const FORMAT_ALIASES = {
    md: 'markdown',
    htm: 'html',
};
const PARSER_REGISTRY = {
    csv: parseCSV,
    tsv: parseTSV,
    markdown: parseMarkdown,
    html: parseHTML,
    json: parseJSON,
    ir: (content) => JSON.parse(content),
};
export async function parseContent(format, content, options) {
    const normalizedFormat = format.toLowerCase().trim();
    const canonicalFormat = FORMAT_ALIASES[normalizedFormat] || normalizedFormat;
    const parser = PARSER_REGISTRY[canonicalFormat];
    if (!parser) {
        throw new Error(`Unsupported input format: ${format}`);
    }
    return parser(content, options);
}
