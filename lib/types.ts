// Database types for RBT Learning Platform

export type UserRole = 'rbt' | 'supervisor' | 'admin'
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'
export type AssessmentStatus = 'pending' | 'approved' | 'needs_improvement' | 'rejected'
export type ModuleType = 'simulator' | 'rehearsal' | 'reflective' | 'adaptive'
export type RemediationStatus = 'assigned' | 'in_progress' | 'completed'

export interface Profile {
  id: string
  clerk_id: string
  email: string
  full_name: string | null
  role: UserRole
  supervisor_id: string | null
  total_training_minutes: number
  target_training_hours: number
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  sessions_completed: number
  sessions_abandoned: number
  total_scenarios_available: number
  scenarios_mastered: number
  created_at: string
  updated_at: string
}

export interface CompetencySkill {
  id: string
  name: string
  description: string | null
  category: string | null
  max_level: number
  icon: string | null
  unlock_requirement_xp: number
  created_at: string
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  current_level: number
  xp_in_skill: number
  fluency_score: number
  mastery_score: number
  is_weak_area: boolean
  remediation_count: number
  last_remediation_at: string | null
  last_practiced: string | null
  certified_at: string | null
  certified_by: string | null
  skill?: CompetencySkill
}

export interface Scenario {
  id: string
  title: string
  description: string | null
  module: ModuleType
  category: string | null
  difficulty: number
  xp_reward: number
  skill_ids: string[]
  system_prompt: string
  initial_context: Record<string, unknown> | null
  unlock_level: number
  is_active: boolean
  created_at: string
}

export interface ScenarioSession {
  id: string
  user_id: string
  scenario_id: string
  started_at: string
  completed_at: string | null
  duration_minutes: number
  status: SessionStatus
  drop_off_point: string | null
  xp_earned: number
  mastery_score: number | null
  ai_feedback: Record<string, unknown> | null
  performance_metrics: Record<string, unknown> | null
  conversation_history: ChatMessage[] | null
  created_at: string
  scenario?: Scenario
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  coaching?: string
}

export interface ReflectiveEntry {
  id: string
  user_id: string
  session_date: string
  challenges: string | null
  decisions_made: string | null
  ai_analysis: Record<string, unknown> | null
  alternatives_identified: string[] | null
  rehearsal_notes: string | null
  xp_earned: number
  created_at: string
}

export interface Assessment {
  id: string
  trainee_id: string
  supervisor_id: string
  skill_id: string | null
  session_id: string | null
  status: AssessmentStatus
  score: number | null
  feedback: string | null
  certified: boolean
  assessed_at: string | null
  created_at: string
  trainee?: Profile
  skill?: CompetencySkill
  session?: ScenarioSession
}

export interface XpTransaction {
  id: string
  user_id: string
  amount: number
  source: string
  source_id: string | null
  description: string | null
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string | null
  icon: string | null
  xp_bonus: number
  requirement_type: string
  requirement_value: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface ModuleProgress {
  id: string
  user_id: string
  module: ModuleType
  scenarios_completed: number
  scenarios_total: number
  completion_percentage: number
  average_mastery_score: number
  time_spent_minutes: number
  last_activity_at: string | null
  created_at: string
  updated_at: string
}

export interface UserEngagement {
  id: string
  user_id: string
  date: string
  sessions_started: number
  sessions_completed: number
  sessions_abandoned: number
  time_spent_minutes: number
  xp_earned: number
  scenarios_attempted: string[]
  drop_off_points: Record<string, string> | null
}

export interface RemediationAssignment {
  id: string
  trainee_id: string
  supervisor_id: string | null
  skill_id: string | null
  reason: string | null
  assigned_scenarios: string[]
  status: RemediationStatus
  assigned_at: string
  completed_at: string | null
  skill?: CompetencySkill
}

// Gamification helpers
export const calculateLevel = (totalXp: number): number => {
  return Math.floor(1 + Math.sqrt(totalXp / 50))
}

export const xpForLevel = (level: number): number => {
  return Math.pow(level - 1, 2) * 50
}

export const xpToNextLevel = (totalXp: number): { current: number; required: number; percentage: number } => {
  const currentLevel = calculateLevel(totalXp)
  const currentLevelXp = xpForLevel(currentLevel)
  const nextLevelXp = xpForLevel(currentLevel + 1)
  const xpInCurrentLevel = totalXp - currentLevelXp
  const xpNeededForNext = nextLevelXp - currentLevelXp
  
  return {
    current: xpInCurrentLevel,
    required: xpNeededForNext,
    percentage: (xpInCurrentLevel / xpNeededForNext) * 100
  }
}

export const getStreakMultiplier = (streak: number): number => {
  return Math.min(1 + streak * 0.05, 2.0)
}

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  return `${hours}h ${mins}m`
}

export const formatHoursProgress = (minutes: number, targetHours: number): { hours: number; percentage: number } => {
  const hours = minutes / 60
  return {
    hours: Math.round(hours * 10) / 10,
    percentage: Math.min((hours / targetHours) * 100, 100)
  }
}
