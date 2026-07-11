const utils = globalThis.StreamStampUtils;
const TIMESTAMPS_KEY = 'timestamps';
const UI_SETTINGS_KEY = 'streamstampUi';

const videoCount = document.querySelector('#video-count');
const timestampCount = document.querySelector('#timestamp-count');
const recordButton = document.querySelector('#record-btn');
const status = document.querySelector('#status');
const searchInput = document.querySelector('#search-input');
const list = document.querySelector('#video-list');
const backupMenuButton = document.querySelector('#backup-menu-btn');
const backupActions = document.querySelector('#backup-actions');
const importFile = document.querySelector('#import-file');

let allTimestamps = {};

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
    bindEvents();
    await loadData();
    await updateRecordButton();
}

function bindEvents() {
    recordButton.addEventListener('click', openCurrentVideoPanel);
    searchInput.addEventListener('input', () => renderVideoList(allTimestamps, searchInput.value));
    backupMenuButton.addEventListener('click', () => {
        backupActions.hidden = !backupActions.hidden;
        backupMenuButton.setAttribute('aria-expanded', String(!backupActions.hidden));
    });
    document.querySelector('#export-backup-btn').addEventListener('click', exportBackup);
    document.querySelector('#import-backup-btn').addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importBackup);
}

function showStatus(message, type = 'info') {
    status.textContent = message;
    status.dataset.type = type;
}

async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

async function updateRecordButton() {
    const tab = await getActiveTab();
    const videoId = tab?.url ? utils.getVideoId(tab.url) : null;
    recordButton.textContent = videoId ? '현재 영상에 타임스탬프 추가' : 'YouTube 영상 열기';
}

async function openCurrentVideoPanel() {
    const tab = await getActiveTab();
    const videoId = tab?.url ? utils.getVideoId(tab.url) : null;
    if (!videoId) {
        await chrome.tabs.create({ url: 'https://www.youtube.com/' });
        window.close();
        return;
    }

    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_PANEL' });
        if (!response?.opened) throw new Error('Panel unavailable');
        window.close();
    } catch {
        showStatus('YouTube 탭을 새로고침한 뒤 다시 시도해 주세요.', 'error');
    }
}

async function loadData() {
    const { [TIMESTAMPS_KEY]: timestamps = {} } = await chrome.storage.local.get(TIMESTAMPS_KEY);
    allTimestamps = utils.normalizeTimestamps(timestamps);
    const videos = Object.keys(allTimestamps);
    const total = Object.values(allTimestamps).reduce((sum, entries) => sum + entries.length, 0);
    videoCount.textContent = videos.length;
    timestampCount.textContent = total;
    renderVideoList(allTimestamps, searchInput.value);
}

function toVideoList(timestamps) {
    return Object.entries(timestamps).map(([videoId, entries]) => ({
        videoId,
        entries,
        title: entries[0]?.videoTitle || '제목을 찾지 못한 영상',
        lastUpdated: Math.max(...entries.map((entry) => new Date(entry.createdAt || 0).getTime())),
    })).sort((a, b) => b.lastUpdated - a.lastUpdated);
}

function renderVideoList(timestamps, query = '') {
    const keyword = query.trim().toLocaleLowerCase('ko');
    const videos = toVideoList(timestamps).filter((video) => {
        if (!keyword) return true;
        return video.title.toLocaleLowerCase('ko').includes(keyword)
            || video.entries.some((entry) => entry.memo.toLocaleLowerCase('ko').includes(keyword));
    });
    list.replaceChildren();

    if (!videos.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `<div class="empty-icon">S</div><div class="empty-text">${keyword ? '검색 결과가 없습니다.' : '저장된 타임스탬프가 없습니다.'}</div><div class="empty-hint">YouTube 영상을 보면서 중요한 순간을 기록해 보세요.</div>`;
        list.append(empty);
        return;
    }

    videos.forEach((video) => {
        const item = document.createElement('article');
        item.className = 'video-item';
        const content = document.createElement('div');
        content.className = 'video-content';
        content.tabIndex = 0;
        content.setAttribute('role', 'button');
        content.setAttribute('aria-label', `${video.title} 영상 열기`);

        const title = document.createElement('div');
        title.className = 'video-title';
        title.textContent = video.title;
        const meta = document.createElement('div');
        meta.className = 'video-meta';
        const count = document.createElement('span');
        count.className = 'timestamp-count';
        count.textContent = `${video.entries.length}개`;
        const date = document.createElement('span');
        date.textContent = formatDate(video.lastUpdated);
        meta.append(count, date);
        content.append(title, meta);
        content.addEventListener('click', () => chrome.tabs.create({ url: utils.canonicalWatchUrl(video.videoId) }));
        content.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') content.click();
        });

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'video-delete';
        remove.textContent = '삭제';
        remove.setAttribute('aria-label', `${video.title}와 타임스탬프 ${video.entries.length}개 삭제`);
        remove.addEventListener('click', () => deleteVideo(video));
        item.append(content, remove);
        list.append(item);
    });
}

async function deleteVideo(video) {
    if (!confirm(`"${video.title}"의 타임스탬프 ${video.entries.length}개를 삭제하시겠습니까?`)) return;
    delete allTimestamps[video.videoId];
    await chrome.storage.local.set({ [TIMESTAMPS_KEY]: allTimestamps });
    showStatus('영상과 타임스탬프를 삭제했습니다.', 'success');
    await loadData();
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    if (!Number.isFinite(date.getTime())) return '';
    return new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })
        .format(-Math.max(0, Math.round((Date.now() - date.getTime()) / 86400000)), 'day');
}

async function exportBackup() {
    const { [UI_SETTINGS_KEY]: uiSettings = {} } = await chrome.storage.local.get(UI_SETTINGS_KEY);
    const backup = utils.createBackup(allTimestamps, uiSettings);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `streamstamp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showStatus('JSON 백업 파일을 만들었습니다.', 'success');
}

async function importBackup(event) {
    const [file] = event.target.files;
    event.target.value = '';
    if (!file) return;
    try {
        const backup = utils.parseBackup(JSON.parse(await file.text()));
        const merged = utils.mergeTimestamps(allTimestamps, backup.timestamps);
        await chrome.storage.local.set({
            [TIMESTAMPS_KEY]: merged,
            [UI_SETTINGS_KEY]: backup.uiSettings,
        });
        showStatus('백업 데이터를 기존 기록과 합쳤습니다.', 'success');
        await loadData();
    } catch (error) {
        showStatus(error.message || '백업 파일을 읽지 못했습니다.', 'error');
    }
}
