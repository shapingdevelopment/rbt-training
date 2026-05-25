import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { LevelBadge } from '@/components/gamification/level-badge'
import { AchievementCard } from '@/components/gamification/achievement-card'
import { SkillCard } from '@/components/gamification/skill-card'
import { Clock, Award, Target, TrendingUp } from 'lucide-react'

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()

  let profile: any = null
  let progress: any = null
  let userSkills: any[] = []
  let achievements: any[] = []

  try {
    const admin = getAdminClient()
    const results = await Promise.allSettled([
      admin.from('profiles').select('*').eq('clerk_id', userId).single(),
      admin.from('user_progress').select('*').eq('user_id', userId).single(),
      admin.from('user_skills').select('*, skill:competency_skills(*)').eq('user_id', userId),
      admin.from('achievements').select('*'),
    ])
    if (results[0].status === 'fulfilled') profile = results[0].value.data
    if (results[1].status === 'fulfilled') progress = results[1].value.data
    if (results[2].status === 'fulfilled') userSkills = results[2].value.data ?? []
    if (results[3].status === 'fulfilled') achievements = results[3].value.data ?? []
  } catch (e) {
    console.warn('Profile data fetch failed:', e)
  }

  const name = profile?.full_name ?? clerkUser?.fullName ?? 'RBT User'
  const email = profile?.email ?? clerkUser?.emailAddresses[0]?.emailAddress ?? ''
  const role = profile?.role ?? 'rbt'
  const roleLabel = role === 'supervisor' ? 'RBT Supervisor' : role === 'admin' ? 'Administrator' : 'Behavior Technician'
  const xp = progress?.total_xp ?? 0
  const level = progress?.level ?? 1
  const sessionsCompleted = progress?.sessions_completed ?? 0
  const trainingHours = Math.round((profile?.total_training_minutes ?? 0) / 60 * 10) / 10
  const scenariosMastered = progress?.scenarios_mastered ?? 0
  const totalScenarios = progress?.total_scenarios_available ?? 0
  const completionRate = totalScenarios > 0 ? Math.round((scenariosMastered / totalScenarios) * 100) : 0

  return (
    <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* User Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-5 sm:p-8 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 truncate">{name}</h1>
            <p className="text-muted-foreground mb-1">{roleLabel}</p>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
          <div className="sm:text-right shrink-0">
            <LevelBadge level={level} />
            <p className="text-sm text-muted-foreground mt-1">{xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: TrendingUp, color: 'primary', label: 'Total XP',        value: xp.toLocaleString() },
          { icon: Award,      color: 'accent',  label: 'Achievements',    value: achievements.length },
          { icon: Clock,      color: 'warning', label: 'Training Hours',  value: trainingHours || (sessionsCompleted * 0.25).toFixed(1) },
          { icon: Target,     color: 'success', label: 'Completion Rate', value: `${completionRate}%` },
        ].map(({ icon: Icon, color, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 sm:p-3 bg-${color}/10 rounded-lg shrink-0`}>
                  <Icon className={`text-${color}`} size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                  <p className="text-lg sm:text-2xl font-bold">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {userSkills.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSkills.map((skill: any) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement: any) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {userSkills.length === 0 && achievements.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Complete your first scenario to start building your profile.</p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
