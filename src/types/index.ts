export type Event = {
  id: string
  user_id: string
  title: string
  date: string       // YYYY-MM-DD
  end_date: string | null
  start_time: string | null  // HH:MM
  end_time: string | null    // HH:MM
  memo: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export type CalendarDay = {
  date: Date
  dateStr: string    // YYYY-MM-DD
  isCurrentMonth: boolean
  isToday: boolean
}

export const COLOR_PRESETS = [
  { name: '赤', value: '#EF4444' },
  { name: 'オレンジ', value: '#F97316' },
  { name: '黄', value: '#EAB308' },
  { name: '緑', value: '#22C55E' },
  { name: '青', value: '#3B82F6' },
  { name: '紫', value: '#A855F7' },
] as const
