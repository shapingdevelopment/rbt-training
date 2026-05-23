'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Scenario } from '@/lib/types'
import { Lock, Play, Star } from 'lucide-react'

interface ScenarioCardProps {
  scenario: Scenario
  userLevel: number
  isCompleted?: boolean
  masteryScore?: number
  onClick?: () => void
  className?: string
}

export function ScenarioCard({ 
  scenario, 
  userLevel, 
  isCompleted = false,
  masteryScore,
  onClick,
  className 
}: ScenarioCardProps) {
  const isLocked = userLevel < scenario.unlock_level
  const difficultyStars = Array.from({ length: 5 }, (_, i) => i < scenario.difficulty)
  
  const categoryColors: Record<string, string> = {
    behavior_management: 'bg-orange-500/10 text-orange-500',
    teaching: 'bg-blue-500/10 text-blue-500',
    transitions: 'bg-purple-500/10 text-purple-500',
    crisis: 'bg-red-500/10 text-red-500',
    communication: 'bg-green-500/10 text-green-500',
    data_collection: 'bg-cyan-500/10 text-cyan-500',
  }
  
  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all',
        isLocked ? 'opacity-60' : 'hover:border-primary/50 cursor-pointer',
        isCompleted && 'border-success/30',
        className
      )}
      onClick={!isLocked ? onClick : undefined}
    >
      <CardContent className="p-4">
        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="mx-auto mb-2 text-muted-foreground" size={24} />
              <p className="text-sm text-muted-foreground">Unlock at Level {scenario.unlock_level}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-3">
          <Badge 
            variant="secondary" 
            className={cn('text-xs', categoryColors[scenario.category || ''] || 'bg-secondary')}
          >
            {scenario.category?.replace('_', ' ') || 'General'}
          </Badge>
          
          <div className="flex items-center gap-0.5">
            {difficultyStars.map((filled, i) => (
              <Star 
                key={i} 
                size={12} 
                className={filled ? 'text-warning fill-warning' : 'text-muted-foreground/30'} 
              />
            ))}
          </div>
        </div>
        
        <h3 className="font-semibold mb-1">{scenario.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {scenario.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-primary">+{scenario.xp_reward} XP</span>
            {isCompleted && masteryScore !== undefined && (
              <span className="text-xs text-success">
                {Math.round(masteryScore * 100)}% mastery
              </span>
            )}
          </div>
          
          {!isLocked && (
            <Button size="sm" variant={isCompleted ? 'outline' : 'default'} className="gap-1">
              <Play size={14} />
              {isCompleted ? 'Replay' : 'Start'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
