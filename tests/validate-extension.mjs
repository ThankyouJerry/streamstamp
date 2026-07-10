import assert from 'node:assert/strict';
import fs from 'node:fs';

const manifest = JSON.parse(fs.readFileSync('extension/manifest.json', 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.version, '1.0.2');
assert.equal(manifest.author, 'ThankyouJerry');
assert.ok(manifest.permissions.includes('storage'));
assert.ok(manifest.content_scripts.some((entry) =>
    entry.matches.includes('*://*.youtube.com/watch*')
));

console.log('StreamStamp extension validation passed');
