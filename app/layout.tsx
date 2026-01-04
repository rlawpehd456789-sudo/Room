import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'マイルーム - インテリア共有SNS',
  description: 'あなたの部屋を共有し、インスピレーションを見つけよう',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}


