import { parseCSV } from './csv.js';
export async function parseTSV(content, options) {
    return parseCSV(content, { ...options, delimiter: '\t' });
}
