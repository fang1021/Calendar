import { useState } from 'react'
import { type CalendarDay, type Event } from '@/types'
import { getEventsOnDay } from '@/lib/calendar-utils'
import EventBadge from './EventBadge'

type Props = {
  day: CalendarDay
  events: Event[]
  isAdmin: boolean
  onDayClick?: (dateStr: string) => void
  onEventClick?: (event: Event) => void
  onEventDrop?: (eventId: string, targetDateStr: string, copy: boolean) => void
  onShowMore?: (dateStr: string) => void
}

export default function CalendarCell({
  day,
  events,
  isAdmin,
  onDayClick,
  onEventClick,
  onEventDrop,
  onShowMore,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false)

  // 複数日イベントを先頭に並べる
  const dayEvents = getEventsOnDay(events, day.dateStr).sort((a, b) => {
    const aMulti = a.end_date && a.end_date !== a.date ? 1 : 0
    const bMulti = b.end_date && b.end_date !== b.date ? 1 : 0
    return bMulti - aMulti
  })
  const maxVisible = 2
  const overflowCount = dayEvents.length - maxVisible

  const dayOfWeek = day.date.getDay() // 0=日, 6=土

  const cellClass = [
    'relative flex flex-col border-r border-b border-gray-200 p-0.5 min-w-0',
    !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white',
    day.isToday ? 'bg-blue-50' : '',
    isAdmin && day.isCurrentMonth ? 'cursor-pointer hover:bg-blue-50/60' : '',
    isDragOver && isAdmin ? 'ring-2 ring-inset ring-blue-400 bg-blue-100/60' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const dateNumClass = [
    'flex items-center justify-end h-4 mb-0.5 px-0.5 text-xs font-semibold',
    !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cellClass}
      onClick={() => {
        if (isAdmin && day.isCurrentMonth) {
          onDayClick?.(day.dateStr)
        }
      }}
      onDragOver={(e) => {
        if (!isAdmin) return
        e.preventDefault()
        e.dataTransfer.dropEffect = e.ctrlKey ? 'copy' : 'move'
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        if (!isAdmin) return
        e.preventDefault()
        setIsDragOver(false)
        const eventId = e.dataTransfer.getData('text/plain')
        if (eventId) {
          onEventDrop?.(eventId, day.dateStr, e.ctrlKey)
        }
      }}
    >
      {/* 日付数字 */}
      <div className={dateNumClass}>
        {day.isToday ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
            {day.date.getDate()}
          </span>
        ) : (
          <span className="leading-none">{day.date.getDate()}</span>
        )}
      </div>

      {/* 予定バッジ */}
      <div className="flex flex-col gap-0.5 -mx-0.5">
        {dayEvents.slice(0, maxVisible).map((event) => {
          const eventEnd = event.end_date ?? event.date
          const isMultiDay = event.end_date && event.end_date !== event.date
          // 視覚的な開始：イベント開始日 OR 週の先頭（日曜）
          const isStart = !isMultiDay || event.date === day.dateStr || dayOfWeek === 0
          // 視覚的な終了：イベント終了日 OR 週の末尾（土曜）
          const isEnd = !isMultiDay || eventEnd === day.dateStr || dayOfWeek === 6
          return (
            <EventBadge
              key={event.id}
              event={event}
              isAdmin={isAdmin}
              isStart={isStart}
              isEnd={isEnd}
              onClick={onEventClick}
            />
          )
        })}
        {overflowCount > 0 && (
          <button
            type="button"
            className="w-full px-1 text-left text-[10px] text-gray-500 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation()
              onShowMore?.(day.dateStr)
            }}
          >
            +{overflowCount}件
          </button>
        )}
      </div>
    </div>
  )
}
