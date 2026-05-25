import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase'
import { DashboardHeader } from '@/components/dashboard/header'
import { SimulatorHub } from '@/components/simulator/simulator-hub'
import type { Scenario, UserProgress } from '@/lib/types'

export default async function SimulatorPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  let scenarios: Scenario[] = []
  let progress: UserProgress | null = null

  try {
    const admin = getAdminClient()
    const [scenariosRes, progressRes] = await Promise.allSettled([
      admin.from('scenarios').select('*').eq('is_active', true).order('unlock_level'),
      admin.from('user_progress').select('*').eq('user_id', userId).single(),
    ])
    if (scenariosRes.status === 'fulfilled') scenarios = scenariosRes.value.data ?? []
    if (progressRes.status === 'fulfilled') progress = progressRes.value.data
  } catch (e) {
    console.warn('Simulator data fetch failed:', e)
  }

  return (
    <>
      <DashboardHeader
        title="AI Clinical Simulator"
        subtitle="Practice with realistic AI clients"
        totalXp={progress?.total_xp ?? 0}
      />
      <SimulatorHub
        scenarios={scenarios.filter(s => s.module === 'simulator')}
        userLevel={progress?.level ?? 1}
      />
    </>
  )
}
