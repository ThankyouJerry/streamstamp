'use client';

import ReactPlayer from 'react-player';
import { Platform } from '@/lib/utils';

interface VideoPlayerProps {
    platform: Platform;
    videoId: string;
    isLive?: boolean;
    onProgress?: (playedSeconds: number) => void;
    onReady?: () => void;
}

export default function VideoPlayer({ platform, videoId, isLive, onProgress, onReady }: VideoPlayerProps) {
    const getUrl = () => {
        if (platform === 'youtube') {
            return `https://www.youtube.com/watch?v=${videoId}`;
        }
        return '';
    };

    return (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <ReactPlayer
                url={getUrl()}
                width="100%"
                height="100%"
                controls
                onProgress={(state) => {
                    if (onProgress) {
                        onProgress(state.playedSeconds);
                    }
                }}
                onReady={onReady}
                config={{
                    youtube: {
                        playerVars: {
                            modestbranding: 1,
                        },
                    },
                }}
            />
        </div>
    );
}
