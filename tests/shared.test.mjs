import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const utils = require('../extension/shared.js');

test('재생목록 매개변수와 관계없이 영상 ID를 읽는다', () => {
    assert.equal(
        utils.getVideoId('https://www.youtube.com/watch?list=PL123&v=video987&index=4'),
        'video987',
    );
});

test('영상이 아닌 YouTube 페이지는 거부한다', () => {
    assert.equal(utils.getVideoId('https://www.youtube.com/'), null);
    assert.equal(utils.getVideoId('https://www.youtube.com/shorts/abc'), null);
});

test('표준 타임스탬프 URL과 시간을 만든다', () => {
    assert.equal(
        utils.canonicalWatchUrl('abc123', 3723),
        'https://www.youtube.com/watch?v=abc123&t=3723s',
    );
    assert.equal(utils.formatTime(3723), '1:02:03');
});

test('마크다운 내보내기는 시간순이며 원본 배열을 변경하지 않는다', () => {
    const entries = [
        { time: 90, memo: '두 번째' },
        { time: 5, memo: '첫 번째' },
    ];
    const markdown = utils.createMarkdown('테스트 영상', 'abc123', entries);
    assert.ok(markdown.indexOf('0:05') < markdown.indexOf('1:30'));
    assert.equal(entries[0].time, 90);
    assert.match(markdown, /watch\?v=abc123&t=5s/);
});

test('백업 병합은 기존 항목을 보존하고 ID 중복을 제거한다', () => {
    const current = { abc: [{ id: 'one', time: 1, memo: '기존' }] };
    const incoming = { abc: [
        { id: 'one', time: 1, memo: '중복' },
        { id: 'two', time: 2, memo: '추가' },
    ] };
    const merged = utils.mergeTimestamps(current, incoming);
    assert.deepEqual(merged.abc.map((entry) => entry.id), ['one', 'two']);
});

test('지원하지 않는 백업 파일은 거부한다', () => {
    assert.throws(() => utils.parseBackup({ format: 'unknown', version: 1 }), /지원하지 않는/);
});
