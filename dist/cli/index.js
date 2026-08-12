import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Command } from 'commander';
import { CLIFSM } from '../core/fsm.js';
import { generateContent } from '../generators/index.js';
import { initI18n, t } from '../i18n/index.js';
import { parseContent } from '../parsers/index.js';
import { runInteractiveMode } from './interactive.js';
import { readClipboard, writeClipboard } from '../utils/clipboard.js';
function detectFormatFromContent(content) {
    const trimmed = content.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        return 'json';
    }
    if (trimmed.toLowerCase().includes('<table')) {
        return 'html';
    }
    if (trimmed.includes('\t')) {
        return 'tsv';
    }
    if (trimmed.includes('|')) {
        return 'markdown';
    }
    return 'csv';
}
function detectFormatFromPath(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.csv':
            return 'csv';
        case '.tsv':
            return 'tsv';
        case '.md':
        case '.markdown':
            return 'markdown';
        case '.html':
        case '.htm':
            return 'html';
        case '.json':
            return 'json';
        default:
            return null;
    }
}
async function readStdin() {
    return new Promise((resolve, reject) => {
        let content = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
            content += chunk;
        });
        process.stdin.on('end', () => {
            resolve(content);
        });
        process.stdin.on('error', (err) => {
            reject(err);
        });
    });
}
import { decodeBuffer } from '../utils/encoding.js';
import { runStreamPipeline } from '../core/stream.js';
export async function runCLI(args) {
    await initI18n();
    const program = new Command();
    const fsm = new CLIFSM();
    program
        .name('tehbr')
        .description(t('cli.description'))
        .version('0.1.0')
        .argument('[input]', t('cli.arg_input'))
        .option('-o, --output <path>', t('cli.opt_output'))
        .option('-f, --input-format <format>', t('cli.opt_input_format'))
        .option('-t, --output-format <format>', t('cli.opt_output_format'))
        .option('-tbl, --table-name <name>', t('cli.opt_table_name'))
        .option('-e, --encoding <name>', t('cli.opt_encoding'))
        .option('-c, --clip', t('cli.opt_clip'))
        .option('--stream', t('cli.opt_stream'))
        .option('--no-header', t('cli.opt_no_header'))
        .option('-i, --interactive', t('cli.opt_interactive'));
    program.parse(args);
    const options = program.opts();
    const inputPath = program.args[0];
    if (options.interactive) {
        await runInteractiveMode();
        return;
    }
    if (!inputPath && !options.clip && process.stdin.isTTY) {
        program.help();
        return;
    }
    let inFormat = options.inputFormat || (inputPath ? detectFormatFromPath(inputPath) : null);
    let outFormat = options.outputFormat || (options.output ? detectFormatFromPath(options.output) : null);
    if (options.stream) {
        if (outFormat === 'markdown' || outFormat === 'html') {
            console.warn('Warning: Streaming mode (--stream) does not support markdown/html alignment padding. Falling back to batch mode.');
        }
        else {
            fsm.transitionTo('ReadingInput');
            try {
                await runStreamPipeline({
                    inputPath,
                    outputPath: options.output,
                    inputFormat: inFormat || 'csv',
                    outputFormat: outFormat || 'markdown',
                    tableName: options.tableName,
                    noHeader: !options.header,
                    encoding: options.encoding,
                });
                fsm.transitionTo('Completed');
                return;
            }
            catch (err) {
                fsm.transitionTo('Error');
                const msg = err instanceof Error ? err.message : String(err);
                console.error(t('cli.err_parse_failed', { msg }));
                process.exit(1);
            }
        }
    }
    fsm.transitionTo('ReadingInput');
    let inputContent = '';
    if (inputPath) {
        if (!fs.existsSync(inputPath)) {
            fsm.transitionTo('Error');
            console.error(t('cli.err_input_not_found', { path: inputPath }));
            process.exit(1);
        }
        const rawBuffer = fs.readFileSync(inputPath);
        inputContent = decodeBuffer(rawBuffer, options.encoding);
        if (!inFormat) {
            inFormat = detectFormatFromPath(inputPath);
        }
    }
    else if (options.clip) {
        try {
            inputContent = readClipboard();
            if (!inFormat) {
                inFormat = detectFormatFromContent(inputContent);
            }
        }
        catch (err) {
            fsm.transitionTo('Error');
            const msg = err instanceof Error ? err.message : String(err);
            console.error(t('cli.err_parse_failed', { msg }));
            process.exit(1);
        }
    }
    else if (!process.stdin.isTTY) {
        inputContent = await readStdin();
    }
    else {
        program.help();
        return;
    }
    if (!inFormat) {
        fsm.transitionTo('Error');
        console.error(t('cli.err_detect_input_format'));
        process.exit(1);
    }
    if (!outFormat && options.output) {
        outFormat = detectFormatFromPath(options.output);
    }
    if (!outFormat) {
        outFormat = 'markdown';
    }
    fsm.transitionTo('Parsing');
    let ir;
    try {
        ir = await parseContent(inFormat, inputContent, { noHeader: !options.header });
    }
    catch (err) {
        fsm.transitionTo('Error');
        const msg = err instanceof Error ? err.message : String(err);
        console.error(t('cli.err_parse_failed', { msg }));
        process.exit(1);
    }
    fsm.transitionTo('Generating');
    let outputText = '';
    try {
        const tableName = options.tableName || (inputPath ? path.basename(inputPath, path.extname(inputPath)) : undefined);
        outputText = generateContent(outFormat, ir, { tableName });
    }
    catch (err) {
        fsm.transitionTo('Error');
        const msg = err instanceof Error ? err.message : String(err);
        console.error(t('cli.err_generate_failed', { msg }));
        process.exit(1);
    }
    fsm.transitionTo('WritingOutput');
    if (options.output) {
        try {
            fs.writeFileSync(options.output, outputText, 'utf8');
            if (options.clip) {
                writeClipboard(outputText);
            }
            fsm.transitionTo('Completed');
        }
        catch (err) {
            fsm.transitionTo('Error');
            const msg = err instanceof Error ? err.message : String(err);
            console.error(t('cli.err_write_failed', { msg }));
            process.exit(1);
        }
    }
    else {
        if (options.clip) {
            try {
                writeClipboard(outputText);
            }
            catch (err) {
                console.error('Warning: Failed to write to clipboard:', err instanceof Error ? err.message : String(err));
            }
        }
        console.log(outputText);
        fsm.transitionTo('Completed');
    }
}
