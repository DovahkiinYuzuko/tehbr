function extractAlignment(tagStr) {
    const styleMatch = /style\s*=\s*["'][^"']*text-align\s*:\s*(left|center|right)[^"']*["']/i.exec(tagStr);
    if (styleMatch?.[1]) {
        return styleMatch[1].toLowerCase();
    }
    const alignMatch = /align\s*=\s*["']?(left|center|right)["']?/i.exec(tagStr);
    if (alignMatch?.[1]) {
        return alignMatch[1].toLowerCase();
    }
    return null;
}
export function parseHTML(content) {
    const tableMatch = /<table[\s\S]*?>([\s\S]*?)<\/table>/i.exec(content);
    if (!tableMatch?.[1]) {
        return { headers: [], rows: [] };
    }
    const tableInner = tableMatch[1];
    const trMatches = Array.from(tableInner.matchAll(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/gi));
    if (trMatches.length === 0) {
        return { headers: [], rows: [] };
    }
    const headers = [];
    const alignments = [];
    const rows = [];
    let headerProcessed = false;
    for (const trMatch of trMatches) {
        const trContent = trMatch[1];
        const cellMatches = Array.from(trContent.matchAll(/<(th|td)([\s\S]*?)>([\s\S]*?)<\/\1>/gi));
        if (cellMatches.length === 0)
            continue;
        const rowValues = cellMatches.map((m) => m[3].replace(/<[^>]+>/g, '').trim());
        if (!headerProcessed && cellMatches.some((m) => m[1].toLowerCase() === 'th')) {
            for (const m of cellMatches) {
                headers.push(m[3].replace(/<[^>]+>/g, '').trim());
                alignments.push(extractAlignment(m[0]));
            }
            headerProcessed = true;
        }
        else if (!headerProcessed) {
            for (let i = 0; i < rowValues.length; i++) {
                headers.push(`Column ${i + 1}`);
                alignments.push(null);
            }
            rows.push(rowValues);
            headerProcessed = true;
        }
        else {
            rows.push(rowValues);
        }
    }
    const hasAlignment = alignments.some((a) => a !== null);
    return {
        headers,
        alignments: hasAlignment ? alignments : undefined,
        rows,
    };
}
