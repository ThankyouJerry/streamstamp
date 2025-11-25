import { Platform } from '@/lib/utils';

export interface VideoMetadata {
    platform: Platform;
    videoId: string;
    title: string;
    thumbnailUrl: string;
    duration: number;
    isLive: boolean;
}

export async function fetchYouTubeMetadata(videoId: string): Promise<VideoMetadata | null> {
    try {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

        if (!apiKey) {
            console.warn('YouTube API key not configured');
            return {
                platform: 'youtube',
                videoId,
                title: 'YouTube Video',
                thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                duration: 0,
                isLive: false,
            };
        }

        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('YouTube API Error:', errorData);
            return null;
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
        }

        const video = data.items[0];
        const snippet = video.snippet;
        const contentDetails = video.contentDetails;
        const isLive = video.liveStreamingDetails !== undefined;

        // Parse ISO 8601 duration (PT1H2M3S)
        let duration = 0;
        if (contentDetails.duration) {
            const match = contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
                const hours = parseInt(match[1] || '0');
                const minutes = parseInt(match[2] || '0');
                const seconds = parseInt(match[3] || '0');
                duration = hours * 3600 + minutes * 60 + seconds;
            }
        }

        return {
            platform: 'youtube',
            videoId,
            title: snippet.title,
            thumbnailUrl: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
            duration,
            isLive,
        };
    } catch (error) {
        console.error('Error fetching YouTube metadata:', error);
        return null;
    }
}

export async function fetchVideoMetadata(platform: Platform, videoId: string): Promise<VideoMetadata | null> {
    if (platform === 'youtube') {
        return fetchYouTubeMetadata(videoId);
    }
    return null;
}
