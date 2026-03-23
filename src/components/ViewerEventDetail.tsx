'use client'

import { useState } from 'react'
import { type Event } from '@/types'

type Props = {
  event: Event
  onClose: () => void
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${y}年${Number(m)}月${Number(d)}日`
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return null
  return timeStr.slice(0, 5)
}

export default function ViewerEventDetail({ event, onClose }: Props) {
  const [showMemo, setShowMemo] = useState(false)

  const startTime = formatTime(event.start_time)
  const endTime = formatTime(event.end_time)
  const isMultiDay = event.end_date && event.end_date !== event.date
  const bgColor = event.color ?? '#3B82F6'

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* 詳細パネル */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-2xl">
        {/* カラーバー */}
        <div className="h-1.5 rounded-t-2xl" style={{ backgroundColor: bgColor }} />

        <div className="px-5 py-4">
          {/* タイトル行 */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-bold text-gray-900 leading-snug">{event.title}</h2>
            <button
              onClick={onClose}
              className="shrink-0 text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5"
            >
              ✕
            </button>
          </div>

          {/* 日付 */}
          <p className="mt-1.5 text-sm text-gray-600">
            {formatDate(event.date)}
            {isMultiDay && ` 〜 ${formatDate(event.end_date!)}`}
          </p>

          {/* 時刻 */}
          {(startTime || endTime) && (
            <p className="mt-1 text-sm text-gray-700">
              🕐{' '}
              {startTime ?? '–'}
              {endTime && ` 〜 ${endTime}`}
            </p>
          )}

          {/* メモ（切り替え） */}
          {event.memo && (
            <div className="mt-3">
              <button
                onClick={() => setShowMemo(!showMemo)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <span>{showMemo ? '▲' : '▼'}</span>
                <span>{showMemo ? 'お知らせを閉じる' : 'お知らせを見る'}</span>
              </button>
              {showMemo && (
                <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {event.memo}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
