'use client'

import { cn } from '@/lib/utils'
import { xpToNextLevel } from '@/lib/types'

interface XpBarProps {
  totalXp: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

export function XpBar({ totalXp, showLabel = true, size = 'md', className, animated = true }: XpBarProps) {
  const { current, required, percentage } = xpToNextLevel(totalXp)
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }
  
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">XP Progress</span>
          <span className="text-xs font-semibold text-primary">
            {current.toLocaleString()} / {required.toLocaleString()}
          </span>
        </div>
      )}
      <div className={cn('w-full bg-secondary rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500',
            animated && 'animate-pulse-glow'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
