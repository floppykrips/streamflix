'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Film, BarChart2, LogOut, Home, Shield, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/ui/ThemeProvider'
import { Sun, Moon } from 'lucide-react'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/movies', label: 'Kelola Film', icon: Film },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
]

export function AdminSidebar({ user }: { user: { full_name: string; email: string; role: string } }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 z-40 flex flex-col card border-r border-l-0 border-t-0 border-b-0 rounded-none hidden md:flex">
      {/* Logo */}
      <div className="p-6 border-b border-[rgb(var(--border))]">
        <Link href="/dashboard" className="text-xl font-black text-brand tracking-tight">
          STREAM<span className="text-[rgb(var(--text))]">FLIX</span>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <Shield size={11} className="text-brand" />
          <span className="text-xs text-brand font-medium">Admin Panel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
                className={cn('sidebar-link', pathname === href && 'active')}>
            <Icon size={18} />
            {label}
            {pathname === href && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[rgb(var(--border))] space-y-1">
        <button onClick={toggleTheme} className="sidebar-link w-full">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
        </button>
        <Link href="/dashboard" className="sidebar-link">
          <Home size={18} /> Ke Beranda
        </Link>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-500 hover:bg-red-500/10">
          <LogOut size={18} /> Keluar
        </button>

        {/* User info */}
        <div className="px-4 py-3 mt-2 bg-[rgb(var(--surface))] rounded-lg">
          <p className="text-xs font-semibold truncate">{user.full_name}</p>
          <p className="text-xs text-[rgb(var(--text-muted))] truncate">{user.email}</p>
        </div>
      </div>
    </aside>
  )
}
