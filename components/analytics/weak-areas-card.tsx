'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserSkill } from '@/lib/types'
import { AlertTriangle } from 'lucide-react'

interface WeakAreasCardProps {
  skills: UserSkill[]
  className?: string
}

export function WeakAreasCard({ skills, className }: WeakAreasCardProps) {
  const weakSkills = skills.filter(s => s.is_weak_area)
  
  if (weakSkills.length === 0) {
    return (
      <Card className={cn('border-success/30', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-success">
            <div className="p-2 rounded-full bg-success/10">
              <AlertTriangle size={20} className="rotate-180" />
            </div>
            <div>
              <h4 className="font-medium">No Weak Areas</h4>
              <p className="text-xs text-muted-foreground">All skills are above threshold</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={cn('border-destructive/30', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-destructive" size={18} />
          <CardTitle className="text-base">Weak Areas ({weakSkills.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {weakSkills.map((skill) => {
            const masteryPercent = Math.round(skill.mastery_score * 100)
            return (
              <div key={skill.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill.skill?.name}</span>
                  <span className="text-xs text-destructive font-medium">
                    {masteryPercent}% mastery
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full"
                    style={{ width: `${masteryPercent}%` }}
                  />
                </div>
                {skill.remediation_count > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {skill.remediation_count} remediation{skill.remediation_count > 1 ? 's' : ''} assigned
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
