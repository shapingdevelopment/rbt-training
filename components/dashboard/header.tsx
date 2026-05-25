'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { XpBar } from '@/components/gamification/xp-bar'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  totalXp: number
}

export function DashboardHeader({ title, subtitle, totalXp }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-14 lg:top-0 z-30">
      {/* Main row — title + bell */}
      <div className="px-4 sm:px-6 pt-3 pb-1 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>
      </div>

      {/* XP bar — full width on its own row */}
      <div className="px-4 sm:px-6 pb-3">
        <XpBar totalXp={totalXp} size="sm" animated={false} />
      </div>
    </header>
  )
}
