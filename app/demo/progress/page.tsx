import { DashboardHeader } from '@/components/dashboard/header'
import { ProgressOverview } from '@/components/progress/progress-overview'
import { 
  mockProfile, 
  mockUserProgress, 
  mockUserSkills, 
  mockModuleProgress,
  mockEngagementData,
  mockUserAchievements,
  mockAchievements
} from '@/lib/mock-data'

export default function ProgressPage() {
  return (
    <>
      <DashboardHeader 
        title="My Progress" 
        subtitle="Track your learning journey"
        totalXp={mockUserProgress.total_xp}
      />
      <ProgressOverview
        profile={mockProfile}
        progress={mockUserProgress}
        skills={mockUserSkills}
        moduleProgress={mockModuleProgress}
        engagementData={mockEngagementData}
        achievements={mockAchievements}
        userAchievements={mockUserAchievements}
      />
    </>
  )
}
