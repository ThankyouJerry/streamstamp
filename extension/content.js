// StreamStamp Content Script - Injects UI into YouTube pages

let streamStampPanel = null;
let currentVideoId = null;

// Initialize when page loads
init();

function init() {
    // Wait for YouTube player to be ready
    const checkInterval = setInterval(() => {
        const player = document.querySelector('video');
        if (player) {
            clearInterval(checkInterval);
            injectUI();
            observeVideoChanges();
        }
    }, 500);
}

function injectUI() {
    // Create floating toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'streamstamp-toggle-btn';
    toggleBtn.innerHTML = '⏱️';
    toggleBtn.title = 'StreamStamp 열기/닫기 (드래그로 이동 가능)';
    document.body.appendChild(toggleBtn);

    // Load saved position or use default
    const savedPosition = localStorage.getItem('streamstamp-btn-position');
    if (savedPosition) {
        const pos = JSON.parse(savedPosition);
        if (pos.top && pos.left) {
            toggleBtn.style.top = pos.top;
            toggleBtn.style.left = pos.left;
            toggleBtn.style.bottom = 'auto';
            toggleBtn.style.right = 'auto';
        } else if (pos.bottom && pos.right) {
            // Legacy format, convert to top/left
            toggleBtn.style.bottom = pos.bottom;
            toggleBtn.style.right = pos.right;
        }
    }

    // Make button draggable
    makeDraggable(toggleBtn);

    // Create floating panel (hidden by default)
    streamStampPanel = document.createElement('div');
    streamStampPanel.id = 'streamstamp-panel';
    streamStampPanel.style.display = 'none'; // Start hidden
    streamStampPanel.innerHTML = `
    <div class="ss-header">
      <span class="ss-title">⏱️ StreamStamp</span>
      <button class="ss-close" title="닫기">×</button>
    </div>
    <div class="ss-body">
      <div class="ss-controls">
        <input type="text" id="ss-memo" placeholder="메모 입력..." />
        <button id="ss-add-btn">타임스탬프 추가</button>
      </div>
      <div class="ss-list" id="ss-list">
        <p class="ss-empty">타임스탬프가 없습니다.</p>
      </div>
      <div class="ss-actions">
        <button id="ss-export-btn">마크다운 복사</button>
        <button id="ss-clear-btn">전체 삭제</button>
      </div>
    </div>
  `;

    document.body.appendChild(streamStampPanel);

    // Load saved panel position
    const savedPanelPosition = localStorage.getItem('streamstamp-panel-position');
    if (savedPanelPosition) {
        const pos = JSON.parse(savedPanelPosition);
        if (pos.top && pos.right) {
            streamStampPanel.style.top = pos.top;
            streamStampPanel.style.right = pos.right;
        }
    }

    // Make panel draggable by header
    makePanelDraggable(streamStampPanel);

    // Event listeners
    // Note: toggleBtn click is handled in makeDraggable function

    document.querySelector('.ss-close').addEventListener('click', () => {
        streamStampPanel.style.display = 'none';
        toggleBtn.style.display = 'block';
    });

    document.getElementById('ss-add-btn').addEventListener('click', addTimestamp);
    document.getElementById('ss-export-btn').addEventListener('click', exportMarkdown);
    document.getElementById('ss-clear-btn').addEventListener('click', clearAll);

    // Enter key to add timestamp
    document.getElementById('ss-memo').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTimestamp();
    });

    // Load existing timestamps
    loadTimestamps();
}



function getCurrentTime() {
    const video = document.querySelector('video');
    return video ? Math.floor(video.currentTime) : 0;
}

function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

function getVideoTitle() {
    const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
    return titleElement ? titleElement.textContent : 'YouTube Video';
}

async function addTimestamp() {
    const memo = document.getElementById('ss-memo').value.trim();
    if (!memo) {
        alert('메모를 입력해주세요.');
        return;
    }

    const videoId = getVideoId();
    const timestamp = {
        id: Date.now(),
        videoId: videoId,
        videoTitle: getVideoTitle(),
        time: getCurrentTime(),
        memo: memo,
        createdAt: new Date().toISOString()
    };

    // Save to chrome.storage
    const { timestamps = {} } = await chrome.storage.local.get('timestamps');
    if (!timestamps[videoId]) {
        timestamps[videoId] = [];
    }
    timestamps[videoId].push(timestamp);
    await chrome.storage.local.set({ timestamps });

    // Clear input
    document.getElementById('ss-memo').value = '';

    // Reload list
    loadTimestamps();
}

async function loadTimestamps() {
    const videoId = getVideoId();
    const { timestamps = {} } = await chrome.storage.local.get('timestamps');
    const videoTimestamps = timestamps[videoId] || [];

    const listEl = document.getElementById('ss-list');

    if (videoTimestamps.length === 0) {
        listEl.innerHTML = '<p class="ss-empty">타임스탬프가 없습니다.</p>';
        return;
    }

    listEl.innerHTML = videoTimestamps
        .sort((a, b) => a.time - b.time)
        .map(ts => `
      <div class="ss-item" data-id="${ts.id}">
        <a href="#" class="ss-time" data-time="${ts.time}">${formatTime(ts.time)}</a>
        <span class="ss-memo">${escapeHtml(ts.memo)}</span>
        <button class="ss-delete" data-id="${ts.id}">×</button>
      </div>
    `)
        .join('');

    // Add event listeners
    listEl.querySelectorAll('.ss-time').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const time = parseInt(e.target.dataset.time);
            const video = document.querySelector('video');
            if (video) video.currentTime = time;
        });
    });

    listEl.querySelectorAll('.ss-delete').forEach(el => {
        el.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseInt(e.target.dataset.id);
            console.log('Deleting timestamp with id:', id);
            await deleteTimestamp(id);
        });
    });
}

async function deleteTimestamp(id) {
    console.log('deleteTimestamp called with id:', id);
    const videoId = getVideoId();
    const { timestamps = {} } = await chrome.storage.local.get('timestamps');

    if (timestamps[videoId]) {
        const beforeLength = timestamps[videoId].length;
        timestamps[videoId] = timestamps[videoId].filter(ts => ts.id !== id);
        const afterLength = timestamps[videoId].length;
        console.log(`Deleted timestamp. Before: ${beforeLength}, After: ${afterLength}`);
        await chrome.storage.local.set({ timestamps });
        loadTimestamps();
    } else {
        console.log('No timestamps found for video:', videoId);
    }
}

async function exportMarkdown() {
    const videoId = getVideoId();
    const { timestamps = {} } = await chrome.storage.local.get('timestamps');
    const videoTimestamps = timestamps[videoId] || [];

    if (videoTimestamps.length === 0) {
        alert('타임스탬프가 없습니다.');
        return;
    }

    const title = getVideoTitle();
    const url = window.location.href.split('&')[0]; // Remove extra params

    let markdown = `# ${title}\n\n`;
    markdown += `**영상 링크**: ${url}\n\n`;
    markdown += `## 타임스탬프\n\n`;

    videoTimestamps
        .sort((a, b) => a.time - b.time)
        .forEach(ts => {
            markdown += `- [${formatTime(ts.time)}](${url}&t=${ts.time}s) - ${ts.memo}\n`;
        });

    // Copy to clipboard
    await navigator.clipboard.writeText(markdown);
    alert('마크다운이 클립보드에 복사되었습니다!');
}

async function clearAll() {
    if (!confirm('정말 모든 타임스탬프를 삭제하시겠습니까?')) return;

    const videoId = getVideoId();
    const { timestamps = {} } = await chrome.storage.local.get('timestamps');

    delete timestamps[videoId];
    await chrome.storage.local.set({ timestamps });
    loadTimestamps();
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function observeVideoChanges() {
    // Reload timestamps when video changes
    let lastVideoId = getVideoId();

    setInterval(() => {
        const currentId = getVideoId();
        if (currentId !== lastVideoId) {
            lastVideoId = currentId;
            loadTimestamps();
        }
    }, 1000);
}

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY;
    let initialX, initialY;

    element.addEventListener('mousedown', (e) => {
        if (e.target === element) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            // Get current position
            const rect = element.getBoundingClientRect();
            initialX = rect.left;
            initialY = rect.top;

            // Switch to top/left positioning for dragging
            element.style.bottom = 'auto';
            element.style.right = 'auto';
            element.style.top = `${initialY}px`;
            element.style.left = `${initialX}px`;

            element.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newX = Math.max(0, Math.min(window.innerWidth - 56, initialX + deltaX));
        const newY = Math.max(0, Math.min(window.innerHeight - 56, initialY + deltaY));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'pointer';

            // Save position to localStorage
            const position = {
                top: element.style.top,
                left: element.style.left
            };
            localStorage.setItem('streamstamp-btn-position', JSON.stringify(position));

            // If we didn't move much, treat it as a click
            const deltaX = Math.abs(startX - e.clientX);
            const deltaY = Math.abs(startY - e.clientY);
            if (deltaX < 5 && deltaY < 5) {
                // This was a click, not a drag - open panel
                if (streamStampPanel.style.display === 'none') {
                    streamStampPanel.style.display = 'block';
                    element.style.display = 'none';
                }
            }
        }
    });
}

function makePanelDraggable(panel) {
    const header = panel.querySelector('.ss-header');
    let isDragging = false;
    let startX, startY;
    let initialX, initialY;

    header.style.cursor = 'move';

    header.addEventListener('mousedown', (e) => {
        // Don't drag if clicking the close button
        if (e.target.classList.contains('ss-close')) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        // Get current position
        const rect = panel.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newX = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, initialX + deltaX));
        const newY = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, initialY + deltaY));

        // Convert to top/right positioning to maintain consistency
        const newRight = window.innerWidth - newX - panel.offsetWidth;

        panel.style.top = `${newY}px`;
        panel.style.right = `${newRight}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;

            // Save position to localStorage
            const position = {
                top: panel.style.top,
                right: panel.style.right
            };
            localStorage.setItem('streamstamp-panel-position', JSON.stringify(position));
        }
    });
}
