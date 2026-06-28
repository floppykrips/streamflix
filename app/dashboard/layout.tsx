import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/ui/Navbar'
import type { UserProfile } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const userProfile: UserProfile = profile || {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || null,
    role: 'user',
    avatar_url: null,
    created_at: user.created_at,
  }

  return (
    <div className="min-h-screen">
      <Navbar user={userProfile} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
