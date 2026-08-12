import path from 'node:path';
import { RokeeruLoader } from 'rokeeru';

let loader: RokeeruLoader | null = null;
let currentLanguage = 'en';

export async function initI18n(lang: string = 'en', localesDir?: string): Promise<void> {
  currentLanguage = lang;
  const targetDir = localesDir ?? path.resolve(process.cwd(), 'locales');
  loader = new RokeeruLoader(targetDir, 'en');
  await loader.load();
}

export function t(key: string, params?: Record<string, string>): string {
  if (!loader) {
    return key;
  }

  const localeObj = (loader.get(currentLanguage) ?? loader.get('en')) as Record<string, unknown> | undefined;
  if (!localeObj) {
    return key;
  }

  const parts = key.split('.');
  let val: unknown = localeObj;
  for (const part of parts) {
    if (val && typeof val === 'object' && part in (val as Record<string, unknown>)) {
      val = (val as Record<string, unknown>)[part];
    } else {
      val = undefined;
      break;
    }
  }

  if (typeof val !== 'string') {
    return key;
  }

  let result = val;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return result;
}
