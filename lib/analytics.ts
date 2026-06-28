import { createClient } from './supabase/client'

type EventType = 'page_view' | 'movie_click' | 'movie_play' | 'movie_pause' | 'search' | 'login' | 'register'

export async function trackEvent(eventType: EventType, metadata: Record<string, unknown> = {}) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('analytics_events').insert({
      user_id: user?.id ?? null,
      event_type: eventType,
      metadata,
    })
  } catch (err) {
    // Silent fail — analytics should never break UX
    console.error('Analytics error:', err)
  }
}
