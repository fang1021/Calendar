import { type CalendarDay, type Event } from '@/types'
import { getEventsOnDay } from '@/lib/calendar-utils'
import EventBadge from './EventBadge'

type Props = {
  day: CalendarDay
  events: Event[]
  isAdmin: boolean
  onDayClick?: (dateStr: string) => void
  onEventClick?: (event: Event) => void
}

export default function CalendarCell({
  day,
  events,
  isAdmin,
  onDayClick,
  onEventClick,
}: Props) {
  const dayEvents = getEventsOnDay(events, day.dateStr)
  const maxVisible = 2
  const overflowCount = dayEvents.length - maxVisible

  const cellClass = [
    'relative flex flex-col border-r border-b border-gray-200 p-0.5 overflow-hidden',
    !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white',
    day.isToday ? 'bg-blue-50' : '',
    isAdmin && day.isCurrentMonth ? 'cursor-pointer hover:bg-blue-50/60' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const dateNumClass = [
    'text-right text-xs font-semibold leading-none mb-0.5 px-0.5',
    !day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700',
    day.isToday
      ? 'flex items-center justify-end'
      : '',
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
    >
      {/* 日付数字 */}
      <div className={dateNumClass}>
        {day.isToday ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
            {day.date.getDate()}
          </span>
        ) : (
          <span>{day.date.getDate()}</span>
        )}
      </div>

      {/* 予定バッジ */}
      <div className="flex flex-col gap-0.5">
        {dayEvents.slice(0, maxVisible).map((event) => (
          <EventBadge
            key={event.id}
            event={event}
            onClick={onEventClick}
          />
        ))}
        {overflowCount > 0 && (
          <span className="px-1 text-[10px] text-gray-500">
            +{overflowCount}件
          </span>
        )}
      </div>
    </div>
  )
}
