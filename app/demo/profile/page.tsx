'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockUserProgress, mockUserSkills, mockAchievements } from '@/lib/mock-data'
import { LevelBadge } from '@/components/gamification/level-badge'
import { AchievementCard } from '@/components/gamification/achievement-card'
import { SkillCard } from '@/components/gamification/skill-card'
import { Clock, Award, Target, TrendingUp } from 'lucide-react'

export default function ProfilePage() {
  const user = {
    name: 'Alex Johnson',
    role: 'Registered Behavior Technician',
    email: 'alex@example.com',
  }

  return (
    <main className="p-6 space-y-6">
      {/* User Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border border-border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-muted-foreground mb-4">{user.role}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="text-right">
            <LevelBadge level={mockUserProgress.level} />
            <p className="text-sm text-muted-foreground mt-1">{mockUserProgress.total_xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{mockUserProgress.total_xp.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Award className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{mockAchievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="text-warning" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Training Hours</p>
                <p className="text-2xl font-bold">{mockUserProgress.sessions_completed * 0.5}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <Target className="text-success" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockUserSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Achievements Unlocked</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </main>
  )
}
