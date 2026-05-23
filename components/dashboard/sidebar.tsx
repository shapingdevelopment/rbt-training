'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Brain, 
  GraduationCap, 
  Target, 
  BookOpen, 
  User, 
  BarChart3,
  LogOut,
  ShieldCheck
} from 'lucide-react'
import { LevelBadge } from '@/components/gamification/level-badge'
import { StreakCounter } from '@/components/gamification/streak-counter'
import { useClerk } from '@clerk/nextjs'

interface DashboardSidebarProps {
  user: {
    name: string
    email: string
    role: 'rbt' | 'supervisor' | 'admin'
  }
  progress: {
    level: number
    streak: number
    longestStreak: number
  }
}

const rbtNavItems = [
  { href: '/dashboard',            label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/demo/simulator',       label: 'AI Simulator',       icon: Brain },
  { href: '/demo/rehearsal',       label: 'Guided Rehearsal',   icon: GraduationCap },
  { href: '/demo/journey',         label: 'Adaptive Journey',   icon: Target },
  { href: '/demo/reflection',      label: 'Reflective Practice',icon: BookOpen },
  { href: '/demo/progress',        label: 'My Progress',        icon: BarChart3 },
  { href: '/demo/profile',         label: 'Profile',            icon: User },
]

const supervisorNavItems = [
  { href: '/dashboard',            label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/dashboard/supervisor', label: 'Supervisor View',    icon: ShieldCheck },
  { href: '/demo/simulator',       label: 'AI Simulator',       icon: Brain },
  { href: '/demo/progress',        label: 'My Progress',        icon: BarChart3 },
  { href: '/demo/profile',         label: 'Profile',            icon: User },
]

export function DashboardSidebar({ user, progress }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()

  const navItems = (user.role === 'supervisor' || user.role === 'admin')
    ? supervisorNavItems
    : rbtNavItems

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">Clarity Behavior Lab</span>
        </Link>
      </div>

      {/* User stats */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-4">
          <LevelBadge level={progress.level} size="md" showLabel={false} />
          <StreakCounter
            streak={progress.streak}
            longestStreak={progress.longestStreak}
            showMultiplier={false}
            size="sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User info + sign out */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="mb-2">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
          <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
        </div>
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="flex items-center gap-2 text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
