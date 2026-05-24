import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SkillCard } from '@/components/gamification/skill-card'
import { Zap, Target, TrendingUp, Lock } from 'lucide-react'
import Link from 'next/link'

export default async function JourneyPage() {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/sign-in')

  let scenarios: any[] = []
  let userSkills: any[] = []
  let progress: any = null

  try {
    const token = await getToken({ template: 'supabase' })
    if (token) {
      const supabase = createAuthClient(token)
      const results = await Promise.allSettled([
        supabase.from('scenarios').select('*').eq('is_active', true).order('unlock_level').limit(20),
        supabase.from('user_skills').select('*, skill:competency_skills(*)').eq('user_id', userId),
        supabase.from('user_progress').select('*').eq('user_id', userId).single(),
      ])
      if (results[0].status === 'fulfilled') scenarios = results[0].value.data ?? []
      if (results[1].status === 'fulfilled') userSkills = results[1].value.data ?? []
      if (results[2].status === 'fulfilled') progress = results[2].value.data
    }
  } catch (e) {
    console.warn('Journey data fetch failed:', e)
  }

  const level = progress?.level ?? 1
  const scenariosMastered = progress?.scenarios_mastered ?? 0
  const totalScenarios = progress?.total_scenarios_available ?? scenarios.length
  const journeyPercent = totalScenarios > 0 ? Math.round((scenariosMastered / totalScenarios) * 100) : 0

  // Recommend scenarios at or just above the user's current level
  const recommended = scenarios
    .filter(s => s.unlock_level <= level + 1)
    .slice(0, 2)

  // Locked scenarios
  const locked = scenarios.filter(s => s.unlock_level > level)

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Adaptive Competency Journey</h1>
        <p className="text-muted-foreground">
          Your personalized learning path based on your current skills and competency gaps
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Overall Journey Progress</h2>
              <span className="text-2xl font-bold text-primary">{journeyPercent}%</span>
            </div>
            <Progress value={journeyPercent} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {scenariosMastered} of {totalScenarios} scenarios mastered
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-warning" size={20} />
            Recommended For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommended.map((scenario: any) => (
              <Card key={scenario.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">{scenario.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {scenario.category?.replace(/_/g, ' ')} · Difficulty {scenario.difficulty}/5
                      </p>
                    </div>
                    <Badge className="whitespace-nowrap">+{scenario.xp_reward} XP</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/simulator/${scenario.id}`}>
                      Start Learning
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {userSkills.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="text-accent" size={20} />
            Your Competency Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSkills.map((skill: any) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="text-muted-foreground" size={20} />
            Locked Content
          </h2>
          <Card className="opacity-60">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <p className="text-sm font-medium">{locked.length} scenarios unlocking as you advance</p>
                <p className="text-xs text-muted-foreground">
                  Keep completing scenarios to level up and unlock more content
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-xs">Current Level: {level}</span>
                  <span className="text-xs text-muted-foreground">/</span>
                  <span className="text-xs text-primary font-medium">
                    Next unlock at Level {locked[0]?.unlock_level}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="text-success" size={20} />
            Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            ['Complete 5–10 scenarios per week', 'Consistency builds competency faster'],
            ['Use Reflective Practice after each session', 'Consolidate learning through reflection'],
            ['Focus on weak areas first', 'The system recommends scenarios for your gaps'],
          ].map(([title, desc], i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold shrink-0">{i + 1}</div>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
