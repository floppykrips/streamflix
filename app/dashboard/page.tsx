import { createClient } from '@/lib/supabase/server'
import { MovieCard } from '@/components/ui/MovieCard'
import { FeaturedBanner } from '@/components/ui/FeaturedBanner'
import type { Movie } from '@/types'

interface DashboardPageProps {
  searchParams: { q?: string; genre?: string }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = createClient()

  let query = supabase.from('movies').select('*').order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.genre) {
    query = query.contains('genre', [searchParams.genre])
  }

  const { data: movies } = await query.limit(50)
  const { data: featured } = await supabase
    .from('movies')
    .select('*')
    .eq('is_featured', true)
    .limit(1)
    .single()

  const allMovies: Movie[] = movies || []
  const featuredMovie: Movie | null = featured || allMovies[0] || null

  const genres = ['Action', 'Drama', 'Horror', 'Comedy', 'Romance', 'Thriller', 'Sci-Fi', 'Animation']
  const byGenre = genres.map(genre => ({
    genre,
    movies: allMovies.filter(m => m.genre?.includes(genre.toLowerCase())),
  })).filter(g => g.movies.length > 0)

  return (
    <div className="pb-12">
      {/* Featured banner - only on homepage without filters */}
      {!searchParams.q && !searchParams.genre && featuredMovie && (
        <FeaturedBanner movie={featuredMovie} />
      )}

      <div className="px-6 lg:px-12">
        {/* Search results */}
        {searchParams.q && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-1">Hasil pencarian: <span className="text-brand">"{searchParams.q}"</span></h2>
            <p className="text-sm text-[rgb(var(--text-muted))] mb-4">{allMovies.length} film ditemukan</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
            {allMovies.length === 0 && (
              <div className="text-center py-16 text-[rgb(var(--text-muted))]">
                <p className="text-4xl mb-3">🎬</p>
                <p className="font-medium">Tidak ada film yang ditemukan</p>
                <p className="text-sm">Coba kata kunci lain</p>
              </div>
            )}
          </div>
        )}

        {/* Genre filter results */}
        {searchParams.genre && !searchParams.q && (
          <div className="mb-8 pt-6">
            <h2 className="text-xl font-bold mb-4 capitalize">Genre: {searchParams.genre}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allMovies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          </div>
        )}

        {/* All movies by genre */}
        {!searchParams.q && !searchParams.genre && (
          <>
            {/* All movies row */}
            <section className="mb-8 mt-8">
              <h2 className="text-lg font-bold mb-3">🎬 Semua Film</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {allMovies.slice(0, 12).map(movie => <MovieCard key={movie.id} movie={movie} />)}
              </div>
            </section>

            {/* By genre */}
            {byGenre.map(({ genre, movies: gMovies }) => (
              <section key={genre} className="mb-8">
                <h2 className="text-lg font-bold mb-3">{genre}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {gMovies.slice(0, 6).map(movie => <MovieCard key={movie.id} movie={movie} />)}
                </div>
              </section>
            ))}

            {allMovies.length === 0 && (
              <div className="text-center py-24 text-[rgb(var(--text-muted))]">
                <p className="text-5xl mb-4">🎬</p>
                <p className="text-lg font-medium mb-1">Belum ada film</p>
                <p className="text-sm">Admin belum menambahkan film. Cek lagi nanti!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
