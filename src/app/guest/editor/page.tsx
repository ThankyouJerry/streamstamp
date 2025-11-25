'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { fetchVideoMetadata, VideoMetadata } from '@/services/metadata';
import { LogIn, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function GuestEditorPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    const platform = searchParams.get('platform') as 'youtube';
    const videoId = searchParams.get('videoId');

    const [video, setVideo] = useState<VideoMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!platform || !videoId) {
            setError('잘못된 접근입니다.');
            setLoading(false);
            return;
        }
        loadVideo();
    }, [platform, videoId]);

    async function loadVideo() {
        try {
            const metadata = await fetchVideoMetadata(platform, videoId!);
            if (metadata) {
                setVideo(metadata);
            } else {
                setError('영상 정보를 가져올 수 없습니다.');
            }
        } catch (error) {
            console.error('Error loading video:', error);
            setError('오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }

    function handleLogin() {
        // Save current video info to localStorage to restore after login?
        // For now, just go to login page
        router.push('/login');
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
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <p className="text-xl text-gray-600 dark:text-gray-400">{error || '영상을 찾을 수 없습니다.'}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold truncate max-w-2xl">{video.title}</h1>
                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-transform hover:scale-105"
                    >
                        <LogIn className="w-4 h-4" />
                        로그인하고 타임스탬프 만들기
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <VideoPlayer
                            platform={video.platform}
                            videoId={video.videoId}
                            isLive={video.isLive}
                        />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center h-full min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <div className="max-w-xs">
                            <h3 className="text-xl font-bold mb-2">로그인이 필요합니다</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                타임스탬프를 생성하고 저장하려면 로그인이 필요합니다.
                                Google 계정으로 간편하게 시작하세요!
                            </p>
                            <button
                                onClick={handleLogin}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                로그인하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
