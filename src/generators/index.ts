import type { TehbrIR } from '../core/types.js';
import { generateCSV } from './csv.js';
import { generateHTML } from './html.js';
import { generateMarkdown } from './markdown.js';
import { generateTSV } from './tsv.js';

import { generateJSON } from './json.js';
import { generateSQL } from './sql.js';

export function generateContent(
  format: string,
  ir: TehbrIR,
  options?: { tableName?: string }
): string {
  const normalizedFormat = format.toLowerCase().trim();

  switch (normalizedFormat) {
    case 'csv':
      return generateCSV(ir);
    case 'tsv':
      return generateTSV(ir);
    case 'markdown':
    case 'md':
      return generateMarkdown(ir);
    case 'html':
      return generateHTML(ir);
    case 'json':
      return generateJSON(ir);
    case 'sql':
      return generateSQL(ir, options);
    case 'ir':
      return JSON.stringify(ir, null, 2);
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}
