import { createClient } from '@/lib/supabase/server'
import { Users, Film, Eye, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [
    { count: totalUsers },
    { count: totalMovies },
    { count: totalWatches },
    { data: recentEvents },
    { data: topMovies },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('movies').select('*', { count: 'exact', head: true }),
    supabase.from('watch_history').select('*', { count: 'exact', head: true }),
    supabase.from('analytics_events')
      .select('*, user:users(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('watch_history')
      .select('movie_id, movie:movies(title, thumbnail_url)')
      .limit(100),
  ])

  // Count by movie_id
  const movieCounts: Record<string, { title: string; count: number }> = {}
  topMovies?.forEach((w: any) => {
    if (!w.movie) return
    const key = w.movie_id
    if (!movieCounts[key]) movieCounts[key] = { title: w.movie.title, count: 0 }
    movieCounts[key].count++
  })
  const sortedMovies = Object.entries(movieCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  const stats = [
    { label: 'Total Pengguna', value: totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Film', value: totalMovies || 0, icon: Film, color: 'text-brand', bg: 'bg-brand/10' },
    { label: 'Total Tontonan', value: totalWatches || 0, icon: Eye, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Event Hari Ini', value: recentEvents?.length || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  const eventLabels: Record<string, string> = {
    page_view: '👁 Lihat halaman',
    movie_click: '🖱 Klik film',
    movie_play: '▶ Mulai nonton',
    movie_pause: '⏸ Pause',
    search: '🔍 Pencarian',
    login: '🔑 Login',
    register: '📝 Daftar',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-[rgb(var(--text-muted))] text-sm mt-1">Monitor aktivitas platform StreamFlix</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-black">{value.toLocaleString('id-ID')}</p>
            <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="card p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand" /> Aktivitas Terbaru
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentEvents?.map((event: any) => (
              <div key={event.id} className="flex items-start gap-3 py-2 border-b border-[rgb(var(--border))] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {eventLabels[event.event_type] || event.event_type}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-muted))] truncate">
                    {event.user?.email || 'Tamu'} • {event.metadata?.title as string || ''}
                  </p>
                </div>
                <span className="text-xs text-[rgb(var(--text-muted))] flex-shrink-0">
                  {format(new Date(event.created_at), 'HH:mm', { locale: idLocale })}
                </span>
              </div>
            ))}
            {!recentEvents?.length && (
              <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8">Belum ada aktivitas</p>
            )}
          </div>
        </div>

        {/* Top movies */}
        <div className="card p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Film size={18} className="text-brand" /> Film Terpopuler
          </h2>
          <div className="space-y-3">
            {sortedMovies.map(([id, { title, count }], i) => (
              <div key={id} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-[rgb(var(--surface))] flex items-center justify-center text-xs font-bold text-[rgb(var(--text-muted))]">
                  {i + 1}
                </span>
                <p className="flex-1 text-sm font-medium truncate">{title}</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-[rgb(var(--surface))] rounded-full h-1.5">
                    <div className="bg-brand h-1.5 rounded-full" style={{ width: `${(count / (sortedMovies[0]?.[1]?.count || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-[rgb(var(--text-muted))] w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
            {sortedMovies.length === 0 && (
              <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8">Belum ada data tontonan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
