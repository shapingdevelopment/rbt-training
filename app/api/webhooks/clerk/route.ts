import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return new Response('CLERK_WEBHOOK_SECRET not set', { status: 500 })
  }

  // Verify the webhook came from Clerk
  const headerPayload = await headers()
  const svix_id        = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: any
  try {
    const wh = new Webhook(WEBHOOK_SECRET)
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  const { type, data } = evt

  // ── user.created ─────────────────────────────────────────────
  if (type === 'user.created') {
    const userId    = data.id
    const email     = data.email_addresses?.[0]?.email_address ?? ''
    const firstName = data.first_name ?? ''
    const lastName  = data.last_name ?? ''
    const fullName  = [firstName, lastName].filter(Boolean).join(' ') || null
    const role      = (data.public_metadata?.role as string) ?? 'rbt'

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        clerk_id: userId,
        email,
        full_name: fullName,
        role,
        total_training_minutes: 0,
        target_training_hours: 40,
      }, { onConflict: 'clerk_id' })

    if (profileError) {
      console.error('Profile upsert error:', profileError.message)
      return new Response('Profile creation failed', { status: 500 })
    }

    // Create progress row
    const { error: progressError } = await supabaseAdmin
      .from('user_progress')
      .upsert({
        user_id: userId,
        total_xp: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0,
        sessions_completed: 0,
        sessions_abandoned: 0,
      }, { onConflict: 'user_id' })

    if (progressError) {
      console.error('Progress upsert error:', progressError.message)
    }

    console.log(`✓ Profile created for ${email} (${userId})`)
  }

  // ── user.updated ─────────────────────────────────────────────
  if (type === 'user.updated') {
    const userId    = data.id
    const email     = data.email_addresses?.[0]?.email_address ?? ''
    const firstName = data.first_name ?? ''
    const lastName  = data.last_name ?? ''
    const fullName  = [firstName, lastName].filter(Boolean).join(' ') || null

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ email, full_name: fullName })
      .eq('clerk_id', userId)

    if (error) console.error('Profile update error:', error.message)
  }

  // ── user.deleted ─────────────────────────────────────────────
  if (type === 'user.deleted') {
    const userId = data.id
    await supabaseAdmin.from('profiles').delete().eq('clerk_id', userId)
    await supabaseAdmin.from('user_progress').delete().eq('user_id', userId)
    console.log(`✓ Profile deleted for ${userId}`)
  }

  return new Response('OK', { status: 200 })
}
