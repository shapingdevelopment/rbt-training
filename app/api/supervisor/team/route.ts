import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  const user = await currentUser()
  const role = user?.publicMetadata?.role as string

  if (!userId || (role !== 'supervisor' && role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    { data: teamSummary },
    { data: gapReport },
    { data: dropOff },
    { data: remediations },
  ] = await Promise.all([
    supabaseAdmin
      .from('rbt_dashboard_summary')
      .select('*'),
    supabaseAdmin
      .from('competency_gap_report')
      .select('*')
      .order('avg_gap', { ascending: false }),
    supabaseAdmin
      .from('drop_off_analysis')
      .select('*'),
    supabaseAdmin
      .from('remediation_assignments')
      .select('*, skill:competency_skills(*)')
      .eq('status', 'assigned')
      .order('assigned_at', { ascending: false }),
  ])

  return NextResponse.json({ teamSummary, gapReport, dropOff, remediations })
}
