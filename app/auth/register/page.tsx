'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })

    if (authError) {
      setError(authError.message || 'Pendaftaran gagal. Coba lagi.')
      setLoading(false)
      return
    }

    // Insert profile
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'user',
      })
      await trackEvent('register', { method: 'email' })
    }

    // If email confirmation is disabled, redirect directly
    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Akun berhasil dibuat!</h2>
        <p className="text-[rgb(var(--text-muted))] text-sm mb-4">
          Cek email <strong>{email}</strong> untuk konfirmasi akun, lalu masuk.
        </p>
        <Link href="/auth/login" className="btn-primary inline-block">Ke halaman login</Link>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold mb-1">Daftar Gratis</h1>
      <p className="text-sm text-[rgb(var(--text-muted))] mb-6">Sudah punya akun?{' '}
        <Link href="/auth/login" className="text-brand hover:underline font-medium">Masuk</Link>
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Nama Lengkap</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                 placeholder="Nama kamu" className="input" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                 placeholder="nama@email.com" className="input" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Password</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={password}
                   onChange={e => setPassword(e.target.value)}
                   placeholder="Min. 6 karakter" className="input pr-12" required />
            <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={16} className="animate-spin" /> Mendaftar...</> : 'Daftar Sekarang'}
        </button>

        <p className="text-xs text-center text-[rgb(var(--text-muted))]">
          Dengan mendaftar, kamu menyetujui syarat dan ketentuan kami.
        </p>
      </form>
    </div>
  )
}
