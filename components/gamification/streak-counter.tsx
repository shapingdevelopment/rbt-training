'use client'

import { cn } from '@/lib/utils'
import { Flame } from 'lucide-react'
import { getStreakMultiplier } from '@/lib/types'

interface StreakCounterProps {
  streak: number
  longestStreak?: number
  showMultiplier?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StreakCounter({ 
  streak, 
  longestStreak, 
  showMultiplier = true, 
  size = 'md',
  className 
}: StreakCounterProps) {
  const multiplier = getStreakMultiplier(streak)
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }
  
  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 36
  }
  
  const isActive = streak > 0
  
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="flex items-center gap-2">
        <Flame 
          className={cn(
            'transition-all',
            isActive ? 'text-streak animate-streak-flame' : 'text-muted-foreground'
          )}
          size={iconSizes[size]}
          fill={isActive ? 'currentColor' : 'none'}
        />
        <span className={cn('font-bold', sizeClasses[size], isActive ? 'text-foreground' : 'text-muted-foreground')}>
          {streak}
        </span>
      </div>
      
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">Day Streak</span>
        
        {showMultiplier && streak > 0 && (
          <span className="text-xs font-semibold text-streak">
            {multiplier.toFixed(2)}x XP Bonus
          </span>
        )}
        
        {longestStreak !== undefined && longestStreak > streak && (
          <span className="text-xs text-muted-foreground">
            Best: {longestStreak} days
          </span>
        )}
      </div>
    </div>
  )
}
