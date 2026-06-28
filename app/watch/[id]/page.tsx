import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VideoPlayer } from '@/components/player/VideoPlayer'
import { MovieCard } from '@/components/ui/MovieCard'
import { Clock, Calendar, Star } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import type { Movie } from '@/types'
import Link from 'next/link'

export default async function WatchPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: movie } = await supabase
    .from('movies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!movie) notFound()

  // Get progress
  const { data: history } = await supabase
    .from('watch_history')
    .select('progress_seconds')
    .eq('user_id', user.id)
    .eq('movie_id', params.id)
    .single()

  // Related movies (same genre)
  const { data: related } = await supabase
    .from('movies')
    .select('*')
    .contains('genre', movie.genre || [])
    .neq('id', params.id)
    .limit(6)

  return (
    <div className="min-h-screen pt-16 pb-12">
      {/* Player */}
      <div className="w-full bg-black aspect-video max-h-[80vh]">
        <VideoPlayer
          movie={movie as Movie}
          userId={user.id}
          initialProgress={history?.progress_seconds || 0}
        />
      </div>

      <div className="px-6 lg:px-12 mt-8">
        <div className="max-w-5xl">
          {/* Movie info */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-2">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[rgb(var(--text-muted))]">
                <span className="flex items-center gap-1"><Calendar size={14} /> {movie.year}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {formatDuration(movie.duration_minutes)}</span>
                <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" fill="currentColor" /> {movie.rating}</span>
                {movie.genre?.map((g: string) => (
                  <Link key={g} href={`/dashboard?genre=${g}`}
                        className="px-2 py-0.5 bg-[rgb(var(--surface))] rounded-full text-xs hover:bg-brand hover:text-white transition-colors capitalize">
                    {g}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[rgb(var(--text-muted))] leading-relaxed mb-8 max-w-3xl">
            {movie.description}
          </p>

          {/* Related */}
          {related && related.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">Film Serupa</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(related as Movie[]).map(m => <MovieCard key={m.id} movie={m} size="sm" />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
