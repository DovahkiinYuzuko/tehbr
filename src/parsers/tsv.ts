import type { TehbrIR } from '../core/types.js';
import { parseCSV } from './csv.js';

export async function parseTSV(content: string, options?: { noHeader?: boolean }): Promise<TehbrIR> {
  return parseCSV(content, { ...options, delimiter: '\t' });
}

