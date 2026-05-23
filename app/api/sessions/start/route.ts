import { auth } from '@clerk/nextjs/server'
import { createAuthClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId, getToken } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { scenarioId, moduleId } = await request.json()
  const token = await getToken({ template: 'supabase' })
  const supabase = createAuthClient(token!)

  const { data, error } = await supabase
    .from('scenario_sessions')
    .insert({
      user_id: userId,
      scenario_id: scenarioId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      xp_earned: 0,
      duration_minutes: 0,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Session start error:', error)
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 })
  }

  return NextResponse.json({ sessionId: data.id })
}
