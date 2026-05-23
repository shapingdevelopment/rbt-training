// Mock data for development/demo purposes
import type { 
  Profile, 
  UserProgress, 
  CompetencySkill, 
  UserSkill, 
  Scenario, 
  ScenarioSession,
  Achievement,
  UserAchievement,
  ModuleProgress,
  UserEngagement
} from './types'

export const mockProfile: Profile = {
  id: '1',
  clerk_id: 'user_demo',
  email: 'demo@rbtlearn.com',
  full_name: 'Alex Johnson',
  role: 'rbt',
  supervisor_id: '2',
  total_training_minutes: 1847,
  target_training_hours: 40,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const mockUserProgress: UserProgress = {
  id: '1',
  user_id: '1',
  total_xp: 2750,
  level: 8,
  current_streak: 12,
  longest_streak: 21,
  last_activity_date: new Date().toISOString().split('T')[0],
  sessions_completed: 47,
  sessions_abandoned: 3,
  total_scenarios_available: 65,
  scenarios_mastered: 32,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

export const mockSkills: CompetencySkill[] = [
  {
    id: 'skill-1',
    name: 'Reinforcement',
    description: 'Applying positive and negative reinforcement techniques effectively',
    category: 'behavior_intervention',
    max_level: 5,
    icon: 'star',
    unlock_requirement_xp: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'skill-2',
    name: 'Data Collection',
    description: 'Accurately recording and analyzing behavioral data',
    category: 'data_collection',
    max_level: 5,
    icon: 'clipboard',
    unlock_requirement_xp: 100,
    created_at: new Date().toISOString()
  },
  {
    id: 'skill-3',
    name: 'Prompting',
    description: 'Using appropriate prompting hierarchies',
    category: 'teaching_strategies',
    max_level: 5,
    icon: 'hand',
    unlock_requirement_xp: 200,
    created_at: new Date().toISOString()
  },
  {
    id: 'skill-4',
    name: 'Behavior Reduction',
    description: 'Implementing behavior reduction procedures safely',
    category: 'behavior_intervention',
    max_level: 5,
    icon: 'trending-down',
    unlock_requirement_xp: 500,
    created_at: new Date().toISOString()
  },
  {
    id: 'skill-5',
    name: 'Communication',
    description: 'Effective communication with clients, families, and supervisors',
    category: 'professional_conduct',
    max_level: 5,
    icon: 'message-circle',
    unlock_requirement_xp: 300,
    created_at: new Date().toISOString()
  },
  {
    id: 'skill-6',
    name: 'Crisis Management',
    description: 'Responding appropriately to behavioral crises',
    category: 'behavior_intervention',
    max_level: 5,
    icon: 'alert-triangle',
    unlock_requirement_xp: 1000,
    created_at: new Date().toISOString()
  }
]

export const mockUserSkills: UserSkill[] = [
  {
    id: 'us-1',
    user_id: '1',
    skill_id: 'skill-1',
    current_level: 4,
    xp_in_skill: 420,
    fluency_score: 0.85,
    mastery_score: 0.82,
    is_weak_area: false,
    remediation_count: 0,
    last_remediation_at: null,
    last_practiced: new Date().toISOString(),
    certified_at: new Date().toISOString(),
    certified_by: '2',
    skill: mockSkills[0]
  },
  {
    id: 'us-2',
    user_id: '1',
    skill_id: 'skill-2',
    current_level: 3,
    xp_in_skill: 280,
    fluency_score: 0.72,
    mastery_score: 0.68,
    is_weak_area: false,
    remediation_count: 1,
    last_remediation_at: null,
    last_practiced: new Date().toISOString(),
    certified_at: null,
    certified_by: null,
    skill: mockSkills[1]
  },
  {
    id: 'us-3',
    user_id: '1',
    skill_id: 'skill-3',
    current_level: 4,
    xp_in_skill: 380,
    fluency_score: 0.88,
    mastery_score: 0.85,
    is_weak_area: false,
    remediation_count: 0,
    last_remediation_at: null,
    last_practiced: new Date().toISOString(),
    certified_at: new Date().toISOString(),
    certified_by: '2',
    skill: mockSkills[2]
  },
  {
    id: 'us-4',
    user_id: '1',
    skill_id: 'skill-4',
    current_level: 2,
    xp_in_skill: 150,
    fluency_score: 0.55,
    mastery_score: 0.52,
    is_weak_area: true,
    remediation_count: 2,
    last_remediation_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_practiced: new Date().toISOString(),
    certified_at: null,
    certified_by: null,
    skill: mockSkills[3]
  },
  {
    id: 'us-5',
    user_id: '1',
    skill_id: 'skill-5',
    current_level: 3,
    xp_in_skill: 320,
    fluency_score: 0.78,
    mastery_score: 0.75,
    is_weak_area: false,
    remediation_count: 0,
    last_remediation_at: null,
    last_practiced: new Date().toISOString(),
    certified_at: null,
    certified_by: null,
    skill: mockSkills[4]
  },
  {
    id: 'us-6',
    user_id: '1',
    skill_id: 'skill-6',
    current_level: 1,
    xp_in_skill: 80,
    fluency_score: 0.45,
    mastery_score: 0.40,
    is_weak_area: true,
    remediation_count: 1,
    last_remediation_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    last_practiced: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    certified_at: null,
    certified_by: null,
    skill: mockSkills[5]
  }
]

export const mockScenarios: Scenario[] = [
  {
    id: 'scenario-1',
    title: 'Handling Task Refusal',
    description: 'A client refuses to complete a required task. Practice appropriate responses and redirection techniques.',
    module: 'simulator',
    category: 'behavior_management',
    difficulty: 2,
    xp_reward: 75,
    skill_ids: ['skill-1', 'skill-3'],
    system_prompt: 'You are a 7-year-old client named Jamie...',
    initial_context: { clientAge: 7, setting: 'classroom', behavior: 'task_refusal' },
    unlock_level: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'scenario-2',
    title: 'Teaching a New Skill',
    description: 'Use discrete trial teaching to help a client learn to identify colors.',
    module: 'simulator',
    category: 'teaching',
    difficulty: 1,
    xp_reward: 50,
    skill_ids: ['skill-3', 'skill-2'],
    system_prompt: 'You are a 5-year-old client named Sam...',
    initial_context: { clientAge: 5, setting: 'therapy_room', skill: 'color_identification' },
    unlock_level: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'scenario-3',
    title: 'Managing Transitions',
    description: 'Help a client transition from a preferred to non-preferred activity.',
    module: 'simulator',
    category: 'transitions',
    difficulty: 2,
    xp_reward: 75,
    skill_ids: ['skill-1', 'skill-3'],
    system_prompt: 'You are a 6-year-old client named Riley...',
    initial_context: { clientAge: 6, setting: 'home', transition: 'tablet_to_homework' },
    unlock_level: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'scenario-4',
    title: 'Responding to Aggression',
    description: 'Practice de-escalation and safety protocols when a client displays aggressive behavior.',
    module: 'simulator',
    category: 'crisis',
    difficulty: 4,
    xp_reward: 150,
    skill_ids: ['skill-4', 'skill-6'],
    system_prompt: 'You are a 10-year-old client named Jordan...',
    initial_context: { clientAge: 10, setting: 'classroom', behavior: 'aggression' },
    unlock_level: 5,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'scenario-5',
    title: 'Parent Communication',
    description: 'Explain session progress and upcoming goals to a concerned parent.',
    module: 'simulator',
    category: 'communication',
    difficulty: 3,
    xp_reward: 100,
    skill_ids: ['skill-5'],
    system_prompt: 'You are a parent of a 6-year-old client...',
    initial_context: { relationship: 'parent', concern: 'progress_questions' },
    unlock_level: 3,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'scenario-6',
    title: 'Data Collection Practice',
    description: 'Practice frequency and duration data collection during a simulated session.',
    module: 'adaptive',
    category: 'data_collection',
    difficulty: 2,
    xp_reward: 75,
    skill_ids: ['skill-2'],
    system_prompt: 'Simulate a session where the RBT must collect data...',
    initial_context: { dataType: 'frequency', behavior: 'hand_raising' },
    unlock_level: 2,
    is_active: true,
    created_at: new Date().toISOString()
  }
]

export const mockAchievements: Achievement[] = [
  {
    id: 'ach-1',
    name: 'First Steps',
    description: 'Complete your first scenario',
    icon: 'footprints',
    xp_bonus: 25,
    requirement_type: 'scenarios_completed',
    requirement_value: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'ach-2',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    xp_bonus: 50,
    requirement_type: 'streak',
    requirement_value: 7,
    created_at: new Date().toISOString()
  },
  {
    id: 'ach-3',
    name: 'Skill Master',
    description: 'Get certified in your first skill',
    icon: 'award',
    xp_bonus: 100,
    requirement_type: 'skill_certified',
    requirement_value: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'ach-4',
    name: 'XP Hunter',
    description: 'Earn 1,000 total XP',
    icon: 'zap',
    xp_bonus: 50,
    requirement_type: 'xp_total',
    requirement_value: 1000,
    created_at: new Date().toISOString()
  },
  {
    id: 'ach-5',
    name: 'Dedicated Learner',
    description: 'Complete 25 scenarios',
    icon: 'book-open',
    xp_bonus: 75,
    requirement_type: 'scenarios_completed',
    requirement_value: 25,
    created_at: new Date().toISOString()
  },
  {
    id: 'ach-6',
    name: 'Streak Legend',
    description: 'Maintain a 30-day streak',
    icon: 'crown',
    xp_bonus: 150,
    requirement_type: 'streak',
    requirement_value: 30,
    created_at: new Date().toISOString()
  }
]

export const mockUserAchievements: UserAchievement[] = [
  {
    id: 'ua-1',
    user_id: '1',
    achievement_id: 'ach-1',
    earned_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    achievement: mockAchievements[0]
  },
  {
    id: 'ua-2',
    user_id: '1',
    achievement_id: 'ach-2',
    earned_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    achievement: mockAchievements[1]
  },
  {
    id: 'ua-3',
    user_id: '1',
    achievement_id: 'ach-3',
    earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    achievement: mockAchievements[2]
  },
  {
    id: 'ua-4',
    user_id: '1',
    achievement_id: 'ach-4',
    earned_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    achievement: mockAchievements[3]
  },
  {
    id: 'ua-5',
    user_id: '1',
    achievement_id: 'ach-5',
    earned_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    achievement: mockAchievements[4]
  }
]

export const mockModuleProgress: ModuleProgress[] = [
  {
    id: 'mp-1',
    user_id: '1',
    module: 'simulator',
    scenarios_completed: 28,
    scenarios_total: 35,
    completion_percentage: 80,
    average_mastery_score: 0.78,
    time_spent_minutes: 1120,
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mp-2',
    user_id: '1',
    module: 'rehearsal',
    scenarios_completed: 12,
    scenarios_total: 20,
    completion_percentage: 60,
    average_mastery_score: 0.72,
    time_spent_minutes: 480,
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mp-3',
    user_id: '1',
    module: 'reflective',
    scenarios_completed: 5,
    scenarios_total: 10,
    completion_percentage: 50,
    average_mastery_score: 0.65,
    time_spent_minutes: 180,
    last_activity_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'mp-4',
    user_id: '1',
    module: 'adaptive',
    scenarios_completed: 2,
    scenarios_total: 15,
    completion_percentage: 13.3,
    average_mastery_score: 0.58,
    time_spent_minutes: 67,
    last_activity_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockEngagementData: UserEngagement[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (13 - i))
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  
  return {
    id: `eng-${i}`,
    user_id: '1',
    date: date.toISOString().split('T')[0],
    sessions_started: isWeekend ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4) + 1,
    sessions_completed: isWeekend ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 3) + 1,
    sessions_abandoned: Math.random() > 0.8 ? 1 : 0,
    time_spent_minutes: isWeekend ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 60) + 30,
    xp_earned: isWeekend ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 200) + 50,
    scenarios_attempted: [],
    drop_off_points: null
  }
})

export const mockRecentSessions: ScenarioSession[] = [
  {
    id: 'session-1',
    user_id: '1',
    scenario_id: 'scenario-1',
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 28,
    status: 'completed',
    drop_off_point: null,
    xp_earned: 85,
    mastery_score: 0.82,
    ai_feedback: { overall: 'Good use of redirection', areas_to_improve: ['Wait time before prompting'] },
    performance_metrics: { prompts_used: 4, reinforcement_ratio: 0.8 },
    conversation_history: [],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    scenario: mockScenarios[0]
  },
  {
    id: 'session-2',
    user_id: '1',
    scenario_id: 'scenario-2',
    started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 22,
    status: 'completed',
    drop_off_point: null,
    xp_earned: 55,
    mastery_score: 0.75,
    ai_feedback: { overall: 'Good pacing', areas_to_improve: ['Prompt fading'] },
    performance_metrics: { prompts_used: 6, reinforcement_ratio: 0.75 },
    conversation_history: [],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    scenario: mockScenarios[1]
  }
]
