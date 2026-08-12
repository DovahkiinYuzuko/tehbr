import { execSync, spawnSync } from 'node:child_process';
import process from 'node:process';
export function readClipboard() {
    const platform = process.platform;
    try {
        if (platform === 'win32') {
            const result = execSync('powershell -NoProfile -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-Clipboard"', {
                encoding: 'utf8',
                windowsHide: true,
            });
            return result.trimEnd();
        }
        else if (platform === 'darwin') {
            const result = execSync('pbpaste', { encoding: 'utf8' });
            return result.trimEnd();
        }
        else {
            // Linux / Unix
            try {
                return execSync('xclip -selection clipboard -o', { encoding: 'utf8' }).trimEnd();
            }
            catch {
                try {
                    return execSync('xsel --clipboard --output', { encoding: 'utf8' }).trimEnd();
                }
                catch {
                    return execSync('wl-paste', { encoding: 'utf8' }).trimEnd();
                }
            }
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to read from clipboard: ${msg}`);
    }
}
export function writeClipboard(text) {
    const platform = process.platform;
    try {
        if (platform === 'win32') {
            spawnSync('powershell', ['-NoProfile', '-Command', '$input | Set-Clipboard'], {
                input: text,
                encoding: 'utf8',
                windowsHide: true,
            });
        }
        else if (platform === 'darwin') {
            spawnSync('pbcopy', [], {
                input: text,
                encoding: 'utf8',
            });
        }
        else {
            // Linux / Unix
            let res = spawnSync('xclip', ['-selection', 'clipboard'], { input: text, encoding: 'utf8' });
            if (res.error) {
                res = spawnSync('xsel', ['--clipboard', '--input'], { input: text, encoding: 'utf8' });
            }
            if (res.error) {
                spawnSync('wl-copy', [], { input: text, encoding: 'utf8' });
            }
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to write to clipboard: ${msg}`);
    }
}
