'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockScenarios, mockUserSkills, mockUserProgress } from '@/lib/mock-data'
import { Zap, Target, TrendingUp, Lock } from 'lucide-react'
import Link from 'next/link'
import { SkillCard } from '@/components/gamification/skill-card'

export default function JourneyPage() {
  const skillAreas = mockUserSkills.slice(0, 4)
  
  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Adaptive Competency Journey</h1>
        <p className="text-muted-foreground">
          Your personalized learning path based on your current skills and competency gaps
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Overall Journey Progress</h2>
              <span className="text-2xl font-bold text-primary">45%</span>
            </div>
            <Progress value={45} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Complete competency modules to advance. You&apos;re doing great!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Next Steps */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="text-warning" size={20} />
          Recommended For You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockScenarios.slice(0, 2).map((scenario) => (
            <Card key={scenario.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{scenario.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Based on your weak areas</p>
                  </div>
                  <Badge className="whitespace-nowrap">+{scenario.xp_reward} XP</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
                <Button className="w-full" asChild>
                  <Link href={`/simulator/${scenario.id}`}>
                    Start Learning
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Skill Areas */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="text-accent" size={20} />
          Your Competency Areas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockUserSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>

      {/* Locked Content */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="text-muted-foreground" size={20} />
          Locked Content
        </h2>
        <Card className="opacity-60">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="text-sm font-medium">Advanced Scenarios</p>
              <p className="text-xs text-muted-foreground">
                Reach Level 10 to unlock advanced scenarios
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="text-xs">Current Level: {mockUserProgress.level}</span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-xs text-primary font-medium">Level 10</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="text-success" size={20} />
            Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">1</div>
            <div>
              <p className="font-medium">Complete 5-10 scenarios per week</p>
              <p className="text-muted-foreground">Consistency builds competency faster</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">2</div>
            <div>
              <p className="font-medium">Use Reflective Practice after each session</p>
              <p className="text-muted-foreground">Consolidate learning through reflection</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">3</div>
            <div>
              <p className="font-medium">Focus on weak areas first</p>
              <p className="text-muted-foreground">The system recommends scenarios for your gaps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
