'use client'

import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { formatHoursProgress } from '@/lib/types'

interface TrainingHoursProgressProps {
  totalMinutes: number
  targetHours: number
  showDetails?: boolean
  className?: string
}

export function TrainingHoursProgress({ 
  totalMinutes, 
  targetHours, 
  showDetails = true,
  className 
}: TrainingHoursProgressProps) {
  const { hours, percentage } = formatHoursProgress(totalMinutes, targetHours)
  const isComplete = percentage >= 100
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'w-5 h-5',
            isComplete ? 'text-success' : 'text-primary'
          )} />
          <span className="font-medium">Training Hours</span>
        </div>
        <span className={cn(
          'text-sm font-semibold',
          isComplete ? 'text-success' : 'text-foreground'
        )}>
          {hours}h / {targetHours}h
        </span>
      </div>
      
      <div className="relative">
        <div className="h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isComplete 
                ? 'bg-gradient-to-r from-success to-emerald-400' 
                : 'bg-gradient-to-r from-primary to-accent'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {/* Milestone markers */}
        <div className="absolute inset-0 flex justify-between px-1">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className="relative"
              style={{ left: `${milestone}%` }}
            >
              <div className={cn(
                'w-0.5 h-4',
                percentage >= milestone ? 'bg-background/30' : 'bg-muted-foreground/30'
              )} />
            </div>
          ))}
        </div>
      </div>
      
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percentage.toFixed(1)}% Complete</span>
          <span>
            {isComplete 
              ? 'Requirement met!' 
              : `${(targetHours - hours).toFixed(1)}h remaining`
            }
          </span>
        </div>
      )}
    </div>
  )
}
