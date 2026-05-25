import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardOverview } from '@/components/dashboard/overview'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  const displayName = clerkUser?.firstName ?? 'there'

  let profile = null, progress = null, skills: any[] = [], moduleProgress: any[] = [],
      recentSessions: any[] = [], scenarios: any[] = [], achievements: any[] = [],
      userAchievements: any[] = []

  try {
    const admin = getAdminClient()
    const results = await Promise.allSettled([
      admin.from('profiles').select('*').eq('clerk_id', userId).single(),
      admin.from('user_progress').select('*').eq('user_id', userId).single(),
      admin.from('user_skills').select('*, skill:competency_skills(*)').eq('user_id', userId),
      admin.from('module_progress').select('*').eq('user_id', userId),
      admin.from('scenario_sessions').select('*, scenario:scenarios(*)').eq('user_id', userId).order('started_at', { ascending: false }).limit(10),
      admin.from('scenarios').select('*').eq('is_active', true).limit(20),
      admin.from('achievements').select('*'),
      admin.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', userId),
    ])
    if (results[0].status === 'fulfilled') profile       = results[0].value.data
    if (results[1].status === 'fulfilled') progress      = results[1].value.data
    if (results[2].status === 'fulfilled') skills        = results[2].value.data ?? []
    if (results[3].status === 'fulfilled') moduleProgress = results[3].value.data ?? []
    if (results[4].status === 'fulfilled') recentSessions = results[4].value.data ?? []
    if (results[5].status === 'fulfilled') scenarios     = results[5].value.data ?? []
    if (results[6].status === 'fulfilled') achievements  = results[6].value.data ?? []
    if (results[7].status === 'fulfilled') userAchievements = results[7].value.data ?? []
  } catch (e) {
    console.warn('Dashboard data fetch failed:', e)
  }

  const safeProgress = progress ?? {
    id: '', user_id: userId, total_xp: 0, level: 1,
    current_streak: 0, longest_streak: 0, last_activity_date: null,
    sessions_completed: 0, sessions_abandoned: 0,
    total_scenarios_available: 0, scenarios_mastered: 0,
    created_at: '', updated_at: ''
  }

  const safeProfile = profile ?? {
    id: '', clerk_id: userId,
    email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
    full_name: clerkUser?.fullName ?? displayName,
    role: 'rbt' as const, supervisor_id: null,
    total_training_minutes: 0, target_training_hours: 40,
    created_at: '', updated_at: ''
  }

  return (
    <>
      <DashboardHeader
        title={`Welcome back, ${displayName}`}
        subtitle="Continue your learning journey"
        totalXp={safeProgress.total_xp}
      />
      <DashboardOverview
        profile={safeProfile}
        progress={safeProgress}
        skills={skills}
        moduleProgress={moduleProgress}
        recentSessions={recentSessions}
        scenarios={scenarios}
        achievements={achievements}
        userAchievements={userAchievements}
      />
    </>
  )
}
