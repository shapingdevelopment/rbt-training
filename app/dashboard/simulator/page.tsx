import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase'
import { DashboardHeader } from '@/components/dashboard/header'
import { SimulatorHub } from '@/components/simulator/simulator-hub'
import type { Scenario, UserProgress } from '@/lib/types'

export default async function SimulatorPage() {
  const { userId, getToken } = await auth()
  if (!userId) redirect('/sign-in')

  let scenarios: Scenario[] = []
  let progress: UserProgress | null = null

  try {
    const token = await getToken({ template: 'supabase' })
    if (token) {
      const supabase = createAuthClient(token)
      const [scenariosRes, progressRes] = await Promise.allSettled([
        supabase.from('scenarios').select('*').eq('is_active', true).order('unlock_level'),
        supabase.from('user_progress').select('*').eq('user_id', userId).single(),
      ])
      if (scenariosRes.status === 'fulfilled') scenarios = scenariosRes.value.data ?? []
      if (progressRes.status === 'fulfilled') progress = progressRes.value.data
    }
  } catch (e) {
    console.warn('Simulator data fetch failed:', e)
  }

  const xp = progress?.total_xp ?? 0
  const level = progress?.level ?? 1

  return (
    <>
      <DashboardHeader
        title="AI Clinical Simulator"
        subtitle="Practice with realistic AI clients"
        totalXp={xp}
      />
      <SimulatorHub
        scenarios={scenarios.filter(s => s.module === 'simulator')}
        userLevel={level}
      />
    </>
  )
}
