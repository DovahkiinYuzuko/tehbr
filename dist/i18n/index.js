import path from 'node:path';
import { RokeeruLoader } from 'rokeeru';
let loader = null;
let currentLanguage = 'en';
export async function initI18n(lang = 'en', localesDir) {
    currentLanguage = lang;
    const targetDir = localesDir ?? path.resolve(process.cwd(), 'locales');
    loader = new RokeeruLoader(targetDir, 'en');
    loader.load('en');
}
export function t(key, params) {
    if (!loader) {
        return key;
    }
    let localeObj;
    try {
        localeObj = (loader.load(currentLanguage) ?? loader.load('en'));
    }
    catch {
        localeObj = undefined;
    }
    if (!localeObj) {
        return key;
    }
    const parts = key.split('.');
    let val = localeObj;
    for (const part of parts) {
        if (val && typeof val === 'object' && part in val) {
            val = val[part];
        }
        else {
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
