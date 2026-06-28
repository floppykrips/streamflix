export type UserRole = 'user' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Movie {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  trailer_url: string | null
  genre: string[]
  year: number
  duration_minutes: number
  rating: string
  is_featured: boolean
  created_at: string
  view_count?: number
}

export interface WatchHistory {
  id: string
  user_id: string
  movie_id: string
  watched_at: string
  progress_seconds: number
  movie?: Movie
}

export interface AnalyticsEvent {
  id: string
  user_id: string | null
  event_type: 'page_view' | 'movie_click' | 'movie_play' | 'movie_pause' | 'search' | 'login' | 'register'
  metadata: Record<string, unknown>
  created_at: string
  user?: UserProfile
}

export interface DashboardStats {
  totalUsers: number
  totalMovies: number
  totalWatches: number
  recentEvents: AnalyticsEvent[]
  topMovies: { movie: Movie; watch_count: number }[]
  eventsByDay: { date: string; count: number }[]
}
