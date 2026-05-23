import { auth } from '@clerk/nextjs/server'
import { createAuthClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { differenceInCalendarDays } from 'date-fns'

export async function POST(request: Request) {
  const { userId, getToken } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getToken({ template: 'supabase' })
  const supabase = createAuthClient(token!)

  const { data: prog } = await supabase
    .from('user_progress')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('user_id', userId)
    .maybeSingle()

  const today = new Date()
  const lastActivity = prog?.last_activity_date ? new Date(prog.last_activity_date) : null
  const daysDiff = lastActivity ? differenceInCalendarDays(today, lastActivity) : 99

  let newStreak = prog?.current_streak ?? 0
  if (daysDiff === 1)    newStreak += 1      // consecutive day
  else if (daysDiff > 1) newStreak = 1       // missed a day — reset
  // daysDiff === 0: already trained today, no change

  const newLongest = Math.max(newStreak, prog?.longest_streak ?? 0)

  if (daysDiff !== 0) {
    await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today.toISOString().split('T')[0],
      },
      { onConflict: 'user_id' }
    )
  }

  return NextResponse.json({ streak: newStreak, longest: newLongest })
}
