import { parse } from 'csv-parse/sync';
export async function parseTSV(content, options) {
    const records = parse(content, {
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
