'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatTime } from '@/lib/utils';
import MarkdownExport from '@/components/MarkdownExport';
import { Timestamp } from '@/components/TimestampList';
import { Lock } from 'lucide-react';

interface VideoData {
    id: string;
    platform: string;
    video_id: string;
    title: string;
    thumbnail_url: string;
    is_public: boolean;
    is_live: boolean;
}

export default function SharePage() {
    const params = useParams();
    const videoId = params.id as string;

    const [video, setVideo] = useState<VideoData | null>(null);
    const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, [videoId]);

    async function loadData() {
        try {
            const { data: videoData, error: videoError } = await supabase
                .from('videos')
                .select('*')
                .eq('id', videoId)
                .single();

            if (videoError) throw videoError;

            if (!videoData.is_public) {
                setError('이 타임라인은 비공개입니다.');
                setLoading(false);
                return;
            }

            setVideo(videoData);

            const { data: timestampsData, error: timestampsError } = await supabase
                .from('timestamps')
                .select('*')
                .eq('video_id', videoId)
                .order('order_index', { ascending: true });

            if (timestampsError) throw timestampsError;
            if (timestampsData) setTimestamps(timestampsData);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">로딩 중...</div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-xl text-gray-600 dark:text-gray-400">{error || '영상을 찾을 수 없습니다.'}</p>
                </div>
            </div>
        );
    }

    const getVideoUrl = () => {
        if (video.platform === 'youtube') {
            return `https://youtube.com/watch?v=${video.video_id}`;
        }
        if (video.platform === 'chzzk') {
            return video.is_live
                ? `https://chzzk.naver.com/live/${video.video_id}`
                : `https://chzzk.naver.com/video/${video.video_id}`;
        }
        return '';
    };

    const videoUrl = getVideoUrl();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    {video.thumbnail_url && (
                        <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                    )}
                    <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        영상 보러가기 →
                    </a>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">타임스탬프</h2>
                        {timestamps.length > 0 && (
                            <MarkdownExport
                                videoTitle={video.title}
                                videoUrl={videoUrl}
                                timestamps={timestamps}
                            />
                        )}
                    </div>

                    {timestamps.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                            타임스탬프가 없습니다.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {timestamps.map((timestamp) => (
                                <div
                                    key={timestamp.id}
                                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                                >
                                    <a
                                        href={`${videoUrl}${video.platform === 'youtube' ? '&t=' : '?t='}${timestamp.time_seconds}s`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 font-mono font-semibold hover:underline"
                                    >
                                        {formatTime(timestamp.time_seconds)}
                                    </a>
                                    <p className="mt-2 text-gray-700 dark:text-gray-300">{timestamp.memo}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
