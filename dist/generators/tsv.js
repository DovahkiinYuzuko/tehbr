import { generateCSV } from './csv.js';
export function generateTSV(ir) {
    return generateCSV(ir, '\t');
}
