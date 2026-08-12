import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Command } from 'commander';
import { CLIFSM } from '../core/fsm.js';
import { generateContent } from '../generators/index.js';
import { parseContent } from '../parsers/index.js';
import { runInteractiveMode } from './interactive.js';
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
            return 'ir';
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
export async function runCLI(args) {
    const program = new Command();
    const fsm = new CLIFSM();
    program
        .name('tehbr')
        .description('Table format conversion CLI tool')
        .version('0.1.0')
        .argument('[input]', 'Input file path')
        .option('-o, --output <path>', 'Output file path (defaults to stdout)')
        .option('-f, --input-format <format>', 'Input format (csv, tsv, markdown, html, ir)')
        .option('-t, --output-format <format>', 'Output format (csv, tsv, markdown, html, ir)')
        .option('--no-header', 'Treat CSV/TSV 1st row as data instead of header')
        .option('-i, --interactive', 'Run in interactive mode');
    program.parse(args);
    const options = program.opts();
    const inputPath = program.args[0];
    if (options.interactive) {
        await runInteractiveMode();
        return;
    }
    if (!inputPath && process.stdin.isTTY) {
        program.help();
        return;
    }
    fsm.transitionTo('ReadingInput');
    let inputContent = '';
    let inFormat = options.inputFormat;
    if (inputPath) {
        if (!fs.existsSync(inputPath)) {
            fsm.transitionTo('Error');
            console.error(`Error: Input file "${inputPath}" not found.`);
            process.exit(1);
        }
        inputContent = fs.readFileSync(inputPath, 'utf8');
        if (!inFormat) {
            inFormat = detectFormatFromPath(inputPath);
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
        console.error('Error: Could not detect input format. Please specify --input-format (-f).');
        process.exit(1);
    }
    let outFormat = options.outputFormat;
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
        console.error(`Error during parsing: ${msg}`);
        process.exit(1);
    }
    fsm.transitionTo('Generating');
    let outputText = '';
    try {
        outputText = generateContent(outFormat, ir);
    }
    catch (err) {
        fsm.transitionTo('Error');
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error during generation: ${msg}`);
        process.exit(1);
    }
    fsm.transitionTo('WritingOutput');
    if (options.output) {
        try {
            fs.writeFileSync(options.output, outputText, 'utf8');
            fsm.transitionTo('Completed');
        }
        catch (err) {
            fsm.transitionTo('Error');
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`Error writing output file: ${msg}`);
            process.exit(1);
        }
    }
    else {
        console.log(outputText);
        fsm.transitionTo('Completed');
    }
}
