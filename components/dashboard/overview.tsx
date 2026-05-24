'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LevelBadge } from '@/components/gamification/level-badge'
import { StreakCounter } from '@/components/gamification/streak-counter'
import { XpBar } from '@/components/gamification/xp-bar'
import { SkillCard } from '@/components/gamification/skill-card'
import { AchievementCard } from '@/components/gamification/achievement-card'
import { TrainingHoursProgress } from '@/components/analytics/training-hours-progress'
import { ModuleCompletionCard } from '@/components/analytics/module-completion-card'
import { WeakAreasCard } from '@/components/analytics/weak-areas-card'
import type { 
  Profile, 
  UserProgress, 
  UserSkill, 
  ModuleProgress, 
  ScenarioSession,
  Scenario,
  Achievement,
  UserAchievement
} from '@/lib/types'
import { 
  ArrowRight, 
  Lightbulb, 
  GraduationCap, 
  Target, 
  BookOpen,
  Play,
  Clock,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardOverviewProps {
  profile: Profile
  progress: UserProgress
  skills: UserSkill[]
  moduleProgress: ModuleProgress[]
  recentSessions: ScenarioSession[]
  scenarios: Scenario[]
  achievements: Achievement[]
  userAchievements: UserAchievement[]
}

const moduleLinks = [
  { href: '/dashboard/simulator', label: 'AI Simulator', icon: Lightbulb, description: 'Practice with AI clients' },
  { href: '/dashboard/rehearsal', label: 'Guided Rehearsal', icon: GraduationCap, description: 'Scaffolded practice' },
  { href: '/dashboard/journey', label: 'Adaptive Journey', icon: Target, description: 'Personalized learning' },
  { href: '/dashboard/reflect', label: 'Reflective Practice', icon: BookOpen, description: 'Analyze your sessions' },
]

export function DashboardOverview({
  profile,
  progress,
  skills,
  moduleProgress,
  recentSessions,
  scenarios,
  achievements,
  userAchievements
}: DashboardOverviewProps) {
  const _total = (progress.sessions_completed || 0) + (progress.sessions_abandoned || 0)
  const completionRate = _total > 0 ? Math.round(((progress.sessions_completed || 0) / _total) * 100) : 0
  
  return (
    <div className="p-6 space-y-6">
      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Level & XP Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <LevelBadge level={progress.level} size="lg" showLabel={false} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Level {progress.level}</span>
                  <span className="text-xs text-muted-foreground">{progress.total_xp.toLocaleString()} XP</span>
                </div>
                <XpBar totalXp={progress.total_xp} showLabel={false} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Streak Card */}
        <Card>
          <CardContent className="p-4">
            <StreakCounter 
              streak={progress.current_streak} 
              longestStreak={progress.longest_streak}
              size="md"
            />
          </CardContent>
        </Card>
        
        {/* Completion Rate Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle className="text-success" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Sessions Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Play className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{progress.sessions_completed}</div>
                <div className="text-xs text-muted-foreground">Sessions Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Training Hours Progress */}
      <Card>
        <CardContent className="p-4">
          <TrainingHoursProgress 
            totalMinutes={profile.total_training_minutes}
            targetHours={profile.target_training_hours}
          />
        </CardContent>
      </Card>
      
      {/* Quick Actions - Module Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleLinks.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <module.icon className="text-primary" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{module.label}</h3>
                    <p className="text-xs text-muted-foreground">{module.description}</p>
                  </div>
                  <ArrowRight className="text-muted-foreground" size={16} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Module Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Module Progress Cards */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Module Progress</CardTitle>
                <Link href="/dashboard/progress">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moduleProgress.map((mp) => (
                  <ModuleCompletionCard key={mp.id} progress={mp} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Sessions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Sessions</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs">
                  View History <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.slice(0, 3).map((session) => (
                  <div 
                    key={session.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      session.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'
                    )}>
                      {session.status === 'completed' ? (
                        <CheckCircle className="text-success" size={18} />
                      ) : (
                        <Clock className="text-warning" size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {session.scenario?.title || 'Unknown Scenario'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {session.duration_minutes}min • {Math.round((session.mastery_score || 0) * 100)}% mastery
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-primary">+{session.xp_earned} XP</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.completed_at || session.started_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Skills & Achievements */}
        <div className="space-y-6">
          {/* Weak Areas Alert */}
          <WeakAreasCard skills={skills} />
          
          {/* Skills Grid */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Competency Skills</CardTitle>
                <Link href="/dashboard/journey">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {skills.slice(0, 4).map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Achievements */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Achievements</CardTitle>
                <Link href="/dashboard/profile">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All <ArrowRight size={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userAchievements.slice(0, 3).map((ua) => (
                  <AchievementCard 
                    key={ua.id} 
                    achievement={ua.achievement!} 
                    earned={ua}
                    size="sm"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
