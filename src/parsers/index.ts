import type { TehbrIR } from '../core/types.js';
import { parseCSV } from './csv.js';
import { parseHTML } from './html.js';
import { parseJSON } from './json.js';
import { parseMarkdown } from './markdown.js';
import { parseTSV } from './tsv.js';

export type ParserFunction = (content: string, options?: { noHeader?: boolean }) => Promise<TehbrIR> | TehbrIR;

const FORMAT_ALIASES: Record<string, string> = {
  md: 'markdown',
  htm: 'html',
};

const PARSER_REGISTRY: Record<string, ParserFunction> = {
  csv: parseCSV,
  tsv: parseTSV,
  markdown: parseMarkdown,
  html: parseHTML,
  json: parseJSON,
  ir: (content) => JSON.parse(content) as TehbrIR,
};

export async function parseContent(
  format: string,
  content: string,
  options?: { noHeader?: boolean }
): Promise<TehbrIR> {
  const normalizedFormat = format.toLowerCase().trim();
  const canonicalFormat = FORMAT_ALIASES[normalizedFormat] || normalizedFormat;

  const parser = PARSER_REGISTRY[canonicalFormat];
  if (!parser) {
    throw new Error(`Unsupported input format: ${format}`);
  }

  return parser(content, options);
}
