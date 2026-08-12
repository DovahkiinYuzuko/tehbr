function escapeTSVCell(cell) {
    return cell.replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}
export function generateTSV(ir) {
    const lines = [];
    if (ir.headers.length > 0) {
        lines.push(ir.headers.map(escapeTSVCell).join('\t'));
    }
    for (const row of ir.rows) {
        const paddedRow = [...row];
        while (paddedRow.length < ir.headers.length) {
            paddedRow.push('');
        }
        lines.push(paddedRow.slice(0, Math.max(ir.headers.length, paddedRow.length)).map(escapeTSVCell).join('\t'));
    }
    return lines.join('\n');
}
