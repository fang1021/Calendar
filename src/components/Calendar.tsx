'use client'

import { useCallback, useState } from 'react'
import { type Event } from '@/types'
import {
  getCalendarDays,
  getNextMonth,
  getPrevMonth,
} from '@/lib/calendar-utils'
import CalendarCell from './CalendarCell'
import EventModal from './EventModal'
import { createClient } from '@/lib/supabase/client'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

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

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedDate(event.date)
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <button
          onClick={handlePrev}
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          ◀ 前月
        </button>
        <h1 className="text-base font-bold text-gray-800">
          {year}年{month + 1}月
        </h1>
        <button
          onClick={handleNext}
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          翌月 ▶
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div
        className="grid border-b border-gray-200"
        style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 2fr' }}
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
        style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 2fr' }}
      >
        {days.map((day) => (
          <CalendarCell
            key={day.dateStr}
            day={day}
            events={events}
            isAdmin={isAdmin}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
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
    </div>
  )
}
