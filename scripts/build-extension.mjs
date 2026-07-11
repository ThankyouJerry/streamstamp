import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(await readFile(join(root, 'extension/manifest.json'), 'utf8'));
const folderName = `StreamStamp-v${manifest.version}`;
const distDir = join(root, 'dist');
const unpackedDir = join(distDir, folderName);
const zipPath = join(distDir, `${folderName}.zip`);
const mappings = [
    ['extension/manifest.json', 'manifest.json'],
    ['extension/shared.js', 'shared.js'],
    ['extension/content.js', 'content.js'],
    ['extension/content.css', 'content.css'],
    ['extension/popup.html', 'popup.html'],
    ['extension/popup.css', 'popup.css'],
    ['extension/popup.js', 'popup.js'],
    ['extension/icons', 'icons'],
];

await rm(distDir, { recursive: true, force: true });
await mkdir(unpackedDir, { recursive: true });
for (const [source, destination] of mappings) {
    await cp(join(root, source), join(unpackedDir, destination), { recursive: true });
}

const archiveEntries = mappings.map(([, destination]) => destination);
execFileSync('zip', ['-q', '-r', zipPath, ...archiveEntries], { cwd: unpackedDir });
const checksum = createHash('sha256').update(await readFile(zipPath)).digest('hex');
await writeFile(join(distDir, 'SHA256SUMS.txt'), `${checksum}  ${basename(zipPath)}\n`);

console.log(`Built ${zipPath}`);
console.log(`SHA-256 ${checksum}`);
