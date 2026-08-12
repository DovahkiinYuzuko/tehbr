function splitMarkdownRow(rowStr) {
    let trimmed = rowStr.trim();
    if (trimmed.startsWith('|'))
        trimmed = trimmed.slice(1);
    if (trimmed.endsWith('|') && !trimmed.endsWith('\\|'))
        trimmed = trimmed.slice(0, -1);
    const cells = [];
    let currentCell = '';
    let isEscaped = false;
    for (let i = 0; i < trimmed.length; i++) {
        const char = trimmed[i];
        if (isEscaped) {
            currentCell += char;
            isEscaped = false;
        }
        else if (char === '\\') {
            isEscaped = true;
        }
        else if (char === '|') {
            cells.push(currentCell.trim());
            currentCell = '';
        }
        else {
            currentCell += char;
        }
    }
    cells.push(currentCell.trim());
    return cells;
}
function parseAlignmentCell(cell) {
    const c = cell.trim();
    const startsWithColon = c.startsWith(':');
    const endsWithColon = c.endsWith(':');
    if (startsWithColon && endsWithColon)
        return 'center';
    if (startsWithColon)
        return 'left';
    if (endsWithColon)
        return 'right';
    return null;
}
export function parseMarkdown(content) {
    const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && l.includes('|'));
    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }
    const headers = splitMarkdownRow(lines[0] ?? '');
    let alignments = undefined;
    let dataLines = lines.slice(1);
    if (lines.length > 1 && lines[1] && /^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)*\|?$/.test(lines[1])) {
        const alignCells = splitMarkdownRow(lines[1]);
        const parsedAligns = alignCells.map(parseAlignmentCell);
        while (parsedAligns.length < headers.length) {
            parsedAligns.push(null);
        }
        if (parsedAligns.some((a) => a !== null)) {
            alignments = parsedAligns.slice(0, headers.length);
        }
        dataLines = lines.slice(2);
    }
    const rows = dataLines.map(splitMarkdownRow);
    return {
        headers,
        alignments,
        rows,
    };
}
