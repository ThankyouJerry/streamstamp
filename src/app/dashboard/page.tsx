'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatTime } from '@/lib/utils';
import { Video, Clock, Lock, Unlock, LogOut, Trash2 } from 'lucide-react';

interface VideoItem {
    id: string;
    platform: string;
    title: string;
    thumbnail_url: string;
    is_public: boolean;
    created_at: string;
    timestamps: { count: number }[];
}

export default function DashboardPage() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        } else {
            setUser(user);
            loadVideos();
        }
    }

    async function loadVideos() {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select(`
          *,
          timestamps(count)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setVideos(data as any);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteVideo(id: string) {
        try {
            const { error } = await supabase
                .from('videos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setVideos(videos.filter(v => v.id !== id));
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('영상 삭제에 실패했습니다.');
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
        router.push('/');
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">내 타임라인</h1>
                    <div className="flex gap-4 items-center">
                        {user && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {user.email}
                            </span>
                        )}
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            새 영상 추가
                        </button>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            <LogOut className="w-4 h-4" />
                            로그아웃
                        </button>
                    </div>
                </div>

                {videos.length === 0 ? (
                    <div className="text-center py-16">
                        <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                            아직 저장된 영상이 없습니다
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            첫 영상 추가하기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => router.push(`/editor/${video.id}`)}
                                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                            >
                                {video.thumbnail_url && (
                                    <img
                                        src={video.thumbnail_url}
                                        alt={video.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{video.timestamps?.[0]?.count || 0} 타임스탬프</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {video.is_public ? (
                                                <>
                                                    <Unlock className="w-4 h-4" />
                                                    <span>공개</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4" />
                                                    <span>비공개</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-between items-center">
                                        <div className="text-xs text-gray-500">
                                            {new Date(video.created_at).toLocaleDateString('ko-KR')}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('정말 삭제하시겠습니까? 모든 타임스탬프도 함께 삭제됩니다.')) {
                                                    deleteVideo(video.id);
                                                }
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            title="영상 삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
