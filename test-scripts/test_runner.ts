import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { generateContent } from '../src/generators/index.js';
import { parseContent } from '../src/parsers/index.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function assertTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`[PASS] ${name}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name, passed: false, error: msg });
    console.error(`[FAIL] ${name}: ${msg}`);
  }
}

function assertEquals(actual: unknown, expected: unknown, message?: string) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(message ?? `Expected ${expectedStr}, got ${actualStr}`);
  }
}

async function assertRejects(fn: () => Promise<unknown> | unknown, message?: string) {
  try {
    await fn();
  } catch {
    return;
  }
  throw new Error(message ?? 'Expected exception but function succeeded.');
}

export async function runTests(): Promise<void> {
  console.log('--- Running tehbr Test Suite ---');

  // Test 1: CSV -> Markdown
  await assertTest('Test 1: CSV to Markdown conversion with East Asian Width', async () => {
    const csvContent = '名前,役割,数値\nユズコ,開発者,100\nGemini,相棒,999';
    const ir = await parseContent('csv', csvContent);
    assertEquals(ir.headers, ['名前', '役割', '数値']);
    assertEquals(ir.rows.length, 2);

    const mdOutput = generateContent('markdown', ir);
    if (!mdOutput.includes('| 名前   | 役割   | 数値 |')) {
      throw new Error(`Markdown output unexpected: \n${mdOutput}`);
    }
  });

  // Test 2: HTML -> IR / Markdown with alignments
  await assertTest('Test 2: HTML to IR/Markdown with alignment parsing', async () => {
    const htmlContent = `
      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Col 1</th>
            <th style="text-align: center;">Col 2</th>
            <th style="text-align: right;">Col 3</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>A</td><td>B</td><td>C</td></tr>
        </tbody>
      </table>
    `;
    const ir = await parseContent('html', htmlContent);
    assertEquals(ir.alignments, ['left', 'center', 'right']);

    const mdOutput = generateContent('markdown', ir);
    if (!mdOutput.includes(':---') || !mdOutput.includes(':---:') || !mdOutput.includes('---:')) {
      throw new Error(`Markdown delimiter missing colons: \n${mdOutput}`);
    }
  });

  // Test 3: --no-header CSV parsing
  await assertTest('Test 3: CSV parsing with --no-header option', async () => {
    const csvContent = 'Val 1,Val 2,Val 3\nVal 4,Val 5,Val 6';
    const ir = await parseContent('csv', csvContent, { noHeader: true });
    assertEquals(ir.headers, ['Column 1', 'Column 2', 'Column 3']);
    assertEquals(ir.rows.length, 2);
    assertEquals(ir.rows[0], ['Val 1', 'Val 2', 'Val 3']);
  });

  // Test 4: End-to-end Roundtrip pipeline (CSV -> HTML -> Markdown)
  await assertTest('Test 4: Roundtrip conversion pipeline (CSV -> HTML -> Markdown)', async () => {
    const initialCSV = 'HeaderA,HeaderB\nCellA1,CellB1';
    const ir1 = await parseContent('csv', initialCSV);
    const html = generateContent('html', ir1);
    const ir2 = await parseContent('html', html);
    const md = generateContent('markdown', ir2);

    if (!md.includes('HeaderA') || !md.includes('CellA1')) {
      throw new Error(`Roundtrip conversion missing data: \n${md}`);
    }
  });

  // Test 5: JSON parsing & generation (stringification & key union padding)
  await assertTest('Test 5: JSON parsing (stringification & key union) and generation', async () => {
    const jsonInput = JSON.stringify([
      { col1: 'val1', col2: 25 },
      { col1: 'val3', col3: true, col4: null }
    ]);
    const ir = await parseContent('json', jsonInput);
    assertEquals(ir.headers, ['col1', 'col2', 'col3', 'col4']);
    assertEquals(ir.rows[0], ['val1', '25', '', '']);
    assertEquals(ir.rows[1], ['val3', '', 'true', '']);

    const jsonOutput = generateContent('json', ir);
    const parsedBack = JSON.parse(jsonOutput);
    assertEquals(parsedBack.length, 2);
    assertEquals(parsedBack[0].col2, '25');
  });

  // Test 6: SQL generation with quotes escaping
  await assertTest('Test 6: SQL generation (CREATE TABLE & INSERT INTO)', async () => {
    const ir = {
      headers: ['名前', 'col "quote"'],
      rows: [
        ['ユズコ', "O'Reilly"],
        ['Gemini', 'Normal']
      ]
    };
    const sqlOutput = generateContent('sql', ir, { tableName: 'users_table' });
    if (!sqlOutput.includes('CREATE TABLE "users_table"')) {
      throw new Error(`SQL CREATE TABLE missing: \n${sqlOutput}`);
    }
    if (!sqlOutput.includes('"col ""quote""" TEXT')) {
      throw new Error(`SQL column quote escaping failed: \n${sqlOutput}`);
    }
    if (!sqlOutput.includes("'O''Reilly'")) {
      throw new Error(`SQL single quote escaping failed: \n${sqlOutput}`);
    }
  });

  // Test 7: Safety - Malformed JSON error handling
  await assertTest('Test 7: Safety - Malformed JSON error handling', async () => {
    await assertRejects(async () => parseContent('json', '{ invalid json syntax }'));
  });

  // Test 8: Safety - Mixed non-object array items in JSON
  await assertTest('Test 8: Safety - Mixed non-object array items in JSON', async () => {
    const mixedInput = JSON.stringify([
      { a: 'valA' },
      'invalid_string_item',
      12345,
      null,
      { a: 'valA2', b: true }
    ]);
    const ir = await parseContent('json', mixedInput);
    assertEquals(ir.headers, ['a', 'b']);
    assertEquals(ir.rows.length, 5);
    assertEquals(ir.rows[0], ['valA', '']);
    assertEquals(ir.rows[1], ['', '']);
    assertEquals(ir.rows[2], ['', '']);
    assertEquals(ir.rows[3], ['', '']);
    assertEquals(ir.rows[4], ['valA2', 'true']);
  });

  // Test 9: Safety - SQL Injection safety & quote escaping
  await assertTest('Test 9: Safety - SQL Injection safety & quote escaping', async () => {
    const ir = {
      headers: ['user"; --', 'col'],
      rows: [["Robert'; DROP TABLE users; --", "normal"]]
    };
    const sql = generateContent('sql', ir, { tableName: 'tbl"; --' });
    if (!sql.includes('CREATE TABLE "tbl""; --"')) {
      throw new Error(`Table name escaping failed: \n${sql}`);
    }
    if (!sql.includes('"user""; --" TEXT')) {
      throw new Error(`Header escaping failed: \n${sql}`);
    }
    if (!sql.includes("'Robert''; DROP TABLE users; --'")) {
      throw new Error(`Value escaping failed: \n${sql}`);
    }
  });

  // Test 10: Safety - Unsupported format error handling
  await assertTest('Test 10: Safety - Unsupported format error handling', async () => {
    await assertRejects(async () => parseContent('unknown_xyz', 'data'));
    await assertRejects(async () => generateContent('unknown_xyz', { headers: ['A'], rows: [['B']] }));
  });

  // Test 11: Safety - Uneven row lengths and empty data safety
  await assertTest('Test 11: Safety - Uneven row lengths and empty data safety', async () => {
    const shortRowIR = {
      headers: ['Col1', 'Col2', 'Col3'],
      rows: [['Val1']]
    };
    // Ensure generators handle short row without throwing undefined crashes
    const md = generateContent('markdown', shortRowIR);
    const html = generateContent('html', shortRowIR);
    const csv = generateContent('csv', shortRowIR);
    const json = generateContent('json', shortRowIR);
    const sql = generateContent('sql', shortRowIR);

    if (!md || !html || !csv || !json || !sql) {
      throw new Error('Generators returned empty output for short row IR');
    }
  });

  // Test 12: RFC 4180 CSV multiline cells, commas, and double quotes
  await assertTest('Test 12: RFC 4180 CSV multiline cells, commas, and double quotes', async () => {
    const rawCSV = '"Header 1","Header ""2""","Header 3"\n"Line1\nLine2","Val, with comma","""Quoted"" Value"';
    const ir = await parseContent('csv', rawCSV);
    assertEquals(ir.headers, ['Header 1', 'Header "2"', 'Header 3']);
    assertEquals(ir.rows[0][0], 'Line1\nLine2');
    assertEquals(ir.rows[0][1], 'Val, with comma');
    assertEquals(ir.rows[0][2], '"Quoted" Value');

    const generatedCSV = generateContent('csv', ir);
    const reParsedIR = await parseContent('csv', generatedCSV);
    assertEquals(reParsedIR.rows[0][0], 'Line1\nLine2');
    assertEquals(reParsedIR.rows[0][1], 'Val, with comma');
    assertEquals(reParsedIR.rows[0][2], '"Quoted" Value');
  });

  // Test 13: Large array & circular/invalid structure JSON safety
  await assertTest('Test 13: Large array & invalid structure JSON safety', async () => {
    const largeArray = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      data: `item_${i}`
    }));
    const jsonStr = JSON.stringify(largeArray);
    const ir = await parseContent('json', jsonStr);
    assertEquals(ir.rows.length, 1000);
    assertEquals(ir.rows[999][0], '999');

    const outputJson = generateContent('json', ir);
    const parsedBack = JSON.parse(outputJson);
    assertEquals(parsedBack.length, 1000);
  });

  // Test 14: Clipboard integration utility test
  await assertTest('Test 14: Clipboard integration utility test', async () => {
    const { readClipboard, writeClipboard } = await import('../src/utils/clipboard.js');
    const testPayload = 'tehbr_clipboard_test_12345';
    writeClipboard(testPayload);
    const readBack = readClipboard();
    if (!readBack.includes(testPayload)) {
      throw new Error(`Clipboard read/write mismatch: expected '${testPayload}', got '${readBack}'`);
    }
  });

  // Test 15: Bigdata Stream pipeline conversion (5,000 rows CSV to SQL)
  await assertTest('Test 15: Bigdata Stream pipeline conversion (5,000 rows CSV to SQL)', async () => {
    const { runStreamPipeline } = await import('../src/core/stream.js');
    const tmpInput = path.join(process.cwd(), 'scratch', 'test_big_input.csv');
    const tmpOutput = path.join(process.cwd(), 'scratch', 'test_big_output.sql');

    const scratchDir = path.dirname(tmpInput);
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    const csvLines = ['id,name,value'];
    for (let i = 1; i <= 5000; i++) {
      csvLines.push(`${i},user_${i},${i * 10}`);
    }
    fs.writeFileSync(tmpInput, csvLines.join('\n'), 'utf8');

    await runStreamPipeline({
      inputPath: tmpInput,
      outputPath: tmpOutput,
      inputFormat: 'csv',
      outputFormat: 'sql',
      tableName: 'big_table',
    });

    const outputSQL = fs.readFileSync(tmpOutput, 'utf8');
    if (!outputSQL.includes('CREATE TABLE "big_table"')) {
      throw new Error('Streaming SQL CREATE TABLE missing');
    }
    if (!outputSQL.includes("INSERT INTO \"big_table\" (\"id\", \"name\", \"value\") VALUES ('5000', 'user_5000', '50000');")) {
      throw new Error('Streaming SQL INSERT last row missing');
    }

    if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput);
    if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput);
  });

  // Test 16: High-load Stress Test (100,000 rows CSV streaming to SQL with memory & time tracking)
  await assertTest('Test 16: High-load Stress Test (100,000 rows CSV streaming to SQL)', async () => {
    const { runStreamPipeline } = await import('../src/core/stream.js');
    const tmpInput = path.join(process.cwd(), 'scratch', 'test_stress_100k.csv');
    const tmpOutput = path.join(process.cwd(), 'scratch', 'test_stress_100k.sql');

    const scratchDir = path.dirname(tmpInput);
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    // Stream write 100,000 CSV rows to disk for zero-heap setup
    const writeStream = fs.createWriteStream(tmpInput, { encoding: 'utf8' });
    writeStream.write('id,username,email,score\n');
    for (let i = 1; i <= 100000; i++) {
      writeStream.write(`${i},user_${i},user_${i}@example.com,${i * 5}\n`);
    }
    await new Promise((resolve) => writeStream.end(resolve));

    const initialMemory = process.memoryUsage().heapUsed;
    const startTime = Date.now();

    await runStreamPipeline({
      inputPath: tmpInput,
      outputPath: tmpOutput,
      inputFormat: 'csv',
      outputFormat: 'sql',
      tableName: 'stress_users',
    });

    const elapsedMs = Date.now() - startTime;
    const finalMemory = process.memoryUsage().heapUsed;
    const heapDiffMb = ((finalMemory - initialMemory) / (1024 * 1024)).toFixed(2);

    const stats = fs.statSync(tmpOutput);
    if (stats.size < 1000000) {
      throw new Error(`Output file size unexpectedly small: ${stats.size} bytes`);
    }

    console.log(`       [Stress Stats] 100,000 rows converted in ${elapsedMs}ms | Heap Delta: ${heapDiffMb} MB | Output Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

    if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput);
    if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput);
  });

  // Test 17: Multilingual input encoding decoding (Shift_JIS, GBK, Windows-1252, UTF-16LE)
  await assertTest('Test 17: Multilingual input encoding decoding (Shift_JIS, GBK, Windows-1252, UTF-16LE)', async () => {
    const iconv = (await import('iconv-lite')).default;
    const { decodeBuffer } = await import('../src/utils/encoding.js');
    const { parseContent } = await import('../src/parsers/index.js');

    // 1. Shift_JIS test
    const sjisBuffer = iconv.encode('名前,役職\n山田太郎,開発者\n', 'shift_jis');
    const sjisDecoded = decodeBuffer(sjisBuffer, 'shift_jis');
    const irSjis = await parseContent('csv', sjisDecoded);
    assertEquals(irSjis.headers, ['名前', '役職']);
    assertEquals(irSjis.rows[0], ['山田太郎', '開発者']);

    // 2. GBK (Simplified Chinese) test
    const gbkBuffer = iconv.encode('姓名,职位\n张伟,工程师\n', 'gbk');
    const gbkDecoded = decodeBuffer(gbkBuffer, 'gbk');
    const irGbk = await parseContent('csv', gbkDecoded);
    assertEquals(irGbk.headers, ['姓名', '职位']);
    assertEquals(irGbk.rows[0], ['张伟', '工程师']);

    // 3. Windows-1252 (Western European) test
    const winBuffer = iconv.encode('Name,Role\nRené,Développeur\n', 'windows-1252');
    const winDecoded = decodeBuffer(winBuffer, 'windows-1252');
    const irWin = await parseContent('csv', winDecoded);
    assertEquals(irWin.rows[0], ['René', 'Développeur']);

    // 4. UTF-16LE with BOM test
    const utf16Buffer = Buffer.concat([Buffer.from([0xff, 0xfe]), iconv.encode('ID,City\n1,Tokyo\n', 'utf-16le')]);
    const utf16Decoded = decodeBuffer(utf16Buffer); // Automatic BOM detection
    const irUtf16 = await parseContent('csv', utf16Decoded);
    assertEquals(irUtf16.headers, ['ID', 'City']);
    assertEquals(irUtf16.rows[0], ['1', 'Tokyo']);
  });

  // Test 18: Malformed / invalid / weird character encoding safety
  await assertTest('Test 18: Malformed / invalid / weird character encoding safety', async () => {
    const { decodeBuffer } = await import('../src/utils/encoding.js');
    const { parseContent } = await import('../src/parsers/index.js');

    // 1. Invalid / unknown encoding name error handling
    let caughtError = false;
    try {
      decodeBuffer(Buffer.from('test'), 'invalid_encoding_xyz_999');
    } catch (err: unknown) {
      caughtError = true;
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('Unsupported or invalid encoding name')) {
        throw new Error(`Unexpected error message for invalid encoding: ${msg}`);
      }
    }
    if (!caughtError) {
      throw new Error('Expected error for invalid encoding name was not thrown');
    }

    // 2. Corrupted byte sequence decoding safety
    const corruptedBuffer = Buffer.from([0x81, 0x00, 0xff, 0xfe, 0xe0, 0xff, 0x31, 0x2c, 0x32, 0x0a]);
    const decodedCorrupted = decodeBuffer(corruptedBuffer, 'shift_jis');
    if (typeof decodedCorrupted !== 'string') {
      throw new Error('Corrupted buffer decoding failed to return a string');
    }
    const irCorrupted = await parseContent('csv', decodedCorrupted);
    if (!irCorrupted || !Array.isArray(irCorrupted.rows)) {
      throw new Error('Corrupted buffer parsing failed to return valid TehbrIR');
    }

    // 3. Binary noise with null bytes safety
    const nullByteCSV = 'HeaderA,HeaderB\nVal\0One,Val\0Two\n';
    const irNull = await parseContent('csv', nullByteCSV);
    assertEquals(irNull.headers, ['HeaderA', 'HeaderB']);
    if (!irNull.rows[0][0].includes('Val')) {
      throw new Error('Null byte CSV value parsed incorrectly');
    }
  });

  // Test 19: i18n OS detection, dynamic locale discovery, default fallback en, and major languages
  await assertTest('Test 19: i18n OS detection, dynamic locale discovery, default fallback en, and major languages', async () => {
    const { initI18n, t, getSupportedLocales, detectOSLocale } = await import('../src/i18n/index.js');

    // 1. Check supported locales registry (dynamically extracted from locales/*.json meta section)
    const locales = getSupportedLocales();
    if (!('en' in locales) || !('ja' in locales) || !('zh-CN' in locales)) {
      throw new Error(`Dynamic locale discovery failed. Keys: ${Object.keys(locales).join(', ')}`);
    }
    assertEquals(locales['ja'], '日本語 (Japanese)');
    assertEquals(locales['en'], 'English');

    // 2. Test fallback to default 'en' for invalid/unknown locale
    await initI18n('unknown_locale_xyz');
    const descEn = t('cli.description');
    if (!descEn.includes('Table format conversion CLI tool')) {
      throw new Error(`Fallback to 'en' failed, got: ${descEn}`);
    }

    // 3. Test explicit locale switching to 'ja', 'zh-CN', 'es', 'de', 'fr', 'ko'
    await initI18n('ja');
    assertEquals(t('cli.description'), '表フォーマット相互変換 CLI ツール');

    await initI18n('zh-CN');
    assertEquals(t('cli.description'), '表格格式转换 CLI 工具');

    await initI18n('zh-TW');
    assertEquals(t('cli.description'), '表格格式轉換 CLI 工具');

    await initI18n('es');
    assertEquals(t('cli.description'), 'Herramienta CLI de conversión de formatos de tabla');

    await initI18n('de');
    assertEquals(t('cli.description'), 'Tabellenformat-Konvertierungs-CLI-Werkzeug');

    await initI18n('fr');
    assertEquals(t('cli.description'), 'Outil CLI de conversion de format de tableau');

    await initI18n('ko');
    assertEquals(t('cli.description'), '표 형식 변환 CLI 도구');

    // 4. OS detection sanity
    const detected = detectOSLocale();
    if (typeof detected !== 'string' || !detected) {
      throw new Error('OS locale detection returned invalid value');
    }
  });

  // Logging results
  const logsDir = path.join(process.cwd(), 'test-scripts', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logsDir, `test_run_${timestamp}.log`);

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  const logContent = [
    `Tehbr Test Run Summary (${new Date().toLocaleString()})`,
    `Total: ${results.length}, Passed: ${passedCount}, Failed: ${failedCount}`,
    '----------------------------------------',
    ...results.map((r) => `[${r.passed ? 'PASS' : 'FAIL'}] ${r.name}${r.error ? ` - ${r.error}` : ''}`),
  ].join('\n');

  fs.writeFileSync(logPath, logContent, 'utf8');
  console.log(`\nTest Log written to: ${logPath}`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
