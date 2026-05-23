'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { Achievement, UserAchievement } from '@/lib/types'
import { 
  Footprints, 
  Flame, 
  Award, 
  Zap, 
  BookOpen, 
  Crown,
  Lock
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  footprints: Footprints,
  flame: Flame,
  award: Award,
  zap: Zap,
  'book-open': BookOpen,
  crown: Crown
}

interface AchievementCardProps {
  achievement: Achievement
  earned?: UserAchievement
  size?: 'sm' | 'md'
  className?: string
}

export function AchievementCard({ achievement, earned, size = 'md', className }: AchievementCardProps) {
  const Icon = achievement.icon ? iconMap[achievement.icon] || Award : Award
  const isEarned = !!earned
  
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4'
  }
  
  const iconSizes = {
    sm: 20,
    md: 28
  }
  
  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all',
        isEarned 
          ? 'border-primary/50 bg-primary/5' 
          : 'opacity-50 grayscale',
        className
      )}
    >
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-full',
            isEarned ? 'bg-primary/10' : 'bg-muted'
          )}>
            {isEarned ? (
              <Icon className="text-primary" size={iconSizes[size]} />
            ) : (
              <Lock className="text-muted-foreground" size={iconSizes[size]} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'font-semibold truncate',
              size === 'sm' ? 'text-sm' : 'text-base'
            )}>
              {achievement.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {achievement.description}
            </p>
            {isEarned && earned && (
              <p className="text-xs text-primary mt-1">
                +{achievement.xp_bonus} XP
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
