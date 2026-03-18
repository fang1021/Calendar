import { type Event } from '@/types'

type Props = {
  event: Event
  onClick?: (event: Event) => void
}

export default function EventBadge({ event, onClick }: Props) {
  const bgColor = event.color ?? '#3B82F6'

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className="w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium leading-tight text-white"
      style={{ backgroundColor: bgColor }}
      title={event.title}
    >
      {event.title}
    </button>
  )
}
