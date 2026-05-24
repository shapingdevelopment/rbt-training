import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { type, data } = payload

    console.log('Webhook received:', type, data?.id)

    if (type === 'user.created' || type === 'user.updated') {
      const userId    = data.id
      const email     = data.email_addresses?.[0]?.email_address ?? ''
      const firstName = data.first_name ?? ''
      const lastName  = data.last_name ?? ''
      const fullName  = [firstName, lastName].filter(Boolean).join(' ') || null
      const role      = (data.public_metadata?.role as string) ?? 'rbt'

      console.log('Creating profile for:', userId, email)

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
        console.error('Profile error:', profileError)
        return new Response(JSON.stringify({ error: profileError.message }), { status: 500 })
      }

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
        console.error('Progress error:', progressError)
      }

      console.log('✓ Profile created for', email)
    }

    if (type === 'user.deleted') {
      await supabaseAdmin.from('profiles').delete().eq('clerk_id', data.id)
      await supabaseAdmin.from('user_progress').delete().eq('user_id', data.id)
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Error', { status: 500 })
  }
}
