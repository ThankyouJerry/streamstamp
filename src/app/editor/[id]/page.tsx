'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import TimestampList, { Timestamp } from '@/components/TimestampList';
import MarkdownExport from '@/components/MarkdownExport';
import { createClient } from '@/lib/supabase/client';
import { fetchVideoMetadata, VideoMetadata } from '@/services/metadata';
import { Plus, Share2, Lock, Unlock } from 'lucide-react';

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const videoDbId = params.id as string;

    const [video, setVideo] = useState<VideoMetadata | null>(null);
    const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
    const [currentTime, setCurrentTime] = useState(0);
    const [newMemo, setNewMemo] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadVideo();
        loadTimestamps();
        checkAuth();
    }, [videoDbId]);

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    }

    async function loadVideo() {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('id', videoDbId)
                .single();

            if (error) throw error;

            if (data) {
                setIsPublic(data.is_public);
                const metadata = await fetchVideoMetadata(data.platform, data.video_id);
                if (metadata) {
                    setVideo(metadata);
                }
            }
        } catch (error) {
            console.error('Error loading video:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadTimestamps() {
        try {
            const { data, error } = await supabase
                .from('timestamps')
                .select('*')
                .eq('video_id', videoDbId)
                .order('order_index', { ascending: true });

            if (error) throw error;
            if (data) setTimestamps(data);
        } catch (error) {
            console.error('Error loading timestamps:', error);
        }
    }

    async function addTimestamp() {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (!newMemo.trim()) {
            alert('메모를 입력해주세요.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('timestamps')
                .insert({
                    video_id: videoDbId,
                    user_id: user.id,
                    time_seconds: Math.floor(currentTime),
                    memo: newMemo,
                    order_index: timestamps.length,
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setTimestamps([...timestamps, data]);
                setNewMemo('');
                setShowAddDialog(false);
            }
        } catch (error) {
            console.error('Error adding timestamp:', error);
            alert('타임스탬프 추가에 실패했습니다.');
        }
    }

    async function handleReorder(newTimestamps: Timestamp[]) {
        setTimestamps(newTimestamps);

        try {
            for (const ts of newTimestamps) {
                await supabase
                    .from('timestamps')
                    .update({ order_index: ts.order_index })
                    .eq('id', ts.id);
            }
        } catch (error) {
            console.error('Error reordering timestamps:', error);
        }
    }

    async function handleDelete(id: string) {
        try {
            const { error } = await supabase
                .from('timestamps')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTimestamps(timestamps.filter(ts => ts.id !== id));
        } catch (error) {
            console.error('Error deleting timestamp:', error);
        }
    }

    async function handleEdit(id: string, memo: string) {
        try {
            const { error } = await supabase
                .from('timestamps')
                .update({ memo })
                .eq('id', id);

            if (error) throw error;
            setTimestamps(timestamps.map(ts => ts.id === id ? { ...ts, memo } : ts));
        } catch (error) {
            console.error('Error editing timestamp:', error);
        }
    }

    async function togglePublic() {
        try {
            const newPublic = !isPublic;
            const { error } = await supabase
                .from('videos')
                .update({ is_public: newPublic })
                .eq('id', videoDbId);

            if (error) throw error;
            setIsPublic(newPublic);
        } catch (error) {
            console.error('Error toggling public:', error);
        }
    }

    function copyShareLink() {
        const shareUrl = `${window.location.origin}/share/${videoDbId}`;
        navigator.clipboard.writeText(shareUrl);
        alert('공유 링크가 복사되었습니다!');
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">로딩 중...</div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">영상을 찾을 수 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{video.title}</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={togglePublic}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            {isPublic ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            {isPublic ? '공개' : '비공개'}
                        </button>
                        {isPublic && (
                            <button
                                onClick={copyShareLink}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Share2 className="w-4 h-4" />
                                공유 링크 복사
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <VideoPlayer
                            platform={video.platform}
                            videoId={video.videoId}
                            isLive={video.isLive}
                            onProgress={setCurrentTime}
                        />

                        <button
                            onClick={() => setShowAddDialog(true)}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            타임스탬프 추가
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">타임스탬프 목록</h2>
                            {timestamps.length > 0 && (
                                <MarkdownExport
                                    videoTitle={video.title}
                                    videoUrl={`https://${video.platform === 'youtube' ? 'youtube.com/watch?v=' : 'chzzk.naver.com/video/'}${video.videoId}`}
                                    timestamps={timestamps}
                                />
                            )}
                        </div>

                        <TimestampList
                            timestamps={timestamps}
                            onReorder={handleReorder}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
                    </div>
                </div>
            </div>

            {showAddDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">타임스탬프 추가</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            현재 시간: {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}
                        </p>
                        <input
                            type="text"
                            value={newMemo}
                            onChange={(e) => setNewMemo(e.target.value)}
                            placeholder="메모를 입력하세요"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 mb-4"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={addTimestamp}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                            >
                                추가
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddDialog(false);
                                    setNewMemo('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 rounded-lg"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
