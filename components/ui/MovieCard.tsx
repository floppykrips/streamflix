'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play, Clock, Star } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import type { Movie } from '@/types'

interface MovieCardProps {
  movie: Movie
  size?: 'sm' | 'md' | 'lg'
}

export function MovieCard({ movie, size = 'md' }: MovieCardProps) {
  const heights: Record<string, string> = { sm: 'h-36', md: 'h-52', lg: 'h-72' }

  const handleClick = () => {
    trackEvent('movie_click', { movie_id: movie.id, title: movie.title })
  }

  return (
    <Link href={`/watch/${movie.id}`} onClick={handleClick} className="movie-card block">
      <div className={`relative ${heights[size]} bg-[rgb(var(--surface))] rounded-lg overflow-hidden`}>
        {movie.thumbnail_url ? (
          <Image
            src={movie.thumbnail_url}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand/30 to-brand/5">
            <Play size={32} className="text-brand opacity-60" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 text-xs text-white/80">
              <Clock size={11} /> {formatDuration(movie.duration_minutes)}
            </span>
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <Star size={11} fill="currentColor" /> {movie.rating}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white text-black text-xs font-bold rounded-md hover:bg-white/90">
              <Play size={12} fill="black" /> Tonton
            </button>
          </div>
        </div>

        {/* Featured badge */}
        {movie.is_featured && (
          <span className="absolute top-2 left-2 bg-brand text-white text-xs font-bold px-2 py-0.5 rounded">FEATURED</span>
        )}

        {/* Genre badge */}
        {movie.genre?.[0] && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            {movie.genre[0]}
          </span>
        )}
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1">{movie.title}</h3>
        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{movie.year}</p>
      </div>
    </Link>
  )
}
