import { type Event } from '@/types'

type Props = {
  event: Event
  isAdmin?: boolean
  isStart?: boolean
  isEnd?: boolean
  onClick?: (event: Event) => void
}

export default function EventBadge({
  event,
  isAdmin,
  isStart = true,
  isEnd = true,
  onClick,
}: Props) {
  const bgColor = event.color ?? '#3B82F6'
  const timeLabel = event.start_time
    ? event.end_time
      ? `${event.start_time.slice(0, 5)}〜${event.end_time.slice(0, 5)}`
      : event.start_time.slice(0, 5)
    : null

  const roundedClass =
    isStart && isEnd ? 'rounded' :
    isStart ? 'rounded-l rounded-r-none' :
    isEnd ? 'rounded-l-none rounded-r' :
    'rounded-none'

  return (
    <button
      type="button"
      draggable={isAdmin}
      onDragStart={isAdmin ? (e) => {
        e.stopPropagation()
        e.dataTransfer.setData('text/plain', event.id)
        e.dataTransfer.effectAllowed = 'copyMove'
      } : undefined}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(event)
      }}
      className={`w-full truncate ${roundedClass} px-1 py-0.5 text-left text-[10px] font-medium leading-tight text-white`}
      style={{ backgroundColor: bgColor }}
      title={event.title}
    >
      {isStart ? (
        <>
          {timeLabel && <span className="mr-0.5 opacity-90">{timeLabel}</span>}
          {event.title}
        </>
      ) : (
        // 高さを揃えるための不可視テキスト
        <span className="invisible" aria-hidden="true">x</span>
      )}
    </button>
  )
}
