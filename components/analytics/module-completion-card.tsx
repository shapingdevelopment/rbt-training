'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ModuleProgress, ModuleType } from '@/lib/types'
import { Lightbulb, GraduationCap, BookOpen, Target } from 'lucide-react'

const moduleIcons: Record<ModuleType, React.ComponentType<{ className?: string; size?: number }>> = {
  simulator: Lightbulb,
  rehearsal: GraduationCap,
  reflective: BookOpen,
  adaptive: Target
}

const moduleLabels: Record<ModuleType, string> = {
  simulator: 'AI Simulator',
  rehearsal: 'Guided Rehearsal',
  reflective: 'Reflective Practice',
  adaptive: 'Adaptive Journey'
}

interface ModuleCompletionCardProps {
  progress: ModuleProgress
  compact?: boolean
  className?: string
}

export function ModuleCompletionCard({ progress, compact = false, className }: ModuleCompletionCardProps) {
  const Icon = moduleIcons[progress.module]
  const label = moduleLabels[progress.module]
  const masteryPercent = Math.round(progress.average_mastery_score * 100)
  
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="text-primary" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium truncate">{label}</span>
            <span className="text-xs text-muted-foreground">
              {progress.scenarios_completed}/{progress.scenarios_total}
            </span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress.completion_percentage}%` }}
            />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="text-primary" size={20} />
            </div>
            <CardTitle className="text-base">{label}</CardTitle>
          </div>
          <span className="text-2xl font-bold text-primary">
            {Math.round(progress.completion_percentage)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Completion progress */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Scenarios Completed</span>
              <span>{progress.scenarios_completed} / {progress.scenarios_total}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                style={{ width: `${progress.completion_percentage}%` }}
              />
            </div>
          </div>
          
          {/* Mastery score */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Average Mastery</span>
              <span className={cn(
                masteryPercent >= 70 ? 'text-success' : masteryPercent >= 50 ? 'text-warning' : 'text-destructive'
              )}>
                {masteryPercent}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  masteryPercent >= 70 ? 'bg-success' : masteryPercent >= 50 ? 'bg-warning' : 'bg-destructive'
                )}
                style={{ width: `${masteryPercent}%` }}
              />
            </div>
          </div>
          
          {/* Time spent */}
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>Time Spent</span>
            <span>
              {Math.floor(progress.time_spent_minutes / 60)}h {progress.time_spent_minutes % 60}m
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
