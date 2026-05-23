'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  UserEngagement,
  Achievement,
  UserAchievement
} from '@/lib/types'
import { 
  TrendingUp, 
  Calendar,
  Target,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

interface ProgressOverviewProps {
  profile: Profile
  progress: UserProgress
  skills: UserSkill[]
  moduleProgress: ModuleProgress[]
  engagementData: UserEngagement[]
  achievements: Achievement[]
  userAchievements: UserAchievement[]
}

export function ProgressOverview({
  profile,
  progress,
  skills,
  moduleProgress,
  engagementData,
  achievements,
  userAchievements
}: ProgressOverviewProps) {
  const completionRate = Math.round((progress.sessions_completed / (progress.sessions_completed + progress.sessions_abandoned)) * 100)
  const totalTimeHours = Math.round(profile.total_training_minutes / 60 * 10) / 10
  
  // Prepare chart data
  const xpChartData = engagementData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    xp: d.xp_earned,
    sessions: d.sessions_completed
  }))
  
  const sessionChartData = engagementData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    completed: d.sessions_completed,
    abandoned: d.sessions_abandoned,
    minutes: d.time_spent_minutes
  }))
  
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
        
        {/* Total Time Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalTimeHours}h</div>
                <div className="text-xs text-muted-foreground">Total Training Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Training Hours Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">40-Hour Certification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingHoursProgress 
            totalMinutes={profile.total_training_minutes}
            targetHours={profile.target_training_hours}
          />
        </CardContent>
      </Card>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* XP Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="text-primary" size={18} />
                XP Earned (Last 14 Days)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={xpChartData}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#xpGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Sessions Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="text-primary" size={18} />
                Session Activity
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="completed" fill="hsl(var(--success))" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="abandoned" fill="hsl(var(--destructive))" name="Abandoned" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Module Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="text-primary" size={18} />
            Module Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {moduleProgress.map((mp) => (
              <ModuleCompletionCard key={mp.id} progress={mp} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Skills and Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Competency Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skills.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <WeakAreasCard skills={skills} />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-success">{progress.sessions_completed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Abandoned</span>
                  <span className="font-medium text-destructive">{progress.sessions_abandoned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mastered</span>
                  <span className="font-medium text-primary">{progress.scenarios_mastered}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((achievement) => {
              const earned = userAchievements.find(ua => ua.achievement_id === achievement.id)
              return (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  earned={earned}
                  size="md"
                />
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
