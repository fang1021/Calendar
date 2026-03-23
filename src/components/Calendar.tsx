'use client'

import { useCallback, useState } from 'react'
import { type Event } from '@/types'
import {
  getCalendarDays,
  getEventsOnDay,
  getNextMonth,
  getPrevMonth,
  toDateStr,
} from '@/lib/calendar-utils'
import CalendarCell from './CalendarCell'
import EventModal from './EventModal'
import ViewerEventDetail from './ViewerEventDetail'
import { createClient } from '@/lib/supabase/client'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']
const MONTH_LABELS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

function formatDayStr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return `${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`
}

type Props = {
  userId: string
  initialEvents: Event[]
  isAdmin: boolean
  initialYear: number
  initialMonth: number
}

export default function Calendar({
  userId,
  initialEvents,
  isAdmin,
  initialYear,
  initialMonth,
}: Props) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(initialYear)
  const [viewerEvent, setViewerEvent] = useState<Event | null>(null)
  const [dayListDate, setDayListDate] = useState<string | null>(null)

  const days = getCalendarDays(year, month)

  const refreshEvents = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date')
    if (data) setEvents(data)
  }, [userId])

  const handlePrev = () => {
    const { year: y, month: m } = getPrevMonth(year, month)
    setYear(y)
    setMonth(m)
  }

  const handleNext = () => {
    const { year: y, month: m } = getNextMonth(year, month)
    setYear(y)
    setMonth(m)
  }

  const handleToday = () => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEventDrop = useCallback(async (eventId: string, targetDateStr: string, copy: boolean) => {
    const event = events.find((e) => e.id === eventId)
    if (!event) return

    const srcDate = new Date(event.date + 'T00:00:00')
    const dstDate = new Date(targetDateStr + 'T00:00:00')
    const deltaDays = Math.round((dstDate.getTime() - srcDate.getTime()) / (1000 * 60 * 60 * 24))

    if (!copy && deltaDays === 0) return

    const shiftDate = (dateStr: string) => {
      const d = new Date(dateStr + 'T00:00:00')
      d.setDate(d.getDate() + deltaDays)
      return toDateStr(d)
    }

    const payload = {
      user_id: userId,
      title: event.title,
      date: shiftDate(event.date),
      end_date: event.end_date ? shiftDate(event.end_date) : null,
      start_time: event.start_time,
      end_time: event.end_time,
      memo: event.memo,
      color: event.color,
    }

    const supabase = createClient()
    if (copy) {
      await supabase.from('events').insert(payload)
    } else {
      await supabase.from('events').update(payload).eq('id', event.id)
    }
    await refreshEvents()
  }, [events, userId, refreshEvents])

  const handleEventClick = (event: Event) => {
    if (isAdmin) {
      setSelectedDate(event.date)
      setSelectedEvent(event)
      setIsModalOpen(true)
    } else {
      setViewerEvent(event)
    }
  }

  const handlePickerOpen = () => {
    setPickerYear(year)
    setShowPicker(true)
  }

  const handleYearMonthSelect = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
    setShowPicker(false)
  }

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* ヘッダー */}
      <div className="relative flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            ◀ 前月
          </button>
          <button
            onClick={handleToday}
            className="rounded-lg border border-blue-200 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
          >
            今日
          </button>
        </div>

        <button
          onClick={handlePickerOpen}
          className="text-base font-bold text-gray-800 hover:text-blue-600 hover:underline"
        >
          {year}年{month + 1}月
        </button>

        <button
          onClick={handleNext}
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          翌月 ▶
        </button>

        {/* 年月ピッカー */}
        {showPicker && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute left-1/2 top-full z-50 mt-1 w-64 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
              {/* 年ナビ */}
              <div className="mb-2 flex items-center justify-between">
                <button
                  onClick={() => setPickerYear((y) => y - 1)}
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                >
                  ◀
                </button>
                <span className="font-bold text-gray-800">{pickerYear}年</span>
                <button
                  onClick={() => setPickerYear((y) => y + 1)}
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                >
                  ▶
                </button>
              </div>
              {/* 月グリッド */}
              <div className="grid grid-cols-4 gap-1">
                {MONTH_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => handleYearMonthSelect(pickerYear, i)}
                    className={[
                      'rounded py-1.5 text-sm',
                      pickerYear === year && i === month
                        ? 'bg-blue-600 font-bold text-white'
                        : 'text-gray-700 hover:bg-blue-50',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 曜日ヘッダー */}
      <div
        className="grid border-b border-gray-200"
        style={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr 3fr' }}
      >
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={[
              'py-1 text-center text-xs font-semibold',
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-600' : 'text-gray-500',
            ].join(' ')}
          >
            {label}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド（6行） */}
      <div
        className="grid flex-1 grid-rows-6 border-l border-t border-gray-200"
        style={{ gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr 3fr' }}
      >
        {days.map((day) => (
          <CalendarCell
            key={day.dateStr}
            day={day}
            events={events}
            isAdmin={isAdmin}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onEventDrop={isAdmin ? handleEventDrop : undefined}
            onShowMore={setDayListDate}
          />
        ))}
      </div>

      {/* 予定モーダル（管理者のみ） */}
      {isAdmin && isModalOpen && selectedDate && (
        <EventModal
          userId={userId}
          date={selectedDate}
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          onSaved={refreshEvents}
        />
      )}

      {/* 閲覧者用イベント詳細 */}
      {!isAdmin && viewerEvent && (
        <ViewerEventDetail
          event={viewerEvent}
          onClose={() => setViewerEvent(null)}
        />
      )}

      {/* 日付の予定一覧（+N件タップ時） */}
      {dayListDate && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setDayListDate(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] flex flex-col rounded-t-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <span className="font-bold text-gray-900">{formatDayStr(dayListDate)}</span>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button
                    onClick={() => { setDayListDate(null); handleDayClick(dayListDate) }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    ＋ 追加
                  </button>
                )}
                <button
                  onClick={() => setDayListDate(null)}
                  className="text-xl leading-none text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-4 py-3 flex flex-col gap-1">
              {getEventsOnDay(events, dayListDate).map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => { setDayListDate(null); handleEventClick(event) }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50"
                >
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: event.color ?? '#3B82F6' }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{event.title}</p>
                    {event.start_time && (
                      <p className="text-xs text-gray-500">
                        {event.start_time.slice(0, 5)}
                        {event.end_time ? `〜${event.end_time.slice(0, 5)}` : ''}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
