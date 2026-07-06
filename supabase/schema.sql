-- Champions of Champions Microsite - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Employee IDs for login validation
CREATE TABLE IF NOT EXISTS employee_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If your table was created without is_active, run:
-- ALTER TABLE employee_ids ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Retro Poster submissions
CREATE TABLE IF NOT EXISTS retro_poster_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  poster_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guess the Actor submissions
CREATE TABLE IF NOT EXISTS guess_actor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory Game results
CREATE TABLE IF NOT EXISTS memory_game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  actions INTEGER NOT NULL,
  time_taken_seconds NUMERIC NOT NULL,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dubsmash submissions
CREATE TABLE IF NOT EXISTS dubsmash_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  clip_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_guess_actor_score ON guess_actor_submissions (score DESC, time_taken_seconds ASC);
CREATE INDEX IF NOT EXISTS idx_memory_game ON memory_game_results (actions ASC, time_taken_seconds ASC);

-- Sample employee IDs (replace with your actual IDs)
INSERT INTO employee_ids (employee_id, name) VALUES
  ('EMP001', 'Demo User 1'),
  ('EMP002', 'Demo User 2'),
  ('EMP003', 'Demo User 3')
ON CONFLICT (employee_id) DO NOTHING;

-- Storage buckets (create via Supabase Dashboard or run in SQL):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('retro-posters', 'retro-posters', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('dubsmash-videos', 'dubsmash-videos', true);
