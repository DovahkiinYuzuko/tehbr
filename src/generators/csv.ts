import type { TehbrIR } from '../core/types.js';

function escapeCSVCell(cell: string): string {
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function generateCSV(ir: TehbrIR): string {
  const lines: string[] = [];

  if (ir.headers.length > 0) {
    lines.push(ir.headers.map(escapeCSVCell).join(','));
  }

  for (const row of ir.rows) {
    const paddedRow = [...row];
    while (paddedRow.length < ir.headers.length) {
      paddedRow.push('');
    }
    lines.push(paddedRow.slice(0, Math.max(ir.headers.length, paddedRow.length)).map(escapeCSVCell).join(','));
  }

  return lines.join('\n');
}
