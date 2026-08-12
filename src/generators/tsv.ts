import type { TehbrIR } from '../core/types.js';
import { generateCSV } from './csv.js';

export function generateTSV(ir: TehbrIR): string {
  return generateCSV(ir, '\t');
}

