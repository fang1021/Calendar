import { createClient } from '@/lib/supabase/server'
import Calendar from '@/components/Calendar'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ userId: string }>
}

export default async function PublicCalendarPage({ params }: Props) {
  const { userId } = await params
  const supabase = await createClient()

  // ユーザーの存在確認は不要（eventsがなければ空カレンダーを表示）
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('date')

  // UUIDの簡易バリデーション
  const isValidUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
  if (!isValidUuid) {
    notFound()
  }

  const today = new Date()

  return (
    <div className="h-dvh">
      <Calendar
        userId={userId}
        initialEvents={events ?? []}
        isAdmin={false}
        initialYear={today.getFullYear()}
        initialMonth={today.getMonth()}
      />
    </div>
  )
}
