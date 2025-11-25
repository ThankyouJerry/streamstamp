import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'StreamStamp - 영상 타임스탬프 관리',
    description: 'YouTube와 Chzzk 영상에 타임스탬프를 추가하고 관리하세요',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    )
}
