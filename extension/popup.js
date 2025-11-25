document.addEventListener('DOMContentLoaded', async () => {
    await loadData();

    // Record button - opens current YouTube tab or creates new one
    document.getElementById('record-btn').addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
            // Already on YouTube, just close popup (panel will be visible)
            window.close();
        } else {
            // Not on YouTube, open YouTube
            chrome.tabs.create({ url: 'https://www.youtube.com' });
        }
    });
});

async function loadData() {
    const { timestamps = {} } = await chrome.storage.local.get('timestamps');

    // Update stats
    const videoCount = Object.keys(timestamps).length;
    const timestampCount = Object.values(timestamps).reduce((sum, arr) => sum + arr.length, 0);

    document.getElementById('video-count').textContent = videoCount;
    document.getElementById('timestamp-count').textContent = timestampCount;

    // Update record button state
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const recordBtn = document.getElementById('record-btn');

    if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
        recordBtn.textContent = '📝 현재 영상 기록하기';
        recordBtn.disabled = false;
    } else {
        recordBtn.textContent = '📺 YouTube로 이동';
        recordBtn.disabled = false;
    }

    // Render video list
    renderVideoList(timestamps);
}

function renderVideoList(timestamps) {
    const listEl = document.getElementById('video-list');

    if (Object.keys(timestamps).length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📹</div>
                <div class="empty-text">저장된 타임스탬프가 없습니다</div>
                <div class="empty-hint">YouTube 영상에서 타임스탬프를 추가해보세요!</div>
            </div>
        `;
        return;
    }

    // Convert to array and sort by most recent
    const videos = Object.entries(timestamps).map(([videoId, stamps]) => ({
        videoId,
        stamps,
        title: stamps[0]?.videoTitle || 'Unknown Video',
        lastUpdated: Math.max(...stamps.map(s => new Date(s.createdAt).getTime()))
    })).sort((a, b) => b.lastUpdated - a.lastUpdated);

    listEl.innerHTML = videos.map(video => `
        <div class="video-item">
            <div class="video-content" data-video-id="${video.videoId}">
                <div class="video-title">${escapeHtml(video.title)}</div>
                <div class="video-meta">
                    <span class="timestamp-count">${video.stamps.length}개 타임스탬프</span>
                    <span>•</span>
                    <span>${formatDate(video.lastUpdated)}</span>
                </div>
            </div>
            <button class="video-delete" data-video-id="${video.videoId}" title="영상 삭제">×</button>
        </div>
    `).join('');

    // Add click handlers for opening videos
    listEl.querySelectorAll('.video-content').forEach(el => {
        el.addEventListener('click', () => {
            const videoId = el.dataset.videoId;
            chrome.tabs.create({ url: `https://www.youtube.com/watch?v=${videoId}` });
        });
    });

    // Add click handlers for deleting videos
    listEl.querySelectorAll('.video-delete').forEach(el => {
        el.addEventListener('click', async (e) => {
            e.stopPropagation();
            const videoId = el.dataset.videoId;
            const video = videos.find(v => v.videoId === videoId);

            if (confirm(`"${video.title}" 영상과 모든 타임스탬프(${video.stamps.length}개)를 삭제하시겠습니까?`)) {
                await deleteVideo(videoId);
            }
        });
    });
}

async function deleteVideo(videoId) {
    const { timestamps = {} } = await chrome.storage.local.get('timestamps');
    delete timestamps[videoId];
    await chrome.storage.local.set({ timestamps });
    await loadData(); // Reload the entire UI
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    if (days < 365) return `${Math.floor(days / 30)}개월 전`;
    return `${Math.floor(days / 365)}년 전`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
