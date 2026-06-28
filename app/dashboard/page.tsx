import { createClient } from '@/lib/supabase/server'
import { Users, Film, Eye, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const { count: totalUsers } = await supabase
    .from('users').select('*', { count: 'exact', head: true })
  
  const { count: totalMovies } = await supabase
    .from('movies').select('*', { count: 'exact', head: true })
  
  const { data: recentEvents } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const stats = [
    { label: 'Total Pengguna', value: totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Film', value: totalMovies || 0, icon: Film, color: 'text-brand', bg: 'bg-brand/10' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-[rgb(var(--text-muted))] text-sm mt-1">Monitor aktivitas platform</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-4">Aktivitas Terbaru</h2>
        <div className="space-y-2">
          {recentEvents?.map((event: any) => (
            <div key={event.id} className="flex items-center gap-3 py-2 border-b border-[rgb(var(--border))] last:border-0">
              <p className="text-sm">{event.event_type}</p>
              <span className="text-xs text-[rgb(var(--text-muted))] ml-auto">
                {new Date(event.created_at).toLocaleTimeString('id-ID')}
              </span>
            </div>
          ))}
          {!recentEvents?.length && (
            <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8">Belum ada aktivitas</p>
          )}
        </div>
      </div>
    </div>
  )
}