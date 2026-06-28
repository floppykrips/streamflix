'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Settings } from 'lucide-react'
import { formatSeconds } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import type { Movie } from '@/types'

interface VideoPlayerProps {
  movie: Movie
  userId: string
  initialProgress?: number
}

export function VideoPlayer({ movie, userId, initialProgress = 0 }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(0) // 0-1
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [showControls, setShowControls] = useState(true)
  const [seeking, setSeeking] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const playerRef = useRef<ReactPlayer>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<NodeJS.Timeout>()

  // Save progress to DB
  const saveProgress = useCallback(async (seconds: number) => {
    const supabase = createClient()
    await supabase.from('watch_history').upsert({
      user_id: userId,
      movie_id: movie.id,
      progress_seconds: Math.floor(seconds),
      watched_at: new Date().toISOString(),
    }, { onConflict: 'user_id,movie_id' })
  }, [userId, movie.id])

  // Seek to initial progress on load
  const handleReady = () => {
    if (initialProgress > 0 && playerRef.current) {
      playerRef.current.seekTo(initialProgress, 'seconds')
    }
  }

  const handleProgress = ({ playedSeconds, played: playedFraction }: { playedSeconds: number; played: number }) => {
    if (!seeking) {
      setPlayed(playedFraction)
      // Save every 10 seconds
      if (Math.floor(playedSeconds) % 10 === 0 && playedSeconds > 0) {
        saveProgress(playedSeconds)
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value))
    playerRef.current?.seekTo(parseFloat(e.target.value))
  }

  const skip = (seconds: number) => {
    const current = playerRef.current?.getCurrentTime() || 0
    playerRef.current?.seekTo(current + seconds)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }

  const handlePlay = () => {
    setPlaying(true)
    trackEvent('movie_play', { movie_id: movie.id, title: movie.title })
  }

  const handlePause = () => {
    setPlaying(false)
    const current = playerRef.current?.getCurrentTime() || 0
    saveProgress(current)
    trackEvent('movie_pause', { movie_id: movie.id, seconds: current })
  }

  useEffect(() => {
    return () => clearTimeout(hideTimer.current)
  }, [])

  if (!movie.video_url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white/50">
        <div className="text-center">
          <p className="text-4xl mb-3">🎬</p>
          <p>Video tidak tersedia</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black group"
         onMouseMove={handleMouseMove} onMouseLeave={() => playing && setShowControls(false)}>
      <ReactPlayer
        ref={playerRef}
        url={movie.video_url}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        volume={volume}
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onProgress={handleProgress}
        onDuration={setDuration}
        onBuffer={() => setBuffering(true)}
        onBufferEnd={() => setBuffering(false)}
        config={{
          youtube: { playerVars: { modestbranding: 1 } },
          file: { attributes: { controlsList: 'nodownload' } }
        }}
      />

      {/* Buffering indicator */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Click to play/pause */}
      <div className="absolute inset-0 cursor-pointer" onClick={() => setPlaying(!playing)} />

      {/* Controls overlay */}
      <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls || !playing ? 'opacity-100' : 'opacity-0'}`}>
        <div className="player-overlay px-4 pb-4 pt-16">
          {/* Progress bar */}
          <div className="mb-3 flex items-center gap-3">
            <span className="text-white/80 text-xs tabular-nums">{formatSeconds(Math.floor(played * duration))}</span>
            <input
              type="range" min={0} max={1} step={0.001}
              value={played}
              onChange={handleSeek}
              onMouseDown={() => setSeeking(true)}
              onMouseUp={() => setSeeking(false)}
              className="flex-1 h-1.5 appearance-none bg-white/30 rounded-full cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              style={{ background: `linear-gradient(to right, #E50914 ${played * 100}%, rgba(255,255,255,0.3) ${played * 100}%)` }}
            />
            <span className="text-white/80 text-xs tabular-nums">{formatSeconds(Math.floor(duration))}</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => skip(-10)} className="p-2 text-white hover:text-brand transition-colors">
              <SkipBack size={20} />
            </button>
            <button onClick={() => setPlaying(!playing)} className="p-2 text-white hover:text-brand transition-colors">
              {playing ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>
            <button onClick={() => skip(10)} className="p-2 text-white hover:text-brand transition-colors">
              <SkipForward size={20} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 ml-2">
              <button onClick={() => setMuted(!muted)} className="p-2 text-white hover:text-brand transition-colors">
                {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                     onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false) }}
                     className="w-20 h-1 appearance-none bg-white/30 rounded-full cursor-pointer"
                     style={{ background: `linear-gradient(to right, white ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)` }} />
            </div>

            <div className="flex-1" />

            {/* Title */}
            <span className="text-white/80 text-sm font-medium hidden sm:block">{movie.title}</span>

            <div className="flex-1" />

            <button onClick={toggleFullscreen} className="p-2 text-white hover:text-brand transition-colors">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
