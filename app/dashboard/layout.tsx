import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()

  let profile = null
  let progress = null

  try {
    const admin = getAdminClient()

    // Fetch or create profile
    const { data: existingProfile, error: fetchError } = await admin
      .from('profiles')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle()

    if (fetchError) console.error('[layout] profile fetch:', fetchError.message)

    if (!existingProfile) {
      const { data: newProfile, error: insertError } = await admin
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
        console.error('[layout] profile insert:', insertError.message, '| code:', insertError.code)
      } else {
        console.log('[layout] profile created for', userId)
      }
      profile = newProfile
    } else {
      profile = existingProfile
    }

    // Fetch or create progress
    const { data: existingProgress, error: progressFetchError } = await admin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (progressFetchError) console.error('[layout] progress fetch:', progressFetchError.message)

    if (!existingProgress) {
      const { data: newProgress, error: progressInsertError } = await admin
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
        console.error('[layout] progress insert:', progressInsertError.message, '| code:', progressInsertError.code)
      }
      progress = newProgress
    } else {
      progress = existingProgress
    }

  } catch (err: any) {
    // This catches the "SUPABASE_SERVICE_ROLE_KEY is not set" error
    console.error('[layout] admin client error:', err.message)
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
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">{children}</main>
    </div>
  )
}
