'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Lightbulb,
  GraduationCap,
  Target,
  BookOpen,
  User,
  BarChart3,
  LogOut,
  ShieldCheck,
  Menu,
  X,
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
  { href: '/dashboard',           label: 'Dashboard',           icon: LayoutDashboard },
  { href: '/dashboard/simulator', label: 'AI Simulator',        icon: Lightbulb },
  { href: '/dashboard/rehearsal', label: 'Guided Rehearsal',    icon: GraduationCap },
  { href: '/dashboard/journey',   label: 'Adaptive Journey',    icon: Target },
  { href: '/dashboard/reflect',   label: 'Reflective Practice', icon: BookOpen },
  { href: '/dashboard/progress',  label: 'My Progress',         icon: BarChart3 },
  { href: '/dashboard/profile',   label: 'Profile',             icon: User },
]

const supervisorNavItems = [
  { href: '/dashboard',            label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/dashboard/supervisor', label: 'Supervisor View', icon: ShieldCheck },
  { href: '/dashboard/simulator',  label: 'AI Simulator',   icon: Lightbulb },
  { href: '/dashboard/progress',   label: 'My Progress',    icon: BarChart3 },
  { href: '/dashboard/profile',    label: 'Profile',        icon: User },
]

function NavContent({
  user,
  progress,
  navItems,
  pathname,
  onNavClick,
}: {
  user: DashboardSidebarProps['user']
  progress: DashboardSidebarProps['progress']
  navItems: typeof rbtNavItems
  pathname: string
  onNavClick?: () => void
}) {
  const { signOut } = useClerk()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavClick}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">Clarity Learning Labs</span>
        </Link>
      </div>

      {/* User stats */}
      <div className="px-4 py-4 border-b border-sidebar-border shrink-0">
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
                  onClick={onNavClick}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
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
      <div className="px-4 py-4 border-t border-sidebar-border shrink-0">
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
    </div>
  )
}

export function DashboardSidebar({ user, progress }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems =
    user.role === 'supervisor' || user.role === 'admin'
      ? supervisorNavItems
      : rbtNavItems

  return (
    <>
      {/* ── Desktop sidebar (lg+) ─────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex-col">
        <NavContent
          user={user}
          progress={progress}
          navItems={navItems}
          pathname={pathname}
        />
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground">Clarity Learning Labs</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed left-0 top-0 z-50 h-full w-72 bg-sidebar shadow-xl flex flex-col">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <NavContent
              user={user}
              progress={progress}
              navItems={navItems}
              pathname={pathname}
              onNavClick={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}
    </>
  )
}
