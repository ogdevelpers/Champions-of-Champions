-- Champions of Champions Microsite - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Employee IDs for login validation
CREATE TABLE IF NOT EXISTS employee_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  can_play_games BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If your table was created without newer columns, run:
-- ALTER TABLE employee_ids ADD COLUMN IF NOT EXISTS email TEXT;
-- ALTER TABLE employee_ids ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
-- ALTER TABLE employee_ids ADD COLUMN IF NOT EXISTS can_play_games BOOLEAN DEFAULT false;

-- Memory Game results
CREATE TABLE IF NOT EXISTS memory_game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  actions INTEGER NOT NULL,
  time_taken_seconds NUMERIC NOT NULL,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_memory_game ON memory_game_results (actions ASC, time_taken_seconds ASC);

-- Sample employee IDs (replace with your actual IDs)
INSERT INTO employee_ids (employee_id, name, can_play_games) VALUES
  ('EMP001', 'Demo User 1', true),
  ('EMP002', 'Demo User 2', true),
  ('EMP003', 'Demo User 3', true)
ON CONFLICT (employee_id) DO NOTHING;
