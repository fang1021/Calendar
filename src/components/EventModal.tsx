'use client'

import { useEffect, useRef, useState } from 'react'
import { type Event, COLOR_PRESETS } from '@/types'
import { createClient } from '@/lib/supabase/client'

type Props = {
  userId: string
  date: string           // 選択された日付 YYYY-MM-DD
  event?: Event | null   // 編集時は既存データ
  onClose: () => void
  onSaved: () => void
}

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

// 5分刻みのセレクト式時刻ピッカー
function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const match = value.match(/^(\d{2}):(\d{2})$/)
  const hour = match ? match[1] : ''
  const minute = match ? match[2] : '00'

  // 既存データの分が5分刻みでない場合でも表示できるよう追加
  const minuteNum = parseInt(minute, 10)
  const minuteOptions = MINUTE_OPTIONS.includes(minuteNum)
    ? MINUTE_OPTIONS
    : [...MINUTE_OPTIONS, minuteNum].sort((a, b) => a - b)

  const update = (h: string, m: string) => {
    if (!h) { onChange(''); return }
    onChange(`${h}:${m}`)
  }

  const selectClass = 'flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-blue-500 focus:outline-none'

  return (
    <div className="flex items-center gap-1">
      <select
        value={hour}
        onChange={(e) => update(e.target.value, minute)}
        className={selectClass}
      >
        <option value="">--</option>
        {HOUR_OPTIONS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="shrink-0 text-gray-400 font-medium">:</span>
      <select
        value={minute}
        onChange={(e) => update(hour, e.target.value)}
        disabled={!hour}
        className={`${selectClass} disabled:opacity-40`}
      >
        {minuteOptions.map((m) => (
          <option key={m} value={String(m).padStart(2, '0')}>
            {String(m).padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function EventModal({ userId, date, event, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState(event?.title ?? '')
  const initialStartDate = event?.date ?? date
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(event?.end_date ?? initialStartDate)
  const [startTime, setStartTime] = useState(event?.start_time ?? '')
  const [endTime, setEndTime] = useState(event?.end_time ?? '')
  const [memo, setMemo] = useState(event?.memo ?? '')
  const [color, setColor] = useState(event?.color ?? COLOR_PRESETS[4].value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const handleClose = () => {
    dialogRef.current?.close()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    // 同日の場合、終了時刻が開始時刻より前なら弾く
    if (startTime && endTime && startDate === endDate && endTime < startTime) {
      setError('終了時刻は開始時刻より後にしてください')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const payload = {
      user_id: userId,
      title: title.trim(),
      date: startDate,
      end_date: endDate || null,
      start_time: startTime || null,
      end_time: endTime || null,
      memo: memo.trim() || null,
      color,
    }

    const { error: dbError } = event
      ? await supabase.from('events').update(payload).eq('id', event.id)
      : await supabase.from('events').insert(payload)

    setLoading(false)
    if (dbError) {
      setError(dbError.message)
      return
    }
    onSaved()
    handleClose()
  }

  const handleDuplicate = async () => {
    if (!event) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const payload = {
      user_id: userId,
      title: title.trim(),
      date: startDate,
      end_date: endDate || null,
      start_time: startTime || null,
      end_time: endTime || null,
      memo: memo.trim() || null,
      color,
    }
    const { error: dbError } = await supabase.from('events').insert(payload)
    setLoading(false)
    if (dbError) {
      setError(dbError.message)
      return
    }
    onSaved()
    handleClose()
  }

  const handleDelete = async () => {
    if (!event) return
    if (!confirm('この予定を削除しますか？')) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', event.id)
    setLoading(false)
    onSaved()
    handleClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[92vw] max-w-md rounded-2xl p-6 shadow-2xl backdrop:bg-black/40"
    >
      <h2 className="mb-4 text-lg font-bold">
        {event ? '予定を編集' : '予定を追加'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* タイトル */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={50}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="予定のタイトル"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* 開始日 */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              開始日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                if (!endDate || endDate < e.target.value) setEndDate(e.target.value)
              }}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              終了日
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 時刻 */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              開始時刻
            </label>
            <TimePicker value={startTime} onChange={setStartTime} />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              終了時刻
            </label>
            <TimePicker value={endTime} onChange={setEndTime} />
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            メモ
          </label>
          <textarea
            maxLength={200}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="詳細メモ（任意）"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* カラー */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            色
          </label>
          <div className="flex gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setColor(preset.value)}
                title={preset.name}
                className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: preset.value,
                  borderColor: color === preset.value ? '#1e293b' : 'transparent',
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* ボタン */}
        <div className="flex justify-between pt-2">
          {event && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                複製
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                削除
              </button>
            </div>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}
