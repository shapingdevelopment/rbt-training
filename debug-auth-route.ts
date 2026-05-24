import { auth, currentUser } from '@clerk/nextjs/server'
import { createAuthClient, supabaseAdmin } from '@/lib/supabase'

// DELETE THIS FILE AFTER DEBUGGING — never leave debug routes in production

export async function GET() {
  const { userId, getToken } = await auth()

  if (!userId) {
    return Response.json({ error: 'Not signed in' }, { status: 401 })
  }

  const clerkUser = await currentUser()
  const results: Record<string, unknown> = {
    userId,
    clerkEmail: clerkUser?.emailAddresses[0]?.emailAddress,
    clerkName: clerkUser?.fullName,
  }

  // Step 1: can we get a Supabase JWT from Clerk?
  let token: string | null = null
  try {
    token = await getToken({ template: 'supabase' })
    results.clerkTokenObtained = !!token
    if (token) {
      // Decode the JWT payload (middle segment) without verifying
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      )
      results.jwtPayload = payload
    } else {
      results.clerkTokenError = 'getToken returned null — JWT template "supabase" not found in Clerk'
    }
  } catch (e: any) {
    results.clerkTokenError = e.message
  }

  // Step 2: if we have a token, can Supabase read auth.jwt()?
  if (token) {
    try {
      const supabase = createAuthClient(token)
      const { data: jwtData, error: jwtError } = await supabase
        .rpc('get_my_jwt')
        .single()

      // get_my_jwt may not exist — try a raw query instead
      if (jwtError?.code === 'PGRST202') {
        // Function doesn't exist, try profiles directly
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('clerk_id', userId)
          .maybeSingle()

        results.supabaseProfileFetch = profile ?? null
        results.supabaseProfileError = profileError?.message ?? null
      } else {
        results.supabaseJwt = jwtData
        results.supabaseJwtError = jwtError?.message ?? null
      }
    } catch (e: any) {
      results.supabaseError = e.message
    }
  }

  // Step 3: try admin client (bypasses RLS) to see if profile exists at all
  try {
    const { data: adminProfile, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle()

    results.adminProfileExists = !!adminProfile
    results.adminProfile = adminProfile
    results.adminError = adminError?.message ?? null
  } catch (e: any) {
    results.adminError = e.message
  }

  // Step 4: try admin insert if profile doesn't exist
  if (!results.adminProfileExists) {
    try {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          clerk_id: userId,
          email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
          full_name: clerkUser?.fullName ?? null,
          role: (clerkUser?.publicMetadata?.role as string) ?? 'rbt',
          total_training_minutes: 0,
          target_training_hours: 40,
        })
        .select('*')
        .single()

      results.adminInsertResult = inserted
      results.adminInsertError = insertError?.message ?? null
    } catch (e: any) {
      results.adminInsertError = e.message
    }
  }

  return Response.json(results, { status: 200 })
}
