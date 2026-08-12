import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Command } from 'commander';
import type { TehbrIR } from '../core/types.js';
import { generateContent } from '../generators/index.js';
import { initI18n, t } from '../i18n/index.js';
import { parseContent } from '../parsers/index.js';
import { runInteractiveMode } from './interactive.js';

import { readClipboard, writeClipboard } from '../utils/clipboard.js';

function detectFormatFromContent(content: string): string {
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

const EXT_TO_FORMAT_MAP: Record<string, string> = {
  '.csv': 'csv',
  '.tsv': 'tsv',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.html': 'html',
  '.htm': 'html',
  '.json': 'json',
};

export function detectFormatFromPath(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase();
  return EXT_TO_FORMAT_MAP[ext] || null;
}

async function readStdin(): Promise<string> {
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

import { getSupportedLocales } from '../i18n/index.js';
import { decodeBuffer } from '../utils/encoding.js';
import { runStreamPipeline } from '../core/stream.js';

export async function runCLI(args: string[]): Promise<void> {
  const program = new Command();

  // Quick pre-parse for --lang argument before full i18n init
  let requestedLang: string | undefined = undefined;
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--lang' || args[i] === '-l') && args[i + 1]) {
      requestedLang = args[i + 1];
      break;
    } else if (args[i].startsWith('--lang=')) {
      requestedLang = args[i].split('=')[1];
      break;
    }
  }

  await initI18n(requestedLang);

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
    .option('--lang <locale>', t('cli.opt_lang'))
    .option('--list-locales', t('cli.opt_list_locales'))
    .option('--no-header', t('cli.opt_no_header'))
    .option('-i, --interactive', t('cli.opt_interactive'));

  program.parse(args);

  const options = program.opts();
  const inputPath = program.args[0];

  if (options.listLocales) {
    console.log('Supported UI Languages / Locales:');
    const locales = getSupportedLocales();
    for (const [code, name] of Object.entries(locales)) {
      console.log(`  ${code.padEnd(8)} ${name}`);
    }
    return;
  }

  if (options.interactive) {
    await runInteractiveMode();
    return;
  }

  if (!inputPath && !options.clip && process.stdin.isTTY) {
    program.help();
    return;
  }

  let inFormat: string | null = options.inputFormat || (inputPath ? detectFormatFromPath(inputPath) : null);
  let outFormat: string | null = options.outputFormat || (options.output ? detectFormatFromPath(options.output) : null);

  if (options.stream) {
    if (outFormat === 'markdown' || outFormat === 'html') {
      console.warn('Warning: Streaming mode (--stream) does not support markdown/html alignment padding. Falling back to batch mode.');
    } else {
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
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(t('cli.err_parse_failed', { msg }));
        process.exit(1);
      }
    }
  }

  let inputContent = '';

  if (inputPath) {
    if (!fs.existsSync(inputPath)) {
      console.error(t('cli.err_input_not_found', { path: inputPath }));
      process.exit(1);
    }
    const rawBuffer = fs.readFileSync(inputPath);
    inputContent = decodeBuffer(rawBuffer, options.encoding);
    if (!inFormat) {
      inFormat = detectFormatFromPath(inputPath);
    }
  } else if (options.clip) {
    try {
      inputContent = readClipboard();
      if (!inFormat) {
        inFormat = detectFormatFromContent(inputContent);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(t('cli.err_parse_failed', { msg }));
      process.exit(1);
    }
  } else if (!process.stdin.isTTY) {
    inputContent = await readStdin();
  } else {
    program.help();
    return;
  }

  if (!inFormat) {
    console.error(t('cli.err_detect_input_format'));
    process.exit(1);
  }

  if (!outFormat && options.output) {
    outFormat = detectFormatFromPath(options.output);
  }

  if (!outFormat) {
    outFormat = 'markdown';
  }

  let ir: TehbrIR;
  try {
    ir = await parseContent(inFormat, inputContent, { noHeader: !options.header });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(t('cli.err_parse_failed', { msg }));
    process.exit(1);
  }

  let outputText = '';
  try {
    const tableName = options.tableName || (inputPath ? path.basename(inputPath, path.extname(inputPath)) : undefined);
    outputText = generateContent(outFormat, ir, { tableName });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(t('cli.err_generate_failed', { msg }));
    process.exit(1);
  }

  if (options.output) {
    try {
      fs.writeFileSync(options.output, outputText, 'utf8');
      if (options.clip) {
        writeClipboard(outputText);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(t('cli.err_write_failed', { msg }));
      process.exit(1);
    }
  } else {
    if (options.clip) {
      try {
        writeClipboard(outputText);
      } catch (err: unknown) {
        console.error('Warning: Failed to write to clipboard:', err instanceof Error ? err.message : String(err));
      }
    }
    console.log(outputText);
  }
}

