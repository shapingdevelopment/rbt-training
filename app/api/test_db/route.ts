import { getAdminClient } from '@/lib/supabase'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const results: Record<string, any> = {
    url_set: !!url,
    url_value: url?.slice(0, 40),
    service_key_set: !!serviceKey,
    service_key_starts: serviceKey?.slice(0, 20),
    anon_key_set: !!anonKey,
  }

  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .insert({
        clerk_id: 'test-vercel-' + Date.now(),
        email: 'vercel-test@test.com',
        full_name: 'Vercel Test',
        role: 'rbt',
        total_training_minutes: 0,
        target_training_hours: 40,
      })
      .select()
      .single()

    results.insert_data = data
    results.insert_error = error?.message ?? null
    results.insert_code = error?.code ?? null
  } catch (e: any) {
    results.insert_exception = e.message
  }

  return Response.json(results)
}
