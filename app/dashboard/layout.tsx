import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

console.log('[env check] service key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10))

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()

  // Use admin client — bypasses RLS entirely, always works
  let profile = null
  let progress = null

  // Fetch profile
  const { data: existingProfile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_id', userId)
    .maybeSingle()

  if (fetchError) {
    console.error('Profile fetch error:', fetchError.message)
  }

  if (!existingProfile) {
    // Create it
    const { data: newProfile, error: insertError } = await supabaseAdmin
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

    if (insertError) {
      console.error('Profile insert error:', insertError.message, insertError.code, insertError.details)
    } else {
      console.log('✓ Profile created for', userId)
    }
    profile = newProfile
  } else {
    profile = existingProfile
  }

  // Fetch progress
  const { data: existingProgress, error: progressFetchError } = await supabaseAdmin
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (progressFetchError) {
    console.error('Progress fetch error:', progressFetchError.message)
  }

  if (!existingProgress) {
    const { data: newProgress, error: progressInsertError } = await supabaseAdmin
      .from('user_progress')
      .insert({
        user_id: userId,
        total_xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        sessions_completed: 0,
        sessions_abandoned: 0,
      })
      .select('*')
      .single()

    if (progressInsertError) {
      console.error('Progress insert error:', progressInsertError.message, progressInsertError.code)
    }
    progress = newProgress
  } else {
    progress = existingProgress
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
