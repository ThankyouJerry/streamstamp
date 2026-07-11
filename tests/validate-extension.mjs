import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('extension/manifest.json', 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.version, '1.1.0');
assert.equal(manifest.author, 'ThankyouJerry');
assert.deepEqual(manifest.permissions, ['storage', 'activeTab']);
assert.ok(manifest.content_scripts.some((entry) =>
    entry.matches.includes('*://*.youtube.com/*')
    && entry.js[0] === 'shared.js'
));

for (const path of [
    'extension/shared.js',
    'extension/content.js',
    'extension/content.css',
    'extension/popup.html',
    'extension/popup.css',
    'extension/popup.js',
    'extension/icons/icon16.png',
    'extension/icons/icon48.png',
    'extension/icons/icon128.png',
]) {
    assert.ok(fs.existsSync(path), `Missing ${path}`);
}

const popup = fs.readFileSync('extension/popup.html', 'utf8');
assert.ok(popup.includes('<html lang="ko">'));
assert.ok(popup.indexOf('shared.js') < popup.indexOf('popup.js'));

console.log('StreamStamp extension validation passed');
