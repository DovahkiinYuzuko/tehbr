import { generateCSV } from './csv.js';
import { generateHTML } from './html.js';
import { generateJSON } from './json.js';
import { generateMarkdown } from './markdown.js';
import { generateSQL } from './sql.js';
import { generateTSV } from './tsv.js';
const FORMAT_ALIASES = {
    md: 'markdown',
    htm: 'html',
};
const GENERATOR_REGISTRY = {
    csv: (ir) => generateCSV(ir),
    tsv: (ir) => generateTSV(ir),
    markdown: (ir) => generateMarkdown(ir),
    html: (ir) => generateHTML(ir),
    json: (ir) => generateJSON(ir),
    sql: (ir, options) => generateSQL(ir, options),
    ir: (ir) => JSON.stringify(ir, null, 2),
};
export function generateContent(format, ir, options) {
    const normalizedFormat = format.toLowerCase().trim();
    const canonicalFormat = FORMAT_ALIASES[normalizedFormat] || normalizedFormat;
    const generator = GENERATOR_REGISTRY[canonicalFormat];
    if (!generator) {
        throw new Error(`Unsupported output format: ${format}`);
    }
    return generator(ir, options);
}
