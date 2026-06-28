-- =============================================
-- STREAMFLIX - Supabase Database Schema
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- MOVIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.movies (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title              TEXT NOT NULL,
  description        TEXT DEFAULT '',
  thumbnail_url      TEXT DEFAULT '',
  video_url          TEXT DEFAULT '',
  trailer_url        TEXT,
  genre              TEXT[] DEFAULT '{}',
  year               INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  duration_minutes   INTEGER NOT NULL DEFAULT 90,
  rating             TEXT DEFAULT 'PG-13',
  is_featured        BOOLEAN NOT NULL DEFAULT FALSE,
  view_count         INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- WATCH HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.watch_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  movie_id          UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  progress_seconds  INTEGER NOT NULL DEFAULT 0,
  watched_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- =============================================
-- ANALYTICS EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL CHECK (event_type IN ('page_view','movie_click','movie_play','movie_pause','search','login','register')),
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_movie_id ON public.watch_history(movie_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- USERS: Users can read/update their own profile; Admins can read all
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- MOVIES: Everyone authenticated can read; Only admins can write
CREATE POLICY "Authenticated users can read movies" ON public.movies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert movies" ON public.movies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update movies" ON public.movies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete movies" ON public.movies
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- WATCH HISTORY: Users manage their own
CREATE POLICY "Users can read own watch history" ON public.watch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history" ON public.watch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history" ON public.watch_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all watch history" ON public.watch_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ANALYTICS: Users can insert; Admins can read all
CREATE POLICY "Users can insert events" ON public.analytics_events
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can read all events" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- TRIGGER: Auto-create user profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Update updated_at on movies
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER movies_updated_at
  BEFORE UPDATE ON public.movies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- STORAGE BUCKET for videos (run separately)
-- =============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true)
-- ON CONFLICT (id) DO NOTHING;

-- =============================================
-- SAMPLE DATA (opsional - bisa dihapus)
-- =============================================
INSERT INTO public.movies (title, description, thumbnail_url, video_url, genre, year, duration_minutes, rating, is_featured)
VALUES
  (
    'Laskar Pelangi',
    'Kisah perjuangan sekelompok anak-anak miskin di Belitung yang berjuang mendapatkan pendidikan yang layak.',
    'https://upload.wikimedia.org/wikipedia/id/2/27/Laskar_pelangi_sampul.jpg',
    'https://www.youtube.com/watch?v=EZFmZ3gIhoo',
    ARRAY['drama'],
    2008, 125, 'SU', TRUE
  ),
  (
    'Pengabdi Setan',
    'Seorang ibu yang baru saja meninggal mulai menampakkan diri dan teror pun menghantui keluarganya.',
    'https://upload.wikimedia.org/wikipedia/id/thumb/6/6e/Pengabdi_Setan_poster.jpg/220px-Pengabdi_Setan_poster.jpg',
    'https://www.youtube.com/watch?v=2kJoKOHaqm4',
    ARRAY['horror'],
    2017, 107, 'R-17', FALSE
  ),
  (
    'Dilan 1990',
    'Kisah cinta SMA antara Dilan dan Milea di kota Bandung tahun 1990.',
    'https://upload.wikimedia.org/wikipedia/id/thumb/c/cf/Dilan_1990.jpg/220px-Dilan_1990.jpg',
    'https://www.youtube.com/watch?v=2x9bEKKW3cQ',
    ARRAY['romance','drama'],
    2018, 110, 'R-13', FALSE
  )
ON CONFLICT DO NOTHING;

-- =============================================
-- CARA BUAT ADMIN:
-- Setelah daftar akun, jalankan query ini:
-- UPDATE public.users SET role = 'admin' WHERE email = 'email_admin@kamu.com';
-- =============================================
