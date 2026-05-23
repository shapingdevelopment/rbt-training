'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { XpBar } from '@/components/gamification/xp-bar'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  totalXp: number
}

export function DashboardHeader({ title, subtitle, totalXp }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        
        <div className="flex-1 max-w-md mx-4">
          <XpBar totalXp={totalXp} size="sm" animated={false} />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search scenarios..." 
              className="pl-9 w-48 h-9 text-sm bg-secondary/50"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  )
}
