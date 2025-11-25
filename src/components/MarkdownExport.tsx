'use client';

import { Timestamp } from './TimestampList';
import { formatTime } from '@/lib/utils';
import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MarkdownExportProps {
    videoTitle: string;
    videoUrl: string;
    timestamps: Timestamp[];
}

export default function MarkdownExport({ videoTitle, videoUrl, timestamps }: MarkdownExportProps) {
    const [copied, setCopied] = useState(false);

    const generateMarkdown = () => {
        let markdown = `# ${videoTitle}\n\n`;
        markdown += `영상 링크: ${videoUrl}\n\n`;
        markdown += `## 타임스탬프\n\n`;

        timestamps
            .sort((a, b) => a.order_index - b.order_index)
            .forEach((timestamp) => {
                markdown += `- [${formatTime(timestamp.time_seconds)}] ${timestamp.memo}\n`;
            });

        return markdown;
    };

    const handleCopy = async () => {
        const markdown = generateMarkdown();
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const markdown = generateMarkdown();
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${videoTitle.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_timestamps.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
                {copied ? (
                    <>
                        <Check className="w-4 h-4" />
                        복사됨!
                    </>
                ) : (
                    <>
                        <Copy className="w-4 h-4" />
                        마크다운 복사
                    </>
                )}
            </button>

            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
                <Download className="w-4 h-4" />
                다운로드
            </button>
        </div>
    );
}
