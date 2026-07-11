const utils = globalThis.StreamStampUtils;
const TIMESTAMPS_KEY = 'timestamps';
const UI_SETTINGS_KEY = 'streamstampUi';

let streamStampPanel = null;
let toggleButton = null;
let currentVideoId = null;
let navigationToken = 0;
let dragCleanups = [];

bootstrap();

function bootstrap() {
    document.addEventListener('yt-navigate-finish', () => syncCurrentPage());
    window.addEventListener('popstate', () => syncCurrentPage());
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[TIMESTAMPS_KEY] && currentVideoId) loadTimestamps();
    });
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message?.type !== 'OPEN_PANEL') return false;
        syncCurrentPage({ openPanelWhenReady: true }).then((opened) => sendResponse({ opened }));
        return true;
    });
    syncCurrentPage();
}

async function syncCurrentPage({ openPanelWhenReady = false } = {}) {
    const token = ++navigationToken;
    const videoId = utils.getVideoId(window.location.href);
    if (!videoId) {
        currentVideoId = null;
        removeUI();
        return false;
    }

    const video = await waitForVideo();
    if (!video || token !== navigationToken || utils.getVideoId(window.location.href) !== videoId) return false;

    const previousVideoId = currentVideoId;
    currentVideoId = videoId;
    await ensureUI();
    if (previousVideoId !== videoId) await loadTimestamps();
    if (openPanelWhenReady) openPanel();
    return true;
}

function waitForVideo(timeoutMs = 10000) {
    const existing = document.querySelector('video');
    if (existing) return Promise.resolve(existing);

    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            const video = document.querySelector('video');
            if (!video) return;
            observer.disconnect();
            clearTimeout(timeout);
            resolve(video);
        });
        const timeout = setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeoutMs);
        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
}

async function ensureUI() {
    if (streamStampPanel?.isConnected && toggleButton?.isConnected) return;
    removeUI();

    toggleButton = document.createElement('button');
    toggleButton.id = 'streamstamp-toggle-btn';
    toggleButton.type = 'button';
    toggleButton.textContent = 'S';
    toggleButton.title = 'StreamStamp 열기';
    toggleButton.setAttribute('aria-label', 'StreamStamp 타임스탬프 패널 열기');

    streamStampPanel = document.createElement('section');
    streamStampPanel.id = 'streamstamp-panel';
    streamStampPanel.hidden = true;
    streamStampPanel.setAttribute('aria-label', 'StreamStamp 타임스탬프 패널');
    streamStampPanel.innerHTML = `
        <header class="ss-header">
            <div class="ss-brand"><span class="ss-mark">S</span><span><strong>StreamStamp</strong><small>YOUTUBE MOMENT NOTES</small></span></div>
            <button class="ss-icon-button ss-close" type="button" aria-label="패널 닫기">×</button>
        </header>
        <div class="ss-body">
            <div class="ss-now"><span>현재 영상</span><strong id="ss-current-title">불러오는 중...</strong></div>
            <div class="ss-controls">
                <input type="text" id="ss-memo" maxlength="240" autocomplete="off" placeholder="이 순간에 남길 메모" aria-label="타임스탬프 메모" />
                <button id="ss-add-btn" type="button"><span id="ss-current-time">0:00</span> 저장</button>
            </div>
            <p id="ss-status" class="ss-status" aria-live="polite"></p>
            <div class="ss-list-header"><strong>저장한 순간</strong><span id="ss-count">0개</span></div>
            <div class="ss-list" id="ss-list"></div>
            <div class="ss-actions">
                <button id="ss-export-btn" type="button">마크다운 복사</button>
                <button id="ss-clear-btn" class="ss-danger" type="button">이 영상 모두 삭제</button>
            </div>
        </div>
    `;

    document.body.append(toggleButton, streamStampPanel);
    await restorePositions();

    streamStampPanel.querySelector('.ss-close').addEventListener('click', closePanel);
    streamStampPanel.querySelector('#ss-add-btn').addEventListener('click', addTimestamp);
    streamStampPanel.querySelector('#ss-export-btn').addEventListener('click', exportMarkdown);
    streamStampPanel.querySelector('#ss-clear-btn').addEventListener('click', clearAll);
    streamStampPanel.querySelector('#ss-memo').addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.isComposing) addTimestamp();
    });

    dragCleanups = [
        makeDraggable(toggleButton, toggleButton, 'toggle', openPanel),
        makeDraggable(streamStampPanel, streamStampPanel.querySelector('.ss-header'), 'panel'),
    ];
    updateCurrentTime();
}

function removeUI() {
    dragCleanups.forEach((cleanup) => cleanup());
    dragCleanups = [];
    streamStampPanel?.remove();
    toggleButton?.remove();
    streamStampPanel = null;
    toggleButton = null;
}

function openPanel() {
    if (!streamStampPanel || !toggleButton) return;
    streamStampPanel.hidden = false;
    toggleButton.hidden = true;
    // YouTube can update watch-page metadata after its SPA navigation event.
    void loadTimestamps();
    updateCurrentTime();
    streamStampPanel.querySelector('#ss-memo')?.focus();
}

function closePanel() {
    if (!streamStampPanel || !toggleButton) return;
    streamStampPanel.hidden = true;
    toggleButton.hidden = false;
}

function updateCurrentTime() {
    if (!streamStampPanel || streamStampPanel.hidden) return;
    const time = getCurrentTime();
    streamStampPanel.querySelector('#ss-current-time').textContent = utils.formatTime(time);
    requestAnimationFrame(() => setTimeout(updateCurrentTime, 250));
}

function getCurrentTime() {
    const video = document.querySelector('video');
    return video ? Math.floor(video.currentTime) : 0;
}

function getVideoTitle() {
    const title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')
        || document.querySelector('#title h1 yt-formatted-string');
    return title?.textContent?.trim() || document.title.replace(/\s*-\s*YouTube$/, '') || 'YouTube Video';
}

function showStatus(message, type = 'info') {
    const status = streamStampPanel?.querySelector('#ss-status');
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
}

async function addTimestamp() {
    const memoInput = streamStampPanel.querySelector('#ss-memo');
    const memo = utils.normalizeMemo(memoInput.value);
    if (!memo) {
        showStatus('메모를 입력해 주세요.', 'error');
        memoInput.focus();
        return;
    }

    const videoId = utils.getVideoId(window.location.href);
    if (!videoId) {
        showStatus('현재 영상 정보를 찾지 못했습니다.', 'error');
        return;
    }

    const timestamp = {
        id: crypto.randomUUID(),
        videoId,
        videoTitle: getVideoTitle(),
        time: getCurrentTime(),
        memo,
        createdAt: new Date().toISOString(),
    };
    const { timestamps = {} } = await chrome.storage.local.get(TIMESTAMPS_KEY);
    const next = utils.normalizeTimestamps(timestamps);
    next[videoId] = [...(next[videoId] ?? []), timestamp];
    await chrome.storage.local.set({ [TIMESTAMPS_KEY]: next });
    memoInput.value = '';
    showStatus(`${utils.formatTime(timestamp.time)} 지점을 저장했습니다.`, 'success');
    await loadTimestamps();
}

async function loadTimestamps() {
    if (!streamStampPanel || !currentVideoId) return;
    const { timestamps = {} } = await chrome.storage.local.get(TIMESTAMPS_KEY);
    const entries = [...(utils.normalizeTimestamps(timestamps)[currentVideoId] ?? [])]
        .sort((a, b) => a.time - b.time);
    streamStampPanel.querySelector('#ss-current-title').textContent = getVideoTitle();
    streamStampPanel.querySelector('#ss-count').textContent = `${entries.length}개`;
    renderTimestampList(entries);
}

function renderTimestampList(entries) {
    const list = streamStampPanel.querySelector('#ss-list');
    list.replaceChildren();
    if (!entries.length) {
        const empty = document.createElement('p');
        empty.className = 'ss-empty';
        empty.textContent = '아직 저장한 순간이 없습니다.';
        list.append(empty);
        return;
    }

    entries.forEach((entry) => {
        const row = document.createElement('div');
        row.className = 'ss-item';

        const timeButton = document.createElement('button');
        timeButton.type = 'button';
        timeButton.className = 'ss-time';
        timeButton.textContent = utils.formatTime(entry.time);
        timeButton.title = '이 시점으로 이동';
        timeButton.addEventListener('click', () => seekTo(entry.time));

        const memo = document.createElement('span');
        memo.className = 'ss-memo';
        memo.textContent = entry.memo;

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'ss-row-action';
        editButton.textContent = '수정';
        editButton.setAttribute('aria-label', `${entry.memo} 메모 수정`);
        editButton.addEventListener('click', () => editTimestamp(entry));

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'ss-row-action ss-delete';
        deleteButton.textContent = '삭제';
        deleteButton.setAttribute('aria-label', `${entry.memo} 타임스탬프 삭제`);
        deleteButton.addEventListener('click', () => deleteTimestamp(entry.id));

        row.append(timeButton, memo, editButton, deleteButton);
        list.append(row);
    });
}

function seekTo(seconds) {
    const video = document.querySelector('video');
    if (!video) {
        showStatus('YouTube 플레이어를 찾지 못했습니다.', 'error');
        return;
    }
    video.currentTime = seconds;
    video.play().catch(() => {});
    showStatus(`${utils.formatTime(seconds)} 지점으로 이동했습니다.`, 'success');
}

async function editTimestamp(entry) {
    const nextMemo = prompt('메모 수정', entry.memo);
    if (nextMemo === null) return;
    const memo = utils.normalizeMemo(nextMemo);
    if (!memo) {
        showStatus('메모는 비워둘 수 없습니다.', 'error');
        return;
    }

    const { timestamps = {} } = await chrome.storage.local.get(TIMESTAMPS_KEY);
    const entries = timestamps[currentVideoId] ?? [];
    timestamps[currentVideoId] = entries.map((item) => (
        String(item.id) === String(entry.id) ? { ...item, memo } : item
    ));
    await chrome.storage.local.set({ timestamps });
    showStatus('메모를 수정했습니다.', 'success');
    await loadTimestamps();
}

async function deleteTimestamp(id) {
    const { timestamps = {} } = await chrome.storage.local.get(TIMESTAMPS_KEY);
    if (!timestamps[currentVideoId]) return;
    timestamps[currentVideoId] = timestamps[currentVideoId]
        .filter((entry) => String(entry.id) !== String(id));
    if (!timestamps[currentVideoId].length) delete timestamps[currentVideoId];
    await chrome.storage.local.set({ timestamps });
    showStatus('타임스탬프를 삭제했습니다.', 'success');
    await loadTimestamps();
}

async function exportMarkdown() {
    const { timestamps = {} } = await chrome.storage.local.get(TIMESTAMPS_KEY);
    const entries = timestamps[currentVideoId] ?? [];
    if (!entries.length) {
        showStatus('복사할 타임스탬프가 없습니다.', 'error');
        return;
    }

    try {
        const markdown = utils.createMarkdown(getVideoTitle(), currentVideoId, entries);
        await navigator.clipboard.writeText(markdown);
        showStatus('마크다운을 클립보드에 복사했습니다.', 'success');
    } catch {
        showStatus('클립보드 복사에 실패했습니다.', 'error');
    }
}

async function clearAll() {
    const { timestamps = {} } = await chrome.storage.local.get(TIMESTAMPS_KEY);
    const count = timestamps[currentVideoId]?.length ?? 0;
    if (!count) return;
    if (!confirm(`이 영상의 타임스탬프 ${count}개를 모두 삭제하시겠습니까?`)) return;
    delete timestamps[currentVideoId];
    await chrome.storage.local.set({ timestamps });
    showStatus('이 영상의 타임스탬프를 모두 삭제했습니다.', 'success');
    await loadTimestamps();
}

async function restorePositions() {
    const { [UI_SETTINGS_KEY]: settings = {} } = await chrome.storage.local.get(UI_SETTINGS_KEY);
    applyPosition(toggleButton, settings.toggle);
    applyPosition(streamStampPanel, settings.panel);
}

function applyPosition(element, position) {
    if (!position || !Number.isFinite(position.top) || !Number.isFinite(position.left)) return;
    const left = Math.max(0, Math.min(window.innerWidth - element.offsetWidth, position.left));
    const top = Math.max(0, Math.min(window.innerHeight - element.offsetHeight, position.top));
    element.style.inset = `${top}px auto auto ${left}px`;
}

async function savePosition(key, element) {
    const rect = element.getBoundingClientRect();
    const { [UI_SETTINGS_KEY]: settings = {} } = await chrome.storage.local.get(UI_SETTINGS_KEY);
    await chrome.storage.local.set({
        [UI_SETTINGS_KEY]: { ...settings, [key]: { top: rect.top, left: rect.left } },
    });
}

function makeDraggable(element, handle, storageKey, onClick = null) {
    let drag = null;
    const onPointerDown = (event) => {
        if (event.button !== 0 || event.target.closest('button') && event.target !== handle) return;
        const rect = element.getBoundingClientRect();
        drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, moved: false };
        handle.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    };
    const onPointerMove = (event) => {
        if (!drag || event.pointerId !== drag.pointerId) return;
        const deltaX = event.clientX - drag.startX;
        const deltaY = event.clientY - drag.startY;
        drag.moved ||= Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4;
        const left = Math.max(0, Math.min(window.innerWidth - element.offsetWidth, drag.left + deltaX));
        const top = Math.max(0, Math.min(window.innerHeight - element.offsetHeight, drag.top + deltaY));
        element.style.inset = `${top}px auto auto ${left}px`;
    };
    const onPointerUp = (event) => {
        if (!drag || event.pointerId !== drag.pointerId) return;
        const wasMoved = drag.moved;
        drag = null;
        if (wasMoved) savePosition(storageKey, element);
        else onClick?.();
    };

    handle.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
        handle.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    };
}
