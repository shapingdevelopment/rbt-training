-- ═══════════════════════════════════════════════════════════════════════════
-- RBT Training Platform — Full Database Schema
-- Run this entire block in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── STEP 1: Enable Clerk as third-party JWT provider ───────────────────────
-- Do this FIRST in Supabase Dashboard before running this SQL:
--   Authentication → Sign In / Up → Third-party Auth → Add Provider → Clerk
--   Enter your Clerk domain (e.g. your-app.clerk.accounts.dev)
--   This makes auth.jwt() ->> 'sub' return the Clerk user ID in RLS policies.


-- ─── STEP 2: Core tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id               TEXT        NOT NULL UNIQUE,
  email                  TEXT        NOT NULL,
  full_name              TEXT,
  role                   TEXT        NOT NULL DEFAULT 'rbt'
                           CHECK (role IN ('rbt','supervisor','admin')),
  supervisor_id          UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  total_training_minutes INT         NOT NULL DEFAULT 0,
  target_training_hours  INT         NOT NULL DEFAULT 40,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_progress (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   TEXT        NOT NULL UNIQUE,  -- Clerk user ID
  total_xp                  INT         NOT NULL DEFAULT 0,
  level                     INT         NOT NULL DEFAULT 1,
  current_streak            INT         NOT NULL DEFAULT 0,
  longest_streak            INT         NOT NULL DEFAULT 0,
  last_activity_date        DATE,
  sessions_completed        INT         NOT NULL DEFAULT 0,
  sessions_abandoned        INT         NOT NULL DEFAULT 0,
  total_scenarios_available INT         NOT NULL DEFAULT 0,
  scenarios_mastered        INT         NOT NULL DEFAULT 0,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competency_skills (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT        NOT NULL,
  description           TEXT,
  category              TEXT,
  max_level             INT         NOT NULL DEFAULT 5,
  icon                  TEXT,
  unlock_requirement_xp INT         NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_skills (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT        NOT NULL,
  skill_id            TEXT        NOT NULL,  -- domain string e.g. 'de-escalation'
  current_level       INT         NOT NULL DEFAULT 0,
  xp_in_skill         INT         NOT NULL DEFAULT 0,
  fluency_score       NUMERIC     NOT NULL DEFAULT 0 CHECK (fluency_score  BETWEEN 0 AND 1),
  mastery_score       NUMERIC     NOT NULL DEFAULT 0 CHECK (mastery_score  BETWEEN 0 AND 1),
  is_weak_area        BOOLEAN     NOT NULL DEFAULT false,
  remediation_count   INT         NOT NULL DEFAULT 0,
  last_remediation_at TIMESTAMPTZ,
  last_practiced      TIMESTAMPTZ,
  certified_at        TIMESTAMPTZ,
  certified_by        TEXT,
  UNIQUE (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS scenarios (
  id              TEXT        PRIMARY KEY,  -- e.g. 'de-escalation'
  title           TEXT        NOT NULL,
  description     TEXT,
  module          TEXT        NOT NULL DEFAULT 'simulator'
                    CHECK (module IN ('simulator','rehearsal','reflective','adaptive')),
  category        TEXT,
  difficulty      INT         NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  xp_reward       INT         NOT NULL DEFAULT 100,
  skill_ids       TEXT[]      NOT NULL DEFAULT '{}',
  system_prompt   TEXT        NOT NULL DEFAULT '',
  initial_context JSONB,
  unlock_level    INT         NOT NULL DEFAULT 1,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scenario_sessions (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              TEXT        NOT NULL,
  scenario_id          TEXT        NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at         TIMESTAMPTZ,
  duration_minutes     INT         NOT NULL DEFAULT 0,
  status               TEXT        NOT NULL DEFAULT 'in_progress'
                         CHECK (status IN ('in_progress','completed','abandoned')),
  drop_off_point       TEXT,
  xp_earned            INT         NOT NULL DEFAULT 0,
  mastery_score        NUMERIC     CHECK (mastery_score BETWEEN 0 AND 1),
  ai_feedback          JSONB,
  performance_metrics  JSONB,
  conversation_history JSONB,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reflective_entries (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 TEXT        NOT NULL,
  session_date            DATE        NOT NULL DEFAULT CURRENT_DATE,
  challenges              TEXT,
  decisions_made          TEXT,
  ai_analysis             JSONB,
  alternatives_identified TEXT[],
  rehearsal_notes         TEXT,
  xp_earned               INT         NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessments (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id    TEXT        NOT NULL,
  supervisor_id TEXT        NOT NULL,
  skill_id      TEXT,
  session_id    UUID        REFERENCES scenario_sessions(id) ON DELETE SET NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','needs_improvement','rejected')),
  score         NUMERIC     CHECK (score BETWEEN 0 AND 100),
  feedback      TEXT,
  certified     BOOLEAN     NOT NULL DEFAULT false,
  assessed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS xp_transactions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,
  amount      INT         NOT NULL,
  source      TEXT        NOT NULL,
  source_id   TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  description       TEXT,
  icon              TEXT,
  xp_bonus          INT         NOT NULL DEFAULT 0,
  requirement_type  TEXT        NOT NULL,
  requirement_value INT         NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT        NOT NULL,
  achievement_id UUID        NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS module_progress (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT        NOT NULL,
  module                TEXT        NOT NULL
                          CHECK (module IN ('simulator','rehearsal','reflective','adaptive')),
  scenarios_completed   INT         NOT NULL DEFAULT 0,
  scenarios_total       INT         NOT NULL DEFAULT 0,
  completion_percentage NUMERIC     NOT NULL DEFAULT 0,
  average_mastery_score NUMERIC     NOT NULL DEFAULT 0,
  time_spent_minutes    INT         NOT NULL DEFAULT 0,
  last_activity_at      TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module)
);

CREATE TABLE IF NOT EXISTS user_engagement (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT    NOT NULL,
  date                DATE    NOT NULL DEFAULT CURRENT_DATE,
  sessions_started    INT     NOT NULL DEFAULT 0,
  sessions_completed  INT     NOT NULL DEFAULT 0,
  sessions_abandoned  INT     NOT NULL DEFAULT 0,
  time_spent_minutes  INT     NOT NULL DEFAULT 0,
  xp_earned           INT     NOT NULL DEFAULT 0,
  scenarios_attempted TEXT[]  NOT NULL DEFAULT '{}',
  drop_off_points     JSONB,
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS remediation_assignments (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id         TEXT        NOT NULL,
  supervisor_id      TEXT,
  skill_id           TEXT,
  reason             TEXT,
  assigned_scenarios TEXT[]      NOT NULL DEFAULT '{}',
  status             TEXT        NOT NULL DEFAULT 'assigned'
                       CHECK (status IN ('assigned','in_progress','completed')),
  assigned_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at       TIMESTAMPTZ
);


-- ─── STEP 3: Row-Level Security ──────────────────────────────────────────────

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills             ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflective_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement         ENABLE ROW LEVEL SECURITY;
ALTER TABLE remediation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios               ENABLE ROW LEVEL SECURITY;
ALTER TABLE competency_skills       ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements            ENABLE ROW LEVEL SECURITY;

-- Each user sees only their own rows.
-- auth.jwt() ->> 'sub' returns the Clerk user ID when Clerk is set as third-party provider.

CREATE POLICY "profiles: own row"       ON profiles                FOR ALL    USING ((auth.jwt() ->> 'sub') = clerk_id);
CREATE POLICY "progress: own row"       ON user_progress           FOR ALL    USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "skills: own rows"        ON user_skills             FOR ALL    USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "sessions: own rows"      ON scenario_sessions       FOR ALL    USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "reflections: own rows"   ON reflective_entries      FOR ALL    USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "xp: own rows"            ON xp_transactions         FOR ALL    USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "achievements: own rows"  ON user_achievements       FOR ALL    USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "module_progress: own"    ON module_progress         FOR ALL    USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "engagement: own rows"    ON user_engagement         FOR ALL    USING ((auth.jwt() ->> 'sub') = user_id);
CREATE POLICY "remediation: own rows"   ON remediation_assignments FOR ALL    USING ((auth.jwt() ->> 'sub') = trainee_id);

-- Assessments: trainees see their own; supervisors see their team
CREATE POLICY "assessments: trainee"    ON assessments FOR SELECT  USING ((auth.jwt() ->> 'sub') = trainee_id);
CREATE POLICY "assessments: supervisor" ON assessments FOR ALL     USING ((auth.jwt() ->> 'sub') = supervisor_id);

-- Public read-only tables (all authenticated users can read)
CREATE POLICY "scenarios: read"         ON scenarios         FOR SELECT USING (true);
CREATE POLICY "skills: read"            ON competency_skills FOR SELECT USING (true);
CREATE POLICY "achievements: read"      ON achievements      FOR SELECT USING (true);


-- ─── STEP 4: Dashboard views ────────────────────────────────────────────────
-- Drop first to allow clean recreation if re-running this script

DROP VIEW IF EXISTS rbt_dashboard_summary;
DROP VIEW IF EXISTS competency_gap_report;
DROP VIEW IF EXISTS drop_off_analysis;

CREATE VIEW rbt_dashboard_summary AS
SELECT
  up.user_id,
  up.level,
  up.total_xp,
  up.current_streak,
  up.longest_streak,
  up.sessions_completed,
  up.sessions_abandoned,

  -- 40-Hour tracker
  ROUND(COALESCE(p.total_training_minutes, 0) / 60.0, 1)
    AS hours_trained,
  ROUND(LEAST(
    COALESCE(p.total_training_minutes, 0) / 60.0
    / NULLIF(p.target_training_hours, 0) * 100,
    100
  ), 1)
    AS pct_of_target,

  -- Module completion (uses completion_percentage, not a status column)
  COALESCE(mc.modules_complete, 0) AS modules_complete,
  COALESCE(mc.modules_total,    0) AS modules_total,
  COALESCE(mc.completion_pct,   0) AS completion_rate_pct,

  -- Engagement (last 7 days)
  COALESCE(eng.sessions_last_7d, 0) AS sessions_last_7d,
  COALESCE(eng.avg_session_mins, 0) AS avg_session_mins,

  -- Weak skill areas
  COALESCE(wa.weak_domains, ARRAY[]::TEXT[]) AS weak_domains,

  -- Open remediations
  COALESCE(ra.open_remediations, 0) AS open_remediations

FROM user_progress up
LEFT JOIN profiles p ON p.clerk_id = up.user_id

LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE completion_percentage >= 100)  AS modules_complete,
    COUNT(*)                                               AS modules_total,
    ROUND(
      COUNT(*) FILTER (WHERE completion_percentage >= 100)
      * 100.0 / NULLIF(COUNT(*), 0),
      1
    )                                                      AS completion_pct
  FROM module_progress mp
  WHERE mp.user_id = up.user_id
) mc ON true

LEFT JOIN LATERAL (
  SELECT
    COUNT(DISTINCT date) FILTER (WHERE date >= CURRENT_DATE - 7) AS sessions_last_7d,
    ROUND(AVG(
      CASE
        WHEN sessions_started > 0
        THEN time_spent_minutes::NUMERIC / sessions_started
        ELSE 0
      END
    ), 1) AS avg_session_mins
  FROM user_engagement ue
  WHERE ue.user_id = up.user_id
) eng ON true

LEFT JOIN LATERAL (
  SELECT ARRAY_AGG(DISTINCT skill_id)
    FILTER (WHERE is_weak_area = true) AS weak_domains
  FROM user_skills us
  WHERE us.user_id = up.user_id
) wa ON true

LEFT JOIN LATERAL (
  SELECT COUNT(*) FILTER (WHERE status = 'assigned') AS open_remediations
  FROM remediation_assignments ra
  WHERE ra.trainee_id = up.user_id
) ra ON true;


CREATE VIEW competency_gap_report AS
SELECT
  user_id,
  skill_id                                      AS domain,
  ROUND(AVG(mastery_score) * 100, 1)           AS avg_score,
  80                                            AS target_score,
  ROUND((80 - AVG(mastery_score) * 100), 1)    AS avg_gap,
  COUNT(*) FILTER (WHERE is_weak_area = true)  AS weak_count,
  MAX(last_practiced)                           AS last_practiced
FROM user_skills
GROUP BY user_id, skill_id
ORDER BY avg_gap DESC;


CREATE VIEW drop_off_analysis AS
SELECT
  scenario_id,
  drop_off_point,
  COUNT(*) AS abandonment_count,
  ROUND(
    COUNT(*) * 100.0
    / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY scenario_id), 0),
    1
  ) AS pct_of_starts,
  MAX(started_at) AS most_recent
FROM scenario_sessions
WHERE status = 'abandoned'
  AND drop_off_point IS NOT NULL
GROUP BY scenario_id, drop_off_point
ORDER BY scenario_id, abandonment_count DESC;


-- ─── STEP 5: Helper functions ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_remediation_count(p_user_id TEXT, p_skill_id TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE user_skills
  SET remediation_count   = remediation_count + 1,
      last_remediation_at = now()
  WHERE user_id = p_user_id
    AND skill_id = p_skill_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_module_progress(p_user_id TEXT, p_duration_minutes INT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE profiles
  SET total_training_minutes = total_training_minutes + p_duration_minutes,
      updated_at             = now()
  WHERE clerk_id = p_user_id;

  UPDATE user_progress
  SET updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;


-- ─── STEP 6: Seed data ───────────────────────────────────────────────────────

INSERT INTO scenarios (id, title, description, module, category, difficulty, xp_reward, skill_ids)
VALUES
  ('de-escalation',
   'De-escalation Techniques',
   'Practice calming a frustrated client during a transition activity.',
   'simulator', 'behavior_intervention', 3, 150,
   ARRAY['de-escalation','behavior_reduction']),

  ('reinforcement',
   'Positive Reinforcement',
   'Implement reinforcement strategies effectively with a client on task completion.',
   'simulator', 'behavior_intervention', 2, 120,
   ARRAY['reinforcement']),

  ('data-collection',
   'Data Collection & ABC Notation',
   'Accurately observe, record, and categorize behaviors in a live session.',
   'simulator', 'data_collection', 2, 130,
   ARRAY['data-collection']),

  ('communication',
   'Guardian Communication',
   'Communicate professionally with a concerned guardian about their child.',
   'simulator', 'professional_conduct', 2, 110,
   ARRAY['communication']),

  ('safety',
   'Safety & Crisis Management',
   'Apply safety protocols when a situation develops that requires crisis response.',
   'simulator', 'behavior_intervention', 4, 180,
   ARRAY['safety','crisis-management'])

ON CONFLICT (id) DO NOTHING;


INSERT INTO competency_skills (id, name, description, category, max_level, unlock_requirement_xp)
VALUES
  (gen_random_uuid(), 'Reinforcement',      'Applying positive and negative reinforcement techniques effectively', 'behavior_intervention', 5,   0),
  (gen_random_uuid(), 'Data Collection',    'Accurately recording and analysing behavioral data',                 'data_collection',       5, 100),
  (gen_random_uuid(), 'Prompting',          'Using appropriate prompting hierarchies',                            'teaching_strategies',   5, 200),
  (gen_random_uuid(), 'Behavior Reduction', 'Implementing behavior reduction procedures safely',                  'behavior_intervention', 5, 500),
  (gen_random_uuid(), 'Communication',      'Effective communication with clients, families, and supervisors',    'professional_conduct',  5, 300),
  (gen_random_uuid(), 'Crisis Management',  'Responding appropriately to behavioral crises',                      'behavior_intervention', 5, 800)

ON CONFLICT DO NOTHING;


INSERT INTO achievements (name, description, icon, xp_bonus, requirement_type, requirement_value)
VALUES
  ('First Steps',       'Complete your first simulation session',             '🎯', 50,   'sessions_completed', 1),
  ('On a Roll',         'Maintain a 3-day training streak',                   '🔥', 100,  'streak_days',        3),
  ('Week Warrior',      'Maintain a 7-day training streak',                   '⚡', 250,  'streak_days',        7),
  ('Dedicated Learner', 'Complete 10 simulation sessions',                    '📚', 200,  'sessions_completed', 10),
  ('Rising Star',       'Reach Level 5',                                      '⭐', 500,  'level',              5),
  ('Halfway There',     'Complete 50% of your 40-hour training requirement',  '🏃', 300,  'hours_pct',          50),
  ('Certified Ready',   'Complete your 40-hour training requirement',         '🎓', 1000, 'hours_pct',          100)

ON CONFLICT DO NOTHING;