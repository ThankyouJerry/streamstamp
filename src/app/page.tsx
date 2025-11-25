'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseVideoUrl } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { fetchVideoMetadata } from '@/services/metadata';
import { Youtube, Video, LogIn, LayoutDashboard } from 'lucide-react';

export default function HomePage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!url.trim()) {
            alert('URL을 입력해주세요.');
            return;
        }

        const parsed = parseVideoUrl(url);
        if (!parsed) {
            alert('올바른 YouTube URL을 입력해주세요.');
            return;
        }

        // Check if user is logged in
        if (!user) {
            // Redirect to guest editor
            router.push(`/guest/editor?platform=${parsed.platform}&videoId=${parsed.videoId}`);
            return;
        }

        setLoading(true);

        try {
            // Fetch video metadata
            const metadata = await fetchVideoMetadata(parsed.platform, parsed.videoId);

            if (!metadata) {
                alert('영상 정보를 가져올 수 없습니다.');
                setLoading(false);
                return;
            }

            // Save to database
            const { data, error } = await supabase
                .from('videos')
                .insert({
                    user_id: user.id,
                    platform: parsed.platform,
                    video_id: parsed.videoId,
                    title: metadata.title,
                    thumbnail_url: metadata.thumbnailUrl,
                    duration: metadata.duration,
                    is_live: metadata.isLive,
                })
                .select()
                .single();

            if (error) throw error;

            // Redirect to editor
            router.push(`/editor/${data.id}`);
        } catch (error) {
            console.error('Detailed Error:', error);
            if (error instanceof Error) {
                alert(`오류가 발생했습니다: ${error.message}`);
            } else {
                alert('오류가 발생했습니다.');
            }
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header with navigation */}
                <div className="flex justify-end mb-4">
                    {user ? (
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            내 타임라인
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/login')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            로그인
                        </button>
                    )}
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        StreamStamp
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        YouTube 영상에 타임스탬프를 추가하고 관리하세요
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="video-url" className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                            영상 URL 입력
                        </label>
                        <input
                            id="video-url"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 text-lg"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? '처리 중...' : '시작하기'}
                        </button>
                    </form>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Youtube className="w-8 h-8 text-red-600" />
                            <h3 className="text-lg font-semibold">YouTube 지원</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            YouTube 영상과 라이브 스트림의 타임스탬프를 쉽게 관리하세요.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
