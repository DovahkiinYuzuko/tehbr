import stringWidth from 'string-width';
import type { Alignment, TehbrIR } from '../core/types.js';

function escapeMarkdownCell(cell: string): string {
  return cell.replace(/\|/g, '\\|');
}

function padCell(cellText: string, targetWidth: number, align: Alignment | null): string {
  const currentWidth = stringWidth(cellText);
  const totalPadding = Math.max(0, targetWidth - currentWidth);

  if (align === 'right') {
    return ' '.repeat(totalPadding) + cellText;
  }
  if (align === 'center') {
    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;
    return ' '.repeat(leftPadding) + cellText + ' '.repeat(rightPadding);
  }
  return cellText + ' '.repeat(totalPadding);
}

function formatDelimiterCell(width: number, align: Alignment | null): string {
  const minWidth = Math.max(width, 3);
  if (align === 'left') {
    return ':' + '-'.repeat(minWidth - 1);
  }
  if (align === 'right') {
    return '-'.repeat(minWidth - 1) + ':';
  }
  if (align === 'center') {
    return ':' + '-'.repeat(minWidth - 2) + ':';
  }
  return '-'.repeat(minWidth);
}

export function generateMarkdown(ir: TehbrIR): string {
  const numCols = ir.headers.length;
  if (numCols === 0) {
    return '';
  }

  const alignments = ir.alignments ?? Array.from({ length: numCols }, () => null);
  const escapedHeaders = ir.headers.map(escapeMarkdownCell);
  const escapedRows = ir.rows.map((row) => {
    const paddedRow = [...row];
    while (paddedRow.length < numCols) paddedRow.push('');
    return paddedRow.slice(0, numCols).map(escapeMarkdownCell);
  });

  const colWidths: number[] = Array.from({ length: numCols }, () => 3);

  for (let c = 0; c < numCols; c++) {
    const headerWidth = stringWidth(escapedHeaders[c] ?? '');
    if (headerWidth > colWidths[c]!) colWidths[c] = headerWidth;
  }

  for (const row of escapedRows) {
    for (let c = 0; c < numCols; c++) {
      const cellWidth = stringWidth(row[c] ?? '');
      if (cellWidth > colWidths[c]!) colWidths[c] = cellWidth;
    }
  }

  const lines: string[] = [];

  const headerLine = '| ' + escapedHeaders.map((h, i) => padCell(h, colWidths[i]!, alignments[i] ?? null)).join(' | ') + ' |';
  lines.push(headerLine);

  const delimiterLine = '| ' + colWidths.map((w, i) => formatDelimiterCell(w, alignments[i] ?? null)).join(' | ') + ' |';
  lines.push(delimiterLine);

  for (const row of escapedRows) {
    const rowLine = '| ' + row.map((cell, i) => padCell(cell, colWidths[i]!, alignments[i] ?? null)).join(' | ') + ' |';
    lines.push(rowLine);
  }

  return lines.join('\n');
}
