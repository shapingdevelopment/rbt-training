'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showLabel?: boolean
  className?: string
}

export function LevelBadge({ level, size = 'md', showLabel = true, className }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl'
  }
  
  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22
  }
  
  // Determine badge color based on level tier
  const getTierColor = () => {
    if (level >= 50) return 'from-amber-400 to-amber-600 border-amber-500' // Legendary
    if (level >= 30) return 'from-purple-400 to-purple-600 border-purple-500' // Epic
    if (level >= 15) return 'from-blue-400 to-blue-600 border-blue-500' // Rare
    if (level >= 5) return 'from-emerald-400 to-emerald-600 border-emerald-500' // Uncommon
    return 'from-slate-400 to-slate-600 border-slate-500' // Common
  }
  
  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div 
        className={cn(
          'relative flex items-center justify-center rounded-full bg-gradient-to-br border-2 font-bold text-white shadow-lg',
          sizeClasses[size],
          getTierColor()
        )}
      >
        <Star className="absolute opacity-20" size={iconSizes[size] * 2} />
        <span className="relative z-10">{level}</span>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">Level</span>
      )}
    </div>
  )
}
