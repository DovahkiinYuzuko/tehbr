import { parse } from 'csv-parse/sync';
import type { TehbrIR } from '../core/types.js';

export async function parseTSV(content: string, options?: { noHeader?: boolean }): Promise<TehbrIR> {
  const records: string[][] = parse(content, {
    delimiter: '\t',
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  if (options?.noHeader) {
    const colCount = Math.max(...records.map((r) => r.length));
    const headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
    return {
      headers,
      rows: records,
    };
  }

  const headers = records[0] ?? [];
  const rows = records.slice(1);

  return {
    headers,
    rows,
  };
}
