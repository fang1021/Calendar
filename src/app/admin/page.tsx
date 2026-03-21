import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Calendar from '@/components/Calendar'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .order('date')

  return (
    <div className="flex h-dvh flex-col">
      <Calendar
        userId={user.id}
        initialEvents={events ?? []}
        isAdmin={true}
        initialYear={year}
        initialMonth={month}
      />
      {/* 設定リンク（フローティング） */}
      <Link
        href="/settings"
        className="fixed bottom-4 right-4 rounded-full bg-gray-800 px-4 py-2 text-sm text-white shadow-lg hover:bg-gray-700"
      >
        共有設定
      </Link>
    </div>
  )
}
