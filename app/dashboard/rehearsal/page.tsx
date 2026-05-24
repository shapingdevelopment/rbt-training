import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { ScenarioCard } from '@/components/scenarios/scenario-card'
import { Lightbulb } from 'lucide-react'

export default async function RehearsalPage() {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/sign-in')

  let scenarios: any[] = []
  let level = 1

  try {
    const token = await getToken({ template: 'supabase' })
    if (token) {
      const supabase = createAuthClient(token)
      const [scenariosRes, progressRes] = await Promise.allSettled([
        supabase.from('scenarios').select('*').eq('is_active', true).in('module', ['rehearsal', 'simulator']).order('difficulty').limit(12),
        supabase.from('user_progress').select('level').eq('user_id', userId).single(),
      ])
      if (scenariosRes.status === 'fulfilled') scenarios = scenariosRes.value.data ?? []
      if (progressRes.status === 'fulfilled') level = progressRes.value.data?.level ?? 1
    }
  } catch (e) {
    console.warn('Rehearsal data fetch failed:', e)
  }

  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Guided Rehearsal</h1>
        <p className="text-muted-foreground">
          Practice scenarios with scaffolded support and real-time feedback
        </p>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Lightbulb className="text-primary" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">What is Guided Rehearsal?</h2>
              <p className="text-muted-foreground">
                Practice scenarios with scaffolded prompts that gradually fade as your
                confidence grows. Perfect for building fluency before real sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Rehearsals</h2>
        {scenarios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario: any) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                userLevel={level}
                isCompleted={false}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No rehearsal scenarios available yet. Check back soon.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
