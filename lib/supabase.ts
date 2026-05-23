import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — passes Clerk JWT so RLS policies work
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Clerk-authenticated client — call this in server components / route handlers
export function createAuthClient(clerkToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${clerkToken}` },
    },
  })
}

// Admin client — bypasses RLS (server only, never expose to browser)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
