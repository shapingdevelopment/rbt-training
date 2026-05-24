import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LevelBadge } from '@/components/gamification/level-badge'
import { AchievementCard } from '@/components/gamification/achievement-card'
import { SkillCard } from '@/components/gamification/skill-card'
import { Clock, Award, Target, TrendingUp } from 'lucide-react'

export default async function ProfilePage() {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()

  let profile = null, progress = null, userSkills: any[] = [], achievements: any[] = []

  try {
    const token = await getToken({ template: 'supabase' })
    if (token) {
      const supabase = createAuthClient(token)
      const results = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('clerk_id', userId).single(),
        supabase.from('user_progress').select('*').eq('user_id', userId).single(),
        supabase.from('user_skills').select('*, skill:competency_skills(*)').eq('user_id', userId),
        supabase.from('achievements').select('*'),
      ])
      if (results[0].status === 'fulfilled') profile = results[0].value.data
      if (results[1].status === 'fulfilled') progress = results[1].value.data
      if (results[2].status === 'fulfilled') userSkills = results[2].value.data ?? []
      if (results[3].status === 'fulfilled') achievements = results[3].value.data ?? []
    }
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
    <main className="p-6 space-y-6">
      {/* User Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border border-border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{name}</h1>
            <p className="text-muted-foreground mb-1">{roleLabel}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="text-right">
            <LevelBadge level={level} />
            <p className="text-sm text-muted-foreground mt-1">{xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{xp.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Award className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{achievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="text-warning" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Training Hours</p>
                <p className="text-2xl font-bold">{trainingHours || sessionsCompleted * 0.25}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Target className="text-success" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {userSkills.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSkills.map((skill: any) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
