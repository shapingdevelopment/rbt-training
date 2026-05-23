import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardOverview } from '@/components/dashboard/overview'
import { 
  mockProfile, 
  mockUserProgress, 
  mockUserSkills, 
  mockModuleProgress,
  mockRecentSessions,
  mockScenarios,
  mockUserAchievements,
  mockAchievements
} from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader 
        title="Welcome back, Alex" 
        subtitle="Continue your learning journey"
        totalXp={mockUserProgress.total_xp}
      />
      <DashboardOverview
        profile={mockProfile}
        progress={mockUserProgress}
        skills={mockUserSkills}
        moduleProgress={mockModuleProgress}
        recentSessions={mockRecentSessions}
        scenarios={mockScenarios}
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
      />
    </>
  )
}
