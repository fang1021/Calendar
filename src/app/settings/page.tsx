'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [userId, setUserId] = useState('')
  const [copied, setCopied] = useState<'url' | 'iframe' | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/calendar/${userId}`
      : ''

  const iframeCode = `<iframe
  src="${shareUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 8px;"
></iframe>`

  const lineShareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`

  const handleCopy = async (text: string, type: 'url' | 'iframe') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-dvh bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">
            ← カレンダーに戻る
          </Link>
          <h1 className="text-xl font-bold text-gray-800">共有設定</h1>
        </div>

        {/* 共有URL */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">共有URL</h2>
          <p className="mb-2 text-xs text-gray-500">
            このURLを知っている人はカレンダーを閲覧できます
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs"
            />
            <button
              onClick={() => handleCopy(shareUrl, 'url')}
              className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
            >
              {copied === 'url' ? 'コピー完了!' : 'コピー'}
            </button>
          </div>
        </div>

        {/* iframeコード */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Webサイトへの埋め込み（iframe）
          </h2>
          <p className="mb-2 text-xs text-gray-500">
            HTMLにコピー&ペーストするとカレンダーを表示できます
          </p>
          <div className="mb-2 overflow-x-auto rounded-lg bg-gray-900 p-3">
            <pre className="text-xs text-green-400 whitespace-pre-wrap">{iframeCode}</pre>
          </div>
          <button
            onClick={() => handleCopy(iframeCode, 'iframe')}
            className="w-full rounded-lg bg-blue-600 py-2 text-xs text-white hover:bg-blue-700"
          >
            {copied === 'iframe' ? 'コピー完了!' : 'コードをコピー'}
          </button>
        </div>

        {/* LINEシェア */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">LINEでシェア</h2>
          <p className="mb-3 text-xs text-gray-500">
            LINEアプリでURLを友達に送れます
          </p>
          <a
            href={lineShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#06C755] py-3 text-sm font-semibold text-white hover:bg-[#05a848]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 .5C5.649.5.5 4.826.5 10.175c0 4.516 3.566 8.334 8.514 9.416l.48.104v2.804l2.625-2.625.46-.1C17.82 18.666 23.5 14.747 23.5 10.175 23.5 4.826 18.351.5 12 .5z" />
            </svg>
            LINEで送る
          </a>
        </div>

        {/* ログアウト */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-gray-300 py-2.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  )
}
