'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Search, Bell, LogOut, Shield, User } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types'

interface NavbarProps {
  user: UserProfile
  onSearch?: (q: string) => void
}

export function Navbar({ user, onSearch }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) {
      onSearch?.(searchVal.trim())
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 gap-4"
         style={{ background: 'rgb(var(--bg))', borderBottom: '1px solid rgb(var(--border))' }}>
      {/* Logo */}
      <Link href="/dashboard" className="flex-shrink-0">
        <span className="text-2xl font-black text-brand tracking-tight">STREAM<span className="text-[rgb(var(--text))]">FLIX</span></span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1 ml-6">
        <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors">Beranda</Link>
        <Link href="/dashboard?genre=action" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors">Action</Link>
        <Link href="/dashboard?genre=drama" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors">Drama</Link>
        <Link href="/dashboard?genre=horror" className="px-3 py-1.5 rounded-lg text-sm font-medium text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] transition-colors">Horor</Link>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <form onSubmit={handleSearch} className={`flex items-center gap-2 transition-all duration-200 ${searchOpen ? 'w-64' : 'w-auto'}`}>
        {searchOpen && (
          <input
            autoFocus
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Cari film..."
            className="input py-1.5 text-sm"
            onBlur={() => !searchVal && setSearchOpen(false)}
          />
        )}
        <button type={searchOpen ? 'submit' : 'button'}
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-[rgb(var(--text-muted))]">
          <Search size={18} />
        </button>
      </form>

      {/* Theme toggle */}
      <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors text-[rgb(var(--text-muted))]">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* User menu */}
      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold">
            {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 w-56 card shadow-xl py-1 z-50" onClick={() => setMenuOpen(false)}>
            <div className="px-4 py-3 border-b border-[rgb(var(--border))]">
              <p className="font-semibold text-sm truncate">{user.full_name || 'Pengguna'}</p>
              <p className="text-xs text-[rgb(var(--text-muted))] truncate">{user.email}</p>
            </div>
            {user.role === 'admin' && (
              <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 hover:bg-[rgb(var(--surface))] text-sm transition-colors text-brand">
                <Shield size={15} /> Panel Admin
              </Link>
            )}
            <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-[rgb(var(--surface))] text-sm transition-colors">
              <User size={15} /> Profil
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[rgb(var(--surface))] text-sm transition-colors text-red-500">
              <LogOut size={15} /> Keluar
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
