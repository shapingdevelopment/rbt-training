import { auth } from '@clerk/nextjs/server'
import { createAuthClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { userId, getToken } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const {
    sessionId,
    competencyData,   // { domain, score, strengths[], improvement_areas[] }
    completed,
    dropOffPoint,
    durationMinutes,
    conversationHistory,
    xpEarned,
    masteryScore,
  } = await request.json()

  const token = await getToken({ template: 'supabase' })
  const supabase = createAuthClient(token!)

  // 1. Close the session
  const { error: sessionError } = await supabase
    .from('scenario_sessions')
    .update({
      status: completed ? 'completed' : 'abandoned',
      completed_at: completed ? new Date().toISOString() : null,
      duration_minutes: durationMinutes ?? 0,
      drop_off_point: dropOffPoint ?? null,
      xp_earned: xpEarned ?? 0,
      mastery_score: masteryScore ?? null,
      ai_feedback: competencyData ?? null,
      conversation_history: conversationHistory ?? null,
    })
    .eq('id', sessionId)
    .eq('user_id', userId)

  if (sessionError) {
    console.error('Session end error:', sessionError)
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
  }

  // 2. Write competency score if available
  if (competencyData && completed) {
    await supabase.from('user_skills').upsert(
      {
        user_id: userId,
        skill_id: competencyData.domain,
        mastery_score: competencyData.score / 100,
        fluency_score: competencyData.score / 100,
        is_weak_area: competencyData.score < 70,
        last_practiced: new Date().toISOString(),
      },
      { onConflict: 'user_id,skill_id', ignoreDuplicates: false }
    )

    // 3. Auto-trigger remediation if score < 70
    if (competencyData.score < 70) {
      await supabase.from('remediation_assignments').insert({
        trainee_id: userId,
        skill_id: competencyData.domain,
        reason: `Auto-triggered: mastery score ${competencyData.score}% below threshold`,
        status: 'assigned',
        assigned_scenarios: [],
      })

      // Increment remediation count on user_skill
      await supabase.rpc('increment_remediation_count', {
        p_user_id: userId,
        p_skill_id: competencyData.domain,
      })
    }
  }

  // 4. Update module progress
  if (completed) {
    await supabase.rpc('update_module_progress', {
      p_user_id: userId,
      p_duration_minutes: durationMinutes ?? 0,
    })
  }

  // 5. Update engagement record for today
  await supabase.from('user_engagement').upsert(
    {
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      sessions_started: 1,
      sessions_completed: completed ? 1 : 0,
      sessions_abandoned: completed ? 0 : 1,
      time_spent_minutes: durationMinutes ?? 0,
      xp_earned: xpEarned ?? 0,
    },
    {
      onConflict: 'user_id,date',
      ignoreDuplicates: false,
    }
  )

  return NextResponse.json({ ok: true })
}
