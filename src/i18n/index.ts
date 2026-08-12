import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import rokeeruPkg from 'rokeeru';

const createLocaleLoader = (rokeeruPkg as any).createLocaleLoader || (rokeeruPkg as any).default?.createLocaleLoader;

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

export function getSupportedLocales(localesDir?: string): Record<string, string> {
  const dirPath = localesDir ?? baseLocalesDir;
  const result: Record<string, string> = {};

  if (fs.existsSync(dirPath)) {
    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const localeCode = path.basename(file, '.json');
          const localeObj = loadJSONLocale(localeCode, dirPath);
          const meta = localeObj?.meta as Record<string, string> | undefined;
          let name = localeCode;
          if (meta?.native_name && meta?.name && meta.native_name !== meta.name) {
            name = `${meta.native_name} (${meta.name})`;
          } else if (meta?.native_name) {
            name = meta.native_name;
          } else if (meta?.name) {
            name = meta.name;
          }
          result[localeCode] = name;
        }
      }
    } catch {
      // Fallback
    }
  }

  if (Object.keys(result).length === 0) {
    result['en'] = 'English';
  }

  return result;
}

export function detectOSLocale(supportedLocales?: Record<string, string>): string {
  const supported = supportedLocales ?? getSupportedLocales();
  const availableCodes = Object.keys(supported);

  try {
    const envLang = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || '';
    const intlLang = Intl.DateTimeFormat().resolvedOptions().locale || '';
    const rawLocale = (envLang || intlLang).trim();

    if (rawLocale) {
      const cleanRaw = rawLocale.split('.')[0].replace(/_/g, '-').trim();

      // Pass 1: Exact case-insensitive match
      const exactMatch = availableCodes.find((code) => code.toLowerCase() === cleanRaw.toLowerCase());
      if (exactMatch) {
        return exactMatch;
      }

      // Pass 2: Primary language subtag match (e.g. es-ES -> es, ja-JP -> ja)
      const primarySubtag = cleanRaw.split('-')[0].toLowerCase();
      const primaryMatch = availableCodes.find((code) => code.toLowerCase() === primarySubtag);
      if (primaryMatch) {
        return primaryMatch;
      }

      // Pass 3: Chinese script variant matching
      if (cleanRaw.toLowerCase().includes('hans') || cleanRaw.toLowerCase().includes('cn')) {
        const cnMatch = availableCodes.find((code) => code.toLowerCase() === 'zh-cn');
        if (cnMatch) return cnMatch;
      }
      if (cleanRaw.toLowerCase().includes('hant') || cleanRaw.toLowerCase().includes('tw') || cleanRaw.toLowerCase().includes('hk')) {
        const twMatch = availableCodes.find((code) => code.toLowerCase() === 'zh-tw');
        if (twMatch) return twMatch;
      }
    }
  } catch {
    // Ignore detection errors
  }

  return 'en'; // Default fallback
}

export async function initI18n(lang?: string, localesDir?: string): Promise<void> {
  baseLocalesDir = localesDir ?? path.resolve(process.cwd(), 'locales');
  const supportedLocales = getSupportedLocales(baseLocalesDir);

  let targetLang = lang;
  if (targetLang) {
    const normalized = targetLang.trim().toLowerCase();
    const matchKey = Object.keys(supportedLocales).find((k) => k.toLowerCase() === normalized);
    if (matchKey) {
      targetLang = matchKey;
    }
  }

  if (!targetLang) {
    targetLang = detectOSLocale(supportedLocales);
  }

  if (!(targetLang in supportedLocales)) {
    targetLang = 'en';
  }

  currentLanguage = targetLang;

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
