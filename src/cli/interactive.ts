import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import { CLIFSM } from '../core/fsm.js';
import type { Alignment, TehbrIR } from '../core/types.js';
import { generateContent } from '../generators/index.js';
import { initI18n, t } from '../i18n/index.js';
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
      return 'json';
    default:
      return null;
  }
}

export async function runInteractiveMode(): Promise<void> {
  await initI18n();
  const fsm = new CLIFSM();
  p.intro(t('interactive.intro'));

  fsm.transitionTo('ReadingInput');
  const inputFilePath = await p.text({
    message: t('interactive.input_file_prompt'),
    placeholder: 'input.csv',
    validate(value) {
      if (!value) return t('interactive.input_file_req');
      if (!fs.existsSync(value)) return t('interactive.file_not_exist');
      return undefined;
    },
  });

  if (p.isCancel(inputFilePath)) {
    fsm.cancel();
    p.cancel(t('interactive.cancelled'));
    return;
  }

  let inputFormat = detectFormatFromExtension(inputFilePath);
  if (!inputFormat) {
    const selectedInputFormat = await p.select({
      message: t('interactive.select_input_format'),
      options: [
        { value: 'csv', label: 'CSV' },
        { value: 'tsv', label: 'TSV' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'html', label: 'HTML' },
        { value: 'json', label: 'JSON (Objects)' },
        { value: 'ir', label: 'JSON (tehbr IR)' },
      ],
    });

    if (p.isCancel(selectedInputFormat)) {
      fsm.cancel();
      p.cancel(t('interactive.cancelled'));
      return;
    }
    inputFormat = selectedInputFormat as string;
  }

  fsm.transitionTo('Generating');
  const outputFormat = await p.select({
    message: t('interactive.select_output_format'),
    options: [
      { value: 'markdown', label: 'Markdown' },
      { value: 'html', label: 'HTML' },
      { value: 'csv', label: 'CSV' },
      { value: 'tsv', label: 'TSV' },
      { value: 'json', label: 'JSON (Objects)' },
      { value: 'sql', label: 'SQL (CREATE/INSERT)' },
      { value: 'ir', label: 'JSON (tehbr IR)' },
    ],
  });

  if (p.isCancel(outputFormat)) {
    fsm.cancel();
    p.cancel(t('interactive.cancelled'));
    return;
  }

  let tableName: string | undefined;
  if (outputFormat === 'sql') {
    const defaultTableName = path.basename(inputFilePath, path.extname(inputFilePath)) || 'table_name';
    const tableNameInput = await p.text({
      message: t('interactive.table_name_prompt'),
      placeholder: defaultTableName,
      initialValue: defaultTableName,
    });

    if (p.isCancel(tableNameInput)) {
      fsm.cancel();
      p.cancel(t('interactive.cancelled'));
      return;
    }
    tableName = tableNameInput || defaultTableName;
  }

  fsm.transitionTo('Parsing');
  const inputContent = fs.readFileSync(inputFilePath, 'utf8');
  let ir: TehbrIR;
  try {
    ir = await parseContent(inputFormat, inputContent);
  } catch (err: unknown) {
    fsm.transitionTo('Error');
    const msg = err instanceof Error ? err.message : String(err);
    p.cancel(t('interactive.parse_failed', { msg }));
    return;
  }

  const supportsAlignment = outputFormat === 'markdown' || outputFormat === 'html';
  if (supportsAlignment && ir.headers.length > 0) {
    const configureAlignment = await p.confirm({
      message: t('interactive.configure_alignment'),
      initialValue: false,
    });

    if (p.isCancel(configureAlignment)) {
      fsm.cancel();
      p.cancel(t('interactive.cancelled'));
      return;
    }

    if (configureAlignment) {
      const alignments: (Alignment | null)[] = [];
      for (const header of ir.headers) {
        const align = await p.select({
          message: t('interactive.column_alignment_prompt', { header }),
          options: [
            { value: 'null', label: t('interactive.align_unspecified') },
            { value: 'left', label: t('interactive.align_left') },
            { value: 'center', label: t('interactive.align_center') },
            { value: 'right', label: t('interactive.align_right') },
          ],
        });

        if (p.isCancel(align)) {
          fsm.cancel();
          p.cancel(t('interactive.cancelled'));
          return;
        }

        alignments.push(align === 'null' ? null : (align as Alignment));
      }
      ir.alignments = alignments;
    }
  }

  fsm.transitionTo('WritingOutput');
  const outputFilePath = await p.text({
    message: t('interactive.output_file_prompt'),
    placeholder: 'output.md',
    validate(value) {
      if (!value) return t('interactive.output_file_req');
      return undefined;
    },
  });

  if (p.isCancel(outputFilePath)) {
    fsm.cancel();
    p.cancel(t('interactive.cancelled'));
    return;
  }

  try {
    const generated = generateContent(outputFormat as string, ir, { tableName });
    fs.writeFileSync(outputFilePath, generated, 'utf8');
    fsm.transitionTo('Completed');
    p.outro(t('interactive.success_outro', { path: outputFilePath }));
  } catch (err: unknown) {
    fsm.transitionTo('Error');
    const msg = err instanceof Error ? err.message : String(err);
    p.cancel(t('interactive.write_failed', { msg }));
  }
}
