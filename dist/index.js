import process from 'node:process';
import { runCLI } from './cli/index.js';
export async function main() {
    await runCLI(process.argv);
}
main().catch((err) => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
