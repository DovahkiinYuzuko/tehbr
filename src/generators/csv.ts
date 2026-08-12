import type { TehbrIR } from '../core/types.js';

function escapeCSVCell(cell: string, delimiter: string): string {
  if (delimiter === '\t') {
    return cell.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
  }
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function generateCSV(ir: TehbrIR, delimiter = ','): string {
  const lines: string[] = [];

  if (ir.headers.length > 0) {
    lines.push(ir.headers.map((h) => escapeCSVCell(h, delimiter)).join(delimiter));
  }

  for (const row of ir.rows) {
    const paddedRow = [...row];
    while (paddedRow.length < ir.headers.length) {
      paddedRow.push('');
    }
    lines.push(paddedRow.slice(0, Math.max(ir.headers.length, paddedRow.length)).map((c) => escapeCSVCell(c, delimiter)).join(delimiter));
  }

  return lines.join('\n');
}

