import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import rokeeruPkg from 'rokeeru';

const createLocaleLoader = (rokeeruPkg as any).createLocaleLoader || (rokeeruPkg as any).default?.createLocaleLoader;

export const SUPPORTED_LOCALES: Record<string, string> = {
  en: 'English',
  ja: '日本語 (Japanese)',
  'zh-CN': '简体中文 (Chinese Simplified)',
  'zh-TW': '繁體中文 (Chinese Traditional)',
  es: 'Español (Spanish)',
  de: 'Deutsch (German)',
  fr: 'Français (French)',
  ko: '한국어 (Korean)',
};

let loader: any = null;
let currentLanguage = 'en';
let baseLocalesDir = path.resolve(process.cwd(), 'locales');
const jsonCache = new Map<string, Record<string, unknown>>();

function loadJSONLocale(locale: string, dirPath: string): Record<string, unknown> | undefined {
  if (jsonCache.has(locale)) {
    return jsonCache.get(locale);
  }
  const jsonPath = path.join(dirPath, `${locale}.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(content);
      jsonCache.set(locale, parsed);
      return parsed;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function getSupportedLocales(): Record<string, string> {
  return SUPPORTED_LOCALES;
}

export function detectOSLocale(): string {
  try {
    const envLang = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || '';
    const intlLang = Intl.DateTimeFormat().resolvedOptions().locale || '';
    const rawLocale = (envLang || intlLang).toLowerCase();

    if (rawLocale.includes('zh-cn') || rawLocale.includes('zh_cn') || rawLocale.includes('zh-hans')) {
      return 'zh-CN';
    }
    if (rawLocale.includes('zh-tw') || rawLocale.includes('zh_tw') || rawLocale.includes('zh-hant') || rawLocale.includes('zh-hk')) {
      return 'zh-TW';
    }
    if (rawLocale.startsWith('ja')) {
      return 'ja';
    }
    if (rawLocale.startsWith('es')) {
      return 'es';
    }
    if (rawLocale.startsWith('de')) {
      return 'de';
    }
    if (rawLocale.startsWith('fr')) {
      return 'fr';
    }
    if (rawLocale.startsWith('ko')) {
      return 'ko';
    }
  } catch {
    // Ignore detection errors
  }

  return 'en'; // Default fallback
}

export async function initI18n(lang?: string, localesDir?: string): Promise<void> {
  let targetLang = lang;

  if (targetLang) {
    const normalized = targetLang.trim();
    if (normalized.toLowerCase() === 'zh-cn') targetLang = 'zh-CN';
    else if (normalized.toLowerCase() === 'zh-tw') targetLang = 'zh-TW';
    else targetLang = normalized.toLowerCase();
  }

  if (!targetLang) {
    targetLang = detectOSLocale();
  }

  if (!(targetLang in SUPPORTED_LOCALES)) {
    targetLang = 'en';
  }

  currentLanguage = targetLang;
  baseLocalesDir = localesDir ?? path.resolve(process.cwd(), 'locales');

  if (!loader && typeof createLocaleLoader === 'function') {
    try {
      loader = createLocaleLoader(baseLocalesDir, 'en');
    } catch {
      loader = null;
    }
  }

  if (loader) {
    try {
      loader.load(currentLanguage);
    } catch {
      // Fallback
    }
  }
}

export function t(key: string, params?: Record<string, string>): string {
  let localeObj: Record<string, unknown> | undefined;

  if (loader) {
    try {
      localeObj = (loader.load(currentLanguage) ?? loader.load('en')) as Record<string, unknown>;
    } catch {
      localeObj = undefined;
    }
  }

  if (!localeObj) {
    localeObj = loadJSONLocale(currentLanguage, baseLocalesDir) ?? loadJSONLocale('en', baseLocalesDir);
  }

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
