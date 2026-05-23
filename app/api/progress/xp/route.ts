import { auth } from '@clerk/nextjs/server'
import { createAuthClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { calculateLevel } from '@/lib/types'

export async function POST(request: Request) {
  const { userId, getToken } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { xpEarned, source, sourceId, description } = await request.json()
  const token = await getToken({ template: 'supabase' })
  const supabase = createAuthClient(token!)

  // Fetch current progress
  const { data: current } = await supabase
    .from('user_progress')
    .select('total_xp, level, sessions_completed')
    .eq('user_id', userId)
    .maybeSingle()

  const newXP = (current?.total_xp ?? 0) + (xpEarned ?? 0)
  const newLevel = calculateLevel(newXP)
  const levelUp = newLevel > (current?.level ?? 1)

  // Upsert progress
  await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      total_xp: newXP,
      level: newLevel,
      sessions_completed: (current?.sessions_completed ?? 0) + 1,
    },
    { onConflict: 'user_id' }
  )

  // Record XP transaction
  await supabase.from('xp_transactions').insert({
    user_id: userId,
    amount: xpEarned,
    source: source ?? 'session',
    source_id: sourceId ?? null,
    description: description ?? null,
  })

  return NextResponse.json({ newXP, newLevel, levelUp })
}
