export type Platform = 'youtube';

export interface ParsedUrl {
    platform: Platform;
    videoId: string;
}

export function parseVideoUrl(url: string): ParsedUrl | null {
    try {
        const urlObj = new URL(url);

        // YouTube patterns
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            let videoId: string | null = null;

            if (urlObj.hostname.includes('youtu.be')) {
                videoId = urlObj.pathname.slice(1);
            } else if (urlObj.pathname === '/watch') {
                videoId = urlObj.searchParams.get('v');
            } else if (urlObj.pathname.startsWith('/embed/')) {
                videoId = urlObj.pathname.split('/')[2];
            }

            if (videoId) {
                return { platform: 'youtube', videoId };
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}

export function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
