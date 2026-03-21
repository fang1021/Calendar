import { type CalendarDay, type Event } from '@/types'

/**
 * 日付を YYYY-MM-DD 形式の文字列に変換
 */
export function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 月のカレンダー配列を生成（日曜始まり、前後月の余白を含む）
 * 常に6週分（42日）を返す
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const today = toDateStr(new Date())
  const firstDay = new Date(year, month, 1)
  const startSunday = new Date(firstDay)
  startSunday.setDate(firstDay.getDate() - firstDay.getDay())

  const days: CalendarDay[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startSunday)
    date.setDate(startSunday.getDate() + i)
    const dateStr = toDateStr(date)
    days.push({
      date,
      dateStr,
      isCurrentMonth: date.getMonth() === month,
      isToday: dateStr === today,
    })
  }
  return days
}

/**
 * 指定日に表示すべき予定を返す（単日・複数日対応）
 */
export function getEventsOnDay(events: Event[], dateStr: string): Event[] {
  return events.filter((event) => {
    const start = event.date
    const end = event.end_date ?? event.date
    return dateStr >= start && dateStr <= end
  })
}

/**
 * 前月・翌月の year/month を返す
 */
export function getPrevMonth(year: number, month: number) {
  return month === 0
    ? { year: year - 1, month: 11 }
    : { year, month: month - 1 }
}

export function getNextMonth(year: number, month: number) {
  return month === 11
    ? { year: year + 1, month: 0 }
    : { year, month: month + 1 }
}
