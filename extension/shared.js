(function attachStreamStampUtils(root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.StreamStampUtils = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, () => {
    const BACKUP_FORMAT = 'streamstamp-backup';
    const BACKUP_VERSION = 1;

    function getVideoId(input) {
        let url;
        try {
            url = new URL(input);
        } catch {
            return null;
        }

        const isYouTube = url.hostname === 'youtube.com' || url.hostname.endsWith('.youtube.com');
        if (!isYouTube || url.pathname !== '/watch') return null;
        return url.searchParams.get('v') || null;
    }

    function canonicalWatchUrl(videoId, seconds = null) {
        const url = new URL('https://www.youtube.com/watch');
        url.searchParams.set('v', videoId);
        if (Number.isFinite(seconds) && seconds >= 0) url.searchParams.set('t', `${Math.floor(seconds)}s`);
        return url.toString();
    }

    function formatTime(value) {
        const seconds = Math.max(0, Math.floor(Number(value) || 0));
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainder = seconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
        }
        return `${minutes}:${String(remainder).padStart(2, '0')}`;
    }

    function normalizeMemo(value) {
        return String(value ?? '').replace(/\s+/g, ' ').trim();
    }

    function normalizeTimestamps(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
        const result = {};

        for (const [videoId, entries] of Object.entries(value)) {
            if (!videoId || !Array.isArray(entries)) continue;
            const validEntries = entries.filter((entry) => (
                entry
                && typeof entry === 'object'
                && Number.isFinite(Number(entry.time))
                && typeof entry.memo === 'string'
            )).map((entry) => ({
                ...entry,
                videoId,
                time: Math.max(0, Math.floor(Number(entry.time))),
                memo: normalizeMemo(entry.memo),
            }));
            if (validEntries.length) result[videoId] = validEntries;
        }
        return result;
    }

    function mergeTimestamps(current, incoming) {
        const merged = normalizeTimestamps(current);
        const next = normalizeTimestamps(incoming);

        for (const [videoId, entries] of Object.entries(next)) {
            const existing = merged[videoId] ?? [];
            const identities = new Set(existing.map((entry) => String(entry.id)));
            const additions = entries.filter((entry) => !identities.has(String(entry.id)));
            merged[videoId] = [...existing, ...additions];
        }
        return merged;
    }

    function createMarkdown(title, videoId, entries) {
        const safeTitle = normalizeMemo(title) || 'YouTube Video';
        const baseUrl = canonicalWatchUrl(videoId);
        const sorted = [...entries].sort((a, b) => a.time - b.time);
        const lines = [
            `# ${safeTitle}`,
            '',
            `**영상 링크**: ${baseUrl}`,
            '',
            '## 타임스탬프',
            '',
        ];

        sorted.forEach((entry) => {
            lines.push(`- [${formatTime(entry.time)}](${canonicalWatchUrl(videoId, entry.time)}) - ${normalizeMemo(entry.memo)}`);
        });
        return `${lines.join('\n')}\n`;
    }

    function createBackup(timestamps, uiSettings = {}) {
        return {
            format: BACKUP_FORMAT,
            version: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            timestamps: normalizeTimestamps(timestamps),
            uiSettings: uiSettings && typeof uiSettings === 'object' ? uiSettings : {},
        };
    }

    function parseBackup(value) {
        if (!value || value.format !== BACKUP_FORMAT || value.version !== BACKUP_VERSION) {
            throw new Error('지원하지 않는 StreamStamp 백업 파일입니다.');
        }
        return {
            timestamps: normalizeTimestamps(value.timestamps),
            uiSettings: value.uiSettings && typeof value.uiSettings === 'object' ? value.uiSettings : {},
        };
    }

    return {
        BACKUP_FORMAT,
        BACKUP_VERSION,
        canonicalWatchUrl,
        createBackup,
        createMarkdown,
        formatTime,
        getVideoId,
        mergeTimestamps,
        normalizeMemo,
        normalizeTimestamps,
        parseBackup,
    };
}));
