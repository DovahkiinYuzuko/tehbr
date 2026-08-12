import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Command } from 'commander';
import { CLIFSM } from '../core/fsm.js';
import type { TehbrIR } from '../core/types.js';
import { generateContent } from '../generators/index.js';
import { initI18n, t } from '../i18n/index.js';
import { parseContent } from '../parsers/index.js';
import { runInteractiveMode } from './interactive.js';

function detectFormatFromPath(filePath: string): string | null {
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

export async function runCLI(args: string[]): Promise<void> {
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
    .option('--no-header', t('cli.opt_no_header'))
    .option('-i, --interactive', t('cli.opt_interactive'));

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
      console.error(t('cli.err_input_not_found', { path: inputPath }));
      process.exit(1);
    }
    inputContent = fs.readFileSync(inputPath, 'utf8');
    if (!inFormat) {
      inFormat = detectFormatFromPath(inputPath);
    }
  } else if (!process.stdin.isTTY) {
    inputContent = await readStdin();
  } else {
    program.help();
    return;
  }

  if (!inFormat) {
    fsm.transitionTo('Error');
    console.error(t('cli.err_detect_input_format'));
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
  let ir: TehbrIR;
  try {
    ir = await parseContent(inFormat, inputContent, { noHeader: !options.header });
  } catch (err: unknown) {
    fsm.transitionTo('Error');
    const msg = err instanceof Error ? err.message : String(err);
    console.error(t('cli.err_parse_failed', { msg }));
    process.exit(1);
  }

  fsm.transitionTo('Generating');
  let outputText = '';
  try {
    outputText = generateContent(outFormat, ir);
  } catch (err: unknown) {
    fsm.transitionTo('Error');
    const msg = err instanceof Error ? err.message : String(err);
    console.error(t('cli.err_generate_failed', { msg }));
    process.exit(1);
  }

  fsm.transitionTo('WritingOutput');
  if (options.output) {
    try {
      fs.writeFileSync(options.output, outputText, 'utf8');
      fsm.transitionTo('Completed');
    } catch (err: unknown) {
      fsm.transitionTo('Error');
      const msg = err instanceof Error ? err.message : String(err);
      console.error(t('cli.err_write_failed', { msg }));
      process.exit(1);
    }
  } else {
    console.log(outputText);
    fsm.transitionTo('Completed');
  }
}
