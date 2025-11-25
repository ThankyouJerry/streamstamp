'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Trash2, Edit2, GripVertical } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export interface Timestamp {
    id: string;
    time_seconds: number;
    memo: string;
    order_index: number;
}

interface TimestampListProps {
    timestamps: Timestamp[];
    onReorder: (timestamps: Timestamp[]) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, memo: string) => void;
    onSeek?: (seconds: number) => void;
}

export default function TimestampList({
    timestamps,
    onReorder,
    onDelete,
    onEdit,
    onSeek,
}: TimestampListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMemo, setEditMemo] = useState('');

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(timestamps);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order_index
        const updatedItems = items.map((item, index) => ({
            ...item,
            order_index: index,
        }));

        onReorder(updatedItems);
    };

    const startEdit = (timestamp: Timestamp) => {
        setEditingId(timestamp.id);
        setEditMemo(timestamp.memo);
    };

    const saveEdit = (id: string) => {
        onEdit(id, editMemo);
        setEditingId(null);
        setEditMemo('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditMemo('');
    };

    return (
        <div className="space-y-2">
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="timestamps">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {timestamps.map((timestamp, index) => (
                                <Draggable key={timestamp.id} draggableId={timestamp.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`bg-white dark:bg-gray-800 rounded-lg p-4 mb-2 border border-gray-200 dark:border-gray-700 ${snapshot.isDragging ? 'shadow-lg' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
                                                    <GripVertical className="w-5 h-5 text-gray-400" />
                                                </div>

                                                <div className="flex-1">
                                                    <button
                                                        onClick={() => onSeek?.(timestamp.time_seconds)}
                                                        className="text-blue-600 dark:text-blue-400 font-mono font-semibold hover:underline"
                                                    >
                                                        {formatTime(timestamp.time_seconds)}
                                                    </button>

                                                    {editingId === timestamp.id ? (
                                                        <div className="mt-2">
                                                            <input
                                                                type="text"
                                                                value={editMemo}
                                                                onChange={(e) => setEditMemo(e.target.value)}
                                                                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => saveEdit(timestamp.id)}
                                                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                                                >
                                                                    저장
                                                                </button>
                                                                <button
                                                                    onClick={cancelEdit}
                                                                    className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                                                                >
                                                                    취소
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-1 text-gray-700 dark:text-gray-300">{timestamp.memo}</p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(timestamp)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                                                        title="수정"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(timestamp.id)}
                                                        className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                                        title="삭제"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {timestamps.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    타임스탬프가 없습니다. 영상을 재생하고 &quot;타임스탬프 추가&quot; 버튼을 눌러보세요.
                </div>
            )}
        </div>
    );
}
