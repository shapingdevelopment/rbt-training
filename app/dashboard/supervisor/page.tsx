import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SupervisorClientPage from '@/app/demo/supervisor/page'

// This server component guards the route then renders the same supervisor UI
export default async function SupervisorPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const role = user?.publicMetadata?.role as string
  if (role !== 'supervisor' && role !== 'admin') redirect('/dashboard')

  // The client component fetches its own data via /api/supervisor/team
  return <SupervisorClientPage />
}
