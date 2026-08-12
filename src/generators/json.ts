import { TehbrIR } from '../core/types.js';

export function generateJSON(ir: TehbrIR): string {
  const objects = ir.rows.map((row) => {
    const obj: Record<string, string> = {};
    ir.headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : '';
    });
    return obj;
  });

  return JSON.stringify(objects, null, 2);
}
