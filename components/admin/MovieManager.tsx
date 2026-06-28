'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, X, Loader2, Film, Link as LinkIcon, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Movie } from '@/types'

const GENRES = ['action', 'drama', 'horror', 'comedy', 'romance', 'thriller', 'sci-fi', 'animation', 'documentary', 'fantasy']
const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'SU', 'R-13', 'R-17', 'D']

interface FormData {
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  trailer_url: string
  genre: string[]
  year: number
  duration_minutes: number
  rating: string
  is_featured: boolean
}

const defaultForm: FormData = {
  title: '', description: '', thumbnail_url: '', video_url: '',
  trailer_url: '', genre: [], year: new Date().getFullYear(),
  duration_minutes: 90, rating: 'PG-13', is_featured: false
}

export function MovieManager({ initialMovies }: { initialMovies: Movie[] }) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies)
  const [showForm, setShowForm] = useState(false)
  const [editMovie, setEditMovie] = useState<Movie | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [videoInputType, setVideoInputType] = useState<'link' | 'local'>('link')

  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setEditMovie(null); setForm(defaultForm); setShowForm(true); setError('') }
  const openEdit = (m: Movie) => {
    setEditMovie(m)
    setForm({
      title: m.title, description: m.description, thumbnail_url: m.thumbnail_url,
      video_url: m.video_url, trailer_url: m.trailer_url || '', genre: m.genre || [],
      year: m.year, duration_minutes: m.duration_minutes, rating: m.rating, is_featured: m.is_featured
    })
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    if (editMovie) {
      const { data, error: err } = await supabase
        .from('movies').update(form).eq('id', editMovie.id).select().single()
      if (err) { setError(err.message); setLoading(false); return }
      setMovies(prev => prev.map(m => m.id === editMovie.id ? data : m))
    } else {
      const { data, error: err } = await supabase
        .from('movies').insert(form).select().single()
      if (err) { setError(err.message); setLoading(false); return }
      setMovies(prev => [data, ...prev])
    }

    setShowForm(false)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus film ini?')) return
    const supabase = createClient()
    const { error: err } = await supabase.from('movies').delete().eq('id', id)
    if (!err) setMovies(prev => prev.filter(m => m.id !== id))
  }

  const toggleGenre = (g: string) => {
    setForm(f => ({
      ...f,
      genre: f.genre.includes(g) ? f.genre.filter(x => x !== g) : [...f.genre, g]
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `movies/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('videos').upload(path, file, { upsert: true })
    if (uploadErr) { setError('Upload gagal: ' + uploadErr.message); setLoading(false); return }
    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path)
    setForm(f => ({ ...f, video_url: urlData.publicUrl }))
    setLoading(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kelola Film</h1>
          <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">{movies.length} film total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Tambah Film
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Cari film..."
        className="input mb-6 max-w-sm"
      />

      {/* Movie list */}
      <div className="space-y-3">
        {filtered.map(movie => (
          <div key={movie.id} className="card p-4 flex items-center gap-4">
            <div className="w-16 h-24 flex-shrink-0 bg-[rgb(var(--surface))] rounded-lg overflow-hidden relative">
              {movie.thumbnail_url ? (
                <Image src={movie.thumbnail_url} alt={movie.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film size={20} className="text-[rgb(var(--text-muted))]" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold truncate">{movie.title}</h3>
                {movie.is_featured && <span className="bg-brand text-white text-xs px-2 py-0.5 rounded font-medium flex-shrink-0">Featured</span>}
              </div>
              <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">{movie.year} • {movie.rating} • {movie.duration_minutes}m</p>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {movie.genre?.map(g => (
                  <span key={g} className="text-xs bg-[rgb(var(--surface))] px-2 py-0.5 rounded-full capitalize">{g}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(movie)} className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(movie.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-[rgb(var(--text-muted))] hover:text-red-500">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[rgb(var(--text-muted))]">
            <Film size={32} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada film. Tambah film pertama!</p>
          </div>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl mt-4 mb-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editMovie ? 'Edit Film' : 'Tambah Film Baru'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Judul Film *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                         placeholder="Judul film" className="input" required />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Deskripsi</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Sinopsis film..." className="input h-24 resize-none" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">URL Thumbnail</label>
                  <input value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
                         placeholder="https://..." className="input" type="url" />
                </div>

                {/* Video URL */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Video</label>
                  <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => setVideoInputType('link')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${videoInputType === 'link' ? 'bg-brand text-white' : 'bg-[rgb(var(--surface))] text-[rgb(var(--text-muted))]'}`}>
                      <LinkIcon size={14} /> Link URL
                    </button>
                    <button type="button" onClick={() => setVideoInputType('local')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${videoInputType === 'local' ? 'bg-brand text-white' : 'bg-[rgb(var(--surface))] text-[rgb(var(--text-muted))]'}`}>
                      <Upload size={14} /> Upload File
                    </button>
                  </div>
                  {videoInputType === 'link' ? (
                    <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                           placeholder="https://youtube.com/watch?v=... atau URL video langsung" className="input" />
                  ) : (
                    <div>
                      <input type="file" accept="video/*" onChange={handleFileUpload} className="input py-2 cursor-pointer" />
                      {form.video_url && <p className="text-xs text-green-500 mt-1 truncate">✓ {form.video_url}</p>}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">URL Trailer (opsional)</label>
                  <input value={form.trailer_url} onChange={e => setForm(f => ({ ...f, trailer_url: e.target.value }))}
                         placeholder="https://youtube.com/..." className="input" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Tahun *</label>
                  <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}
                         min={1900} max={2099} className="input" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Durasi (menit) *</label>
                  <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) }))}
                         min={1} className="input" required />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Rating</label>
                  <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="input">
                    {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="featured" checked={form.is_featured}
                         onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                         className="w-4 h-4 accent-brand" />
                  <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Tampilkan sebagai Featured</label>
                </div>
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <button key={g} type="button" onClick={() => toggleGenre(g)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${form.genre.includes(g) ? 'bg-brand text-white' : 'bg-[rgb(var(--surface))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--border))]'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-500">{error}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Menyimpan...</> : (editMovie ? 'Simpan Perubahan' : 'Tambah Film')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
