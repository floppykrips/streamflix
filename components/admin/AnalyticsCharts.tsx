'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const EVENT_COLORS: Record<string, string> = {
  page_view: '#6366f1', movie_click: '#E50914', movie_play: '#22c55e',
  movie_pause: '#f59e0b', search: '#3b82f6', login: '#8b5cf6', register: '#14b8a6'
}
const EVENT_LABELS: Record<string, string> = {
  page_view: 'Lihat halaman', movie_click: 'Klik film', movie_play: 'Tonton',
  movie_pause: 'Pause', search: 'Pencarian', login: 'Login', register: 'Daftar'
}
const CHART_COLORS = ['#E50914', '#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6']

interface Props {
  chartData: { date: string; count: number }[]
  typeData: { name: string; value: number }[]
  recentEvents: any[]
  recentUsers: any[]
  recentWatches: any[]
}

export function AnalyticsCharts({ chartData, typeData, recentEvents, recentUsers, recentWatches }: Props) {
  return (
    <div className="space-y-6">
      {/* Bar chart - events per day */}
      <div className="card p-6">
        <h2 className="font-bold mb-4">Event per Hari (7 Hari Terakhir)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'rgb(var(--text-muted))' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: 8 }}
              labelStyle={{ color: 'rgb(var(--text))' }}
              cursor={{ fill: 'rgba(229,9,20,0.08)' }}
            />
            <Bar dataKey="count" fill="#E50914" radius={[4,4,0,0]} name="Total Event" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart - event types */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold mb-4">Jenis Aktivitas</h2>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeData.map(d => ({ ...d, name: EVENT_LABELS[d.name] || d.name }))}
                     cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                     paddingAngle={3} dataKey="value">
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12 }}>{v}</span>} />
                <Tooltip contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[rgb(var(--text-muted))] text-sm text-center py-16">Belum ada data</p>
          )}
        </div>

        {/* Recent users */}
        <div className="card p-6">
          <h2 className="font-bold mb-4">Pengguna Terbaru</h2>
          <div className="space-y-3 max-h-52 overflow-y-auto">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand text-sm font-bold flex-shrink-0">
                  {u.full_name?.charAt(0)?.toUpperCase() || u.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.full_name || 'Pengguna'}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))] truncate">{u.email}</p>
                </div>
                <span className="text-xs text-[rgb(var(--text-muted))] flex-shrink-0">
                  {format(new Date(u.created_at), 'dd/MM', { locale: idLocale })}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="text-sm text-[rgb(var(--text-muted))] text-center py-8">Belum ada pengguna</p>}
          </div>
        </div>
      </div>

      {/* Full event log */}
      <div className="card p-6">
        <h2 className="font-bold mb-4">Log Aktivitas Lengkap</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))]">
                <th className="text-left pb-3 font-medium text-[rgb(var(--text-muted))]">Waktu</th>
                <th className="text-left pb-3 font-medium text-[rgb(var(--text-muted))]">Pengguna</th>
                <th className="text-left pb-3 font-medium text-[rgb(var(--text-muted))]">Aktivitas</th>
                <th className="text-left pb-3 font-medium text-[rgb(var(--text-muted))]">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {recentEvents.slice(0, 50).map((e: any) => (
                <tr key={e.id} className="hover:bg-[rgb(var(--surface))] transition-colors">
                  <td className="py-3 pr-4 text-[rgb(var(--text-muted))] whitespace-nowrap">
                    {format(new Date(e.created_at), 'dd/MM HH:mm', { locale: idLocale })}
                  </td>
                  <td className="py-3 pr-4 truncate max-w-[150px]">
                    {e.user?.email || 'Tamu'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ background: (EVENT_COLORS[e.event_type] || '#888') + '20', color: EVENT_COLORS[e.event_type] || '#888' }}>
                      {EVENT_LABELS[e.event_type] || e.event_type}
                    </span>
                  </td>
                  <td className="py-3 text-[rgb(var(--text-muted))] truncate max-w-[200px]">
                    {(e.metadata?.title as string) || (e.metadata?.query as string) || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentEvents.length === 0 && (
            <p className="text-sm text-[rgb(var(--text-muted))] text-center py-12">Belum ada event yang tercatat</p>
          )}
        </div>
      </div>
    </div>
  )
}
