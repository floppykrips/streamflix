import { createClient } from '@/lib/supabase/server'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { format, subDays } from 'date-fns'

export default async function AdminAnalyticsPage() {
  const supabase = createClient()

  const sevenDaysAgo = subDays(new Date(), 7).toISOString()

  const [
    { data: events },
    { data: users },
    { data: watches },
  ] = await Promise.all([
    supabase.from('analytics_events')
      .select('event_type, created_at, metadata, user:users(full_name, email)')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('users').select('id, email, full_name, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('watch_history').select('movie_id, watched_at, progress_seconds, movie:movies(title)').order('watched_at', { ascending: false }).limit(100),
  ])

  // Build events by day
  const eventsByDay: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const day = format(subDays(new Date(), i), 'dd/MM')
    eventsByDay[day] = 0
  }
  events?.forEach(e => {
    const day = format(new Date(e.created_at), 'dd/MM')
    if (eventsByDay[day] !== undefined) eventsByDay[day]++
  })

  const chartData = Object.entries(eventsByDay).map(([date, count]) => ({ date, count }))

  // Event type breakdown
  const typeCount: Record<string, number> = {}
  events?.forEach(e => { typeCount[e.event_type] = (typeCount[e.event_type] || 0) + 1 })
  const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Data 7 hari terakhir</p>
      </div>

      <AnalyticsCharts
        chartData={chartData}
        typeData={typeData}
        recentEvents={events as any[] || []}
        recentUsers={users || []}
        recentWatches={watches as any[] || []}
      />
    </div>
  )
}
