import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase'
import { SimulatorSession } from '@/components/simulator/simulator-session'
import type { Scenario, UserProgress } from '@/lib/types'

interface Props {
  params: Promise<{ scenarioId: string }>
}

export default async function SimulatorSessionPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { scenarioId } = await params

  let scenario: Scenario | null = null
  let progress: UserProgress | null = null

  try {
    const admin = getAdminClient()
    const [scenarioRes, progressRes] = await Promise.allSettled([
      admin.from('scenarios').select('*').eq('id', scenarioId).single(),
      admin.from('user_progress').select('*').eq('user_id', userId).single(),
    ])
    if (scenarioRes.status === 'fulfilled') scenario = scenarioRes.value.data
    if (progressRes.status === 'fulfilled') progress = progressRes.value.data
  } catch (e) {
    console.warn('Session data fetch failed:', e)
  }

  if (!scenario) notFound()

  return (
    <SimulatorSession
      scenario={scenario}
      userLevel={progress?.level ?? 1}
      currentStreak={progress?.current_streak ?? 0}
    />
  )
}
