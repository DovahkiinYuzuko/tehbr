import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import { CLIFSM } from '../core/fsm.js';
import type { Alignment, TehbrIR } from '../core/types.js';
import { generateContent } from '../generators/index.js';
import { parseContent } from '../parsers/index.js';

function detectFormatFromExtension(filePath: string): string | null {
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

export async function runInteractiveMode(): Promise<void> {
  const fsm = new CLIFSM();
  p.intro('tehbr - Table Format Converter');

  fsm.transitionTo('ReadingInput');
  const inputFilePath = await p.text({
    message: 'Enter input file path:',
    placeholder: 'input.csv',
    validate(value) {
      if (!value) return 'Input file path is required.';
      if (!fs.existsSync(value)) return 'File does not exist.';
      return undefined;
    },
  });

  if (p.isCancel(inputFilePath)) {
    fsm.cancel();
    p.cancel('Operation cancelled.');
    return;
  }

  let inputFormat = detectFormatFromExtension(inputFilePath);
  if (!inputFormat) {
    const selectedInputFormat = await p.select({
      message: 'Select input format:',
      options: [
        { value: 'csv', label: 'CSV' },
        { value: 'tsv', label: 'TSV' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'html', label: 'HTML' },
        { value: 'ir', label: 'JSON (tehbr IR)' },
      ],
    });

    if (p.isCancel(selectedInputFormat)) {
      fsm.cancel();
      p.cancel('Operation cancelled.');
      return;
    }
    inputFormat = selectedInputFormat as string;
  }

  fsm.transitionTo('Generating');
  const outputFormat = await p.select({
    message: 'Select output format:',
    options: [
      { value: 'markdown', label: 'Markdown' },
      { value: 'html', label: 'HTML' },
      { value: 'csv', label: 'CSV' },
      { value: 'tsv', label: 'TSV' },
      { value: 'ir', label: 'JSON (tehbr IR)' },
    ],
  });

  if (p.isCancel(outputFormat)) {
    fsm.cancel();
    p.cancel('Operation cancelled.');
    return;
  }

  fsm.transitionTo('Parsing');
  const inputContent = fs.readFileSync(inputFilePath, 'utf8');
  let ir: TehbrIR;
  try {
    ir = await parseContent(inputFormat, inputContent);
  } catch (err: unknown) {
    fsm.transitionTo('Error');
    const msg = err instanceof Error ? err.message : String(err);
    p.cancel(`Failed to parse input file: ${msg}`);
    return;
  }

  const supportsAlignment = outputFormat === 'markdown' || outputFormat === 'html';
  if (supportsAlignment && ir.headers.length > 0) {
    const configureAlignment = await p.confirm({
      message: 'Do you want to configure column alignments?',
      initialValue: false,
    });

    if (p.isCancel(configureAlignment)) {
      fsm.cancel();
      p.cancel('Operation cancelled.');
      return;
    }

    if (configureAlignment) {
      const alignments: (Alignment | null)[] = [];
      for (const header of ir.headers) {
        const align = await p.select({
          message: `Alignment for column "${header}":`,
          options: [
            { value: 'null', label: 'Unspecified (null)' },
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
        });

        if (p.isCancel(align)) {
          fsm.cancel();
          p.cancel('Operation cancelled.');
          return;
        }

        alignments.push(align === 'null' ? null : (align as Alignment));
      }
      ir.alignments = alignments;
    }
  }

  fsm.transitionTo('WritingOutput');
  const outputFilePath = await p.text({
    message: 'Enter output file path:',
    placeholder: 'output.md',
    validate(value) {
      if (!value) return 'Output file path is required.';
      return undefined;
    },
  });

  if (p.isCancel(outputFilePath)) {
    fsm.cancel();
    p.cancel('Operation cancelled.');
    return;
  }

  try {
    const generated = generateContent(outputFormat as string, ir);
    fs.writeFileSync(outputFilePath, generated, 'utf8');
    fsm.transitionTo('Completed');
    p.outro(`Successfully converted and saved to ${outputFilePath}`);
  } catch (err: unknown) {
    fsm.transitionTo('Error');
    const msg = err instanceof Error ? err.message : String(err);
    p.cancel(`Failed to write output file: ${msg}`);
  }
}
