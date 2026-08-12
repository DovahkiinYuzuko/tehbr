import type { Alignment, TehbrIR } from '../core/types.js';

function escapeHTMLCell(cell: string): string {
  return cell
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStyleAttribute(align: Alignment | null | undefined): string {
  if (align === 'left' || align === 'center' || align === 'right') {
    return ` style="text-align: ${align};"`;
  }
  return '';
}

export function generateHTML(ir: TehbrIR): string {
  const lines: string[] = ['<table>'];
  const alignments = ir.alignments ?? [];

  if (ir.headers.length > 0) {
    lines.push('  <thead>');
    lines.push('    <tr>');
    for (let i = 0; i < ir.headers.length; i++) {
      const header = escapeHTMLCell(ir.headers[i] ?? '');
      const style = getStyleAttribute(alignments[i]);
      lines.push(`      <th${style}>${header}</th>`);
    }
    lines.push('    </tr>');
    lines.push('  </thead>');
  }

  if (ir.rows.length > 0) {
    lines.push('  <tbody>');
    for (const row of ir.rows) {
      lines.push('    <tr>');
      for (let i = 0; i < ir.headers.length; i++) {
        const cell = escapeHTMLCell(row[i] ?? '');
        const style = getStyleAttribute(alignments[i]);
        lines.push(`      <td${style}>${cell}</td>`);
      }
      lines.push('    </tr>');
    }
    lines.push('  <tbody>');
  }

  lines.push('</table>');

  return lines.join('\n');
}
