'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/utils'
import type { Movie } from '@/types'

export function FeaturedBanner({ movie }: { movie: Movie }) {
  return (
    <div className="relative h-[70vh] min-h-[400px] max-h-[700px] w-full overflow-hidden mb-8">
      {/* Background image */}
      {movie.thumbnail_url ? (
        <Image src={movie.thumbnail_url} alt={movie.title} fill className="object-cover" priority />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand/40 to-gray-900" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgb(var(--bg))] via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-6 lg:px-12">
        <div className="max-w-xl">
          <span className="inline-block bg-brand text-white text-xs font-bold px-3 py-1 rounded mb-3 uppercase tracking-wider">
            Featured
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 mb-4 text-white/70 text-sm">
            <span>{movie.year}</span>
            <span className="flex items-center gap-1"><Clock size={13} /> {formatDuration(movie.duration_minutes)}</span>
            <span className="px-2 py-0.5 border border-white/30 rounded text-xs">{movie.rating}</span>
            {movie.genre?.slice(0, 2).map(g => (
              <span key={g} className="text-white/60 capitalize">{g}</span>
            ))}
          </div>

          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
            {movie.description}
          </p>

          <div className="flex gap-3 flex-wrap">
            <Link href={`/watch/${movie.id}`}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors">
              <Play size={18} fill="black" /> Tonton Sekarang
            </Link>
            <Link href={`/watch/${movie.id}?info=true`}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/30 transition-colors border border-white/30">
              <Info size={18} /> Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
