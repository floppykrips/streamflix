import { createClient } from '@/lib/supabase/server'
import { MovieManager } from '@/components/admin/MovieManager'

export default async function AdminMoviesPage() {
  const supabase = createClient()
  const { data: movies } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })

  return <MovieManager initialMovies={movies || []} />
}
