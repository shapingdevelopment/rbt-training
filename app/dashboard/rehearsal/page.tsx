import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { ScenarioCard } from '@/components/scenarios/scenario-card'
import { Lightbulb } from 'lucide-react'
import Link from 'next/link'

export default async function RehearsalPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  let scenarios: any[] = []
  let level = 1

  try {
    const admin = getAdminClient()
    const [scenariosRes, progressRes] = await Promise.allSettled([
      admin.from('scenarios').select('*').eq('is_active', true).order('difficulty').limit(12),
      admin.from('user_progress').select('level').eq('user_id', userId).single(),
    ])
    if (scenariosRes.status === 'fulfilled') scenarios = scenariosRes.value.data ?? []
    if (progressRes.status === 'fulfilled') level = progressRes.value.data?.level ?? 1
  } catch (e) {
    console.warn('Rehearsal data fetch failed:', e)
  }

  return (
    <main className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Guided Rehearsal</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Practice scenarios with scaffolded support and real-time feedback
        </p>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20 shrink-0">
              <Lightbulb className="text-primary" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">What is Guided Rehearsal?</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Practice scenarios with scaffolded prompts that gradually fade as your
                confidence grows. Perfect for building fluency before real sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Available Scenarios</h2>
        {scenarios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario: any) => (
              <Link key={scenario.id} href={`/dashboard/simulator/${scenario.id}`}>
                <ScenarioCard
                  scenario={scenario}
                  userLevel={level}
                  isCompleted={false}
                />
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No scenarios available yet. Check back soon.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
