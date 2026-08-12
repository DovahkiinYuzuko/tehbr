import type { TehbrIR } from '../core/types.js';
import { generateCSV } from './csv.js';
import { generateHTML } from './html.js';
import { generateJSON } from './json.js';
import { generateMarkdown } from './markdown.js';
import { generateSQL } from './sql.js';
import { generateTSV } from './tsv.js';

export type GeneratorFunction = (ir: TehbrIR, options?: { tableName?: string }) => string;

const FORMAT_ALIASES: Record<string, string> = {
  md: 'markdown',
  htm: 'html',
};

const GENERATOR_REGISTRY: Record<string, GeneratorFunction> = {
  csv: (ir) => generateCSV(ir),
  tsv: (ir) => generateTSV(ir),
  markdown: (ir) => generateMarkdown(ir),
  html: (ir) => generateHTML(ir),
  json: (ir) => generateJSON(ir),
  sql: (ir, options) => generateSQL(ir, options),
  ir: (ir) => JSON.stringify(ir, null, 2),
};

export function generateContent(
  format: string,
  ir: TehbrIR,
  options?: { tableName?: string }
): string {
  const normalizedFormat = format.toLowerCase().trim();
  const canonicalFormat = FORMAT_ALIASES[normalizedFormat] || normalizedFormat;

  const generator = GENERATOR_REGISTRY[canonicalFormat];
  if (!generator) {
    throw new Error(`Unsupported output format: ${format}`);
  }

  return generator(ir, options);
}
