import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAuthClient, supabaseAdmin } from '@/lib/supabase'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import type { Profile, UserProgress } from '@/lib/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()

  // Try Clerk → Supabase JWT first; fall back to admin client if not configured
  const token = await getToken({ template: 'supabase' }).catch(() => null)
  const supabase = token ? createAuthClient(token) : supabaseAdmin

  // Fetch or create profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_id', userId)
    .maybeSingle()

  if (!profile) {
    const { data: newProfile, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        clerk_id: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
        full_name: clerkUser?.fullName ?? null,
        role: (clerkUser?.publicMetadata?.role as string) ?? 'rbt',
        total_training_minutes: 0,
        target_training_hours: 40,
      })
      .select('*')
      .single()

    if (error) console.error('Profile insert error:', error.message)
    profile = newProfile
  }

  // Fetch or create progress
  let { data: progress } = await supabaseAdmin
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!progress) {
    const { data: newProgress, error } = await supabaseAdmin
      .from('user_progress')
      .insert({ user_id: userId, total_xp: 0, level: 1, current_streak: 0 })
      .select('*')
      .single()

    if (error) console.error('Progress insert error:', error.message)
    progress = newProgress
  }

  const user = {
    name: profile?.full_name ?? clerkUser?.fullName ?? 'RBT User',
    email: profile?.email ?? clerkUser?.emailAddresses[0]?.emailAddress ?? '',
    role: (profile?.role ?? 'rbt') as 'rbt' | 'supervisor' | 'admin',
  }

  const progressData = {
    level: progress?.level ?? 1,
    streak: progress?.current_streak ?? 0,
    longestStreak: progress?.longest_streak ?? 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} progress={progressData} />
      <main className="pl-64">{children}</main>
    </div>
  )
}
