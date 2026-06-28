import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function WatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black">
      {/* Minimal top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/dashboard" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={18} /> Kembali
        </Link>
        <span className="ml-4 text-2xl font-black text-brand tracking-tight">STREAM<span className="text-white">FLIX</span></span>
      </div>
      {children}
    </div>
  )
}
