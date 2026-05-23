'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { UserSkill } from '@/lib/types'
import { 
  Star, 
  Clipboard, 
  Hand, 
  TrendingDown, 
  MessageCircle, 
  AlertTriangle,
  CheckCircle,
  Lock
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  star: Star,
  clipboard: Clipboard,
  hand: Hand,
  'trending-down': TrendingDown,
  'message-circle': MessageCircle,
  'alert-triangle': AlertTriangle
}

interface SkillCardProps {
  skill: UserSkill
  onClick?: () => void
  className?: string
}

export function SkillCard({ skill, onClick, className }: SkillCardProps) {
  const Icon = skill.skill?.icon ? iconMap[skill.skill.icon] || Star : Star
  const masteryPercent = Math.round(skill.mastery_score * 100)
  const isCertified = !!skill.certified_at
  const isWeakArea = skill.is_weak_area
  const isLocked = skill.current_level === 0 && skill.xp_in_skill === 0
  
  return (
    <Card 
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg',
        isWeakArea && 'border-destructive/50',
        isCertified && 'border-success/50',
        isLocked && 'opacity-60',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            'p-2 rounded-lg',
            isWeakArea ? 'bg-destructive/10' : isCertified ? 'bg-success/10' : 'bg-primary/10'
          )}>
            <Icon 
              className={cn(
                isWeakArea ? 'text-destructive' : isCertified ? 'text-success' : 'text-primary'
              )} 
              size={20} 
            />
          </div>
          
          <div className="flex items-center gap-1">
            {isCertified && (
              <CheckCircle className="text-success" size={16} />
            )}
            {isLocked && (
              <Lock className="text-muted-foreground" size={16} />
            )}
          </div>
        </div>
        
        <h4 className="font-semibold text-sm mb-1">{skill.skill?.name || 'Unknown Skill'}</h4>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Level {skill.current_level}/{skill.skill?.max_level || 5}</span>
          <span className={cn(
            'text-xs font-medium',
            masteryPercent >= 70 ? 'text-success' : masteryPercent >= 50 ? 'text-warning' : 'text-destructive'
          )}>
            {masteryPercent}% Mastery
          </span>
        </div>
        
        {/* Level progress bar */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all',
              isWeakArea ? 'bg-destructive' : isCertified ? 'bg-success' : 'bg-primary'
            )}
            style={{ width: `${(skill.current_level / (skill.skill?.max_level || 5)) * 100}%` }}
          />
        </div>
        
        {skill.remediation_count > 0 && (
          <div className="mt-2 text-xs text-warning">
            {skill.remediation_count} remediation{skill.remediation_count > 1 ? 's' : ''} assigned
          </div>
        )}
      </CardContent>
    </Card>
  )
}
