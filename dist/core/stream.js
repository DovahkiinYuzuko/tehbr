import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { parse as parseCSVStream } from 'csv-parse';
import iconv from 'iconv-lite';
function escapeCSVCell(cell) {
    if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
        return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
}
function escapeTSVCell(cell) {
    if (cell.includes('\t') || cell.includes('\n') || cell.includes('\r')) {
        return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
}
function escapeSQLIdentifier(id) {
    return `"${id.replace(/"/g, '""')}"`;
}
function escapeSQLValue(val) {
    return `'${val.replace(/'/g, "''")}'`;
}
export async function runStreamPipeline(options) {
    const rawReadable = options.inputPath
        ? fs.createReadStream(options.inputPath)
        : process.stdin;
    const readable = options.encoding
        ? rawReadable.pipe(iconv.decodeStream(options.encoding))
        : rawReadable;
    const writable = options.outputPath
        ? fs.createWriteStream(options.outputPath, { encoding: 'utf8' })
        : process.stdout;
    const inputFmt = options.inputFormat.toLowerCase();
    const outputFmt = options.outputFormat.toLowerCase();
    let headers = [];
    let isFirstRow = true;
    let isFirstJSONItem = true;
    const tableName = options.tableName || (options.inputPath ? path.basename(options.inputPath, path.extname(options.inputPath)) : 'table_name');
    const generatorTransform = new Transform({
        objectMode: true,
        transform(record, encoding, callback) {
            try {
                if (isFirstRow) {
                    isFirstRow = false;
                    if (options.noHeader && inputFmt !== 'json') {
                        headers = Array.from({ length: record.length }, (_, i) => `Column ${i + 1}`);
                        // Record is first data row
                        processHeaderAndFirstRow(this, headers, record);
                        callback(null);
                        return;
                    }
                    else {
                        headers = record;
                        processHeaderOnly(this, headers);
                        callback(null);
                        return;
                    }
                }
                processRow(this, headers, record);
                callback(null);
            }
            catch (err) {
                callback(err instanceof Error ? err : new Error(String(err)));
            }
        },
        flush(callback) {
            if (outputFmt === 'json' && !isFirstJSONItem) {
                this.push('\n]\n');
            }
            callback(null);
        },
    });
    function processHeaderOnly(stream, hdrs) {
        if (outputFmt === 'csv') {
            stream.push(hdrs.map(escapeCSVCell).join(',') + '\n');
        }
        else if (outputFmt === 'tsv') {
            stream.push(hdrs.map(escapeTSVCell).join('\t') + '\n');
        }
        else if (outputFmt === 'sql') {
            const quotedTableName = escapeSQLIdentifier(tableName);
            const quotedCols = hdrs.map(escapeSQLIdentifier).map((col) => `  ${col} TEXT`).join(',\n');
            stream.push(`CREATE TABLE ${quotedTableName} (\n${quotedCols}\n);\n\n`);
        }
        else if (outputFmt === 'json') {
            stream.push('[\n');
        }
    }
    function processHeaderAndFirstRow(stream, hdrs, row) {
        processHeaderOnly(stream, hdrs);
        processRow(stream, hdrs, row);
    }
    function processRow(stream, hdrs, row) {
        if (outputFmt === 'csv') {
            const line = hdrs.map((_, i) => escapeCSVCell(row[i] !== undefined ? String(row[i]) : '')).join(',');
            stream.push(line + '\n');
        }
        else if (outputFmt === 'tsv') {
            const line = hdrs.map((_, i) => escapeTSVCell(row[i] !== undefined ? String(row[i]) : '')).join('\t');
            stream.push(line + '\n');
        }
        else if (outputFmt === 'sql') {
            const quotedTableName = escapeSQLIdentifier(tableName);
            const quotedCols = hdrs.map(escapeSQLIdentifier).join(', ');
            const values = hdrs.map((_, i) => escapeSQLValue(row[i] !== undefined ? String(row[i]) : '')).join(', ');
            stream.push(`INSERT INTO ${quotedTableName} (${quotedCols}) VALUES (${values});\n`);
        }
        else if (outputFmt === 'json') {
            const obj = {};
            hdrs.forEach((h, i) => {
                obj[h] = row[i] !== undefined ? String(row[i]) : '';
            });
            const prefix = isFirstJSONItem ? '  ' : ',\n  ';
            isFirstJSONItem = false;
            stream.push(prefix + JSON.stringify(obj));
        }
    }
    if (inputFmt === 'csv' || inputFmt === 'tsv') {
        const csvParser = parseCSVStream({
            delimiter: inputFmt === 'tsv' ? '\t' : ',',
            skip_empty_lines: true,
            relax_column_count: true,
            trim: true,
        });
        await pipeline(readable, csvParser, generatorTransform, writable);
    }
    else {
        // Standard line-by-line fallback for JSON / NDJSON / simple formats
        let buffer = '';
        const lineSplitter = new Transform({
            transform(chunk, encoding, callback) {
                buffer += chunk.toString('utf8');
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const parsed = JSON.parse(line);
                            if (typeof parsed === 'object' && parsed !== null) {
                                const keys = Object.keys(parsed);
                                const values = keys.map((k) => (parsed[k] !== null && parsed[k] !== undefined ? String(parsed[k]) : ''));
                                if (isFirstRow) {
                                    this.push(keys);
                                }
                                this.push(values);
                            }
                        }
                        catch {
                            // Ignore non-JSON lines
                        }
                    }
                }
                callback(null);
            },
            flush(callback) {
                if (buffer.trim()) {
                    try {
                        const parsed = JSON.parse(buffer);
                        if (typeof parsed === 'object' && parsed !== null) {
                            const keys = Object.keys(parsed);
                            const values = keys.map((k) => (parsed[k] !== null && parsed[k] !== undefined ? String(parsed[k]) : ''));
                            if (isFirstRow) {
                                this.push(keys);
                            }
                            this.push(values);
                        }
                    }
                    catch {
                        // Ignore
                    }
                }
                callback(null);
            },
        });
        await pipeline(readable, lineSplitter, generatorTransform, writable);
    }
}
