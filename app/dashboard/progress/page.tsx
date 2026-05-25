import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase'
import { DashboardHeader } from '@/components/dashboard/header'
import { ProgressOverview } from '@/components/progress/progress-overview'
import type { Profile, UserProgress, UserSkill, ModuleProgress, UserAchievement, Achievement, UserEngagement } from '@/lib/types'

export default async function ProgressPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()

  let profile: Profile | null = null
  let progress: UserProgress | null = null
  let skills: UserSkill[] = []
  let moduleProgress: ModuleProgress[] = []
  let engagementData: UserEngagement[] = []
  let achievements: Achievement[] = []
  let userAchievements: UserAchievement[] = []

  try {
    const admin = getAdminClient()
    const results = await Promise.allSettled([
      admin.from('profiles').select('*').eq('clerk_id', userId).single(),
      admin.from('user_progress').select('*').eq('user_id', userId).single(),
      admin.from('user_skills').select('*, skill:competency_skills(*)').eq('user_id', userId),
      admin.from('module_progress').select('*').eq('user_id', userId),
      admin.from('user_engagement').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30),
      admin.from('achievements').select('*'),
      admin.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', userId),
    ])
    if (results[0].status === 'fulfilled') profile = results[0].value.data
    if (results[1].status === 'fulfilled') progress = results[1].value.data
    if (results[2].status === 'fulfilled') skills = results[2].value.data ?? []
    if (results[3].status === 'fulfilled') moduleProgress = results[3].value.data ?? []
    if (results[4].status === 'fulfilled') engagementData = results[4].value.data ?? []
    if (results[5].status === 'fulfilled') achievements = results[5].value.data ?? []
    if (results[6].status === 'fulfilled') userAchievements = results[6].value.data ?? []
  } catch (e) {
    console.warn('Progress data fetch failed:', e)
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
    full_name: clerkUser?.fullName ?? 'RBT User',
    role: 'rbt' as const, supervisor_id: null,
    total_training_minutes: 0, target_training_hours: 40,
    created_at: '', updated_at: ''
  }

  return (
    <>
      <DashboardHeader
        title="My Progress"
        subtitle="Track your learning journey"
        totalXp={safeProgress.total_xp}
      />
      <ProgressOverview
        profile={safeProfile}
        progress={safeProgress}
        skills={skills}
        moduleProgress={moduleProgress}
        engagementData={engagementData}
        achievements={achievements}
        userAchievements={userAchievements}
      />
    </>
  )
}
