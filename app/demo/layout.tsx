import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { mockProfile, mockUserProgress } from '@/lib/mock-data'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In production, fetch from Clerk and database
  const user = {
    name: mockProfile.full_name || 'RBT User',
    email: mockProfile.email,
    role: mockProfile.role
  }
  
  const progress = {
    level: mockUserProgress.level,
    streak: mockUserProgress.current_streak,
    longestStreak: mockUserProgress.longest_streak
  }
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} progress={progress} />
      <main className="pl-64">
        {children}
      </main>
    </div>
  )
}
