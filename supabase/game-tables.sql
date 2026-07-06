-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- Creates the 4 game result tables required for saving scores/submissions

CREATE TABLE IF NOT EXISTS retro_poster_submissions (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  poster_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guess_actor_submissions (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 9,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_game_results (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  actions INTEGER NOT NULL,
  time_taken_seconds NUMERIC NOT NULL,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dubsmash_submissions (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  clip_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guess_actor_score
  ON guess_actor_submissions (score DESC, time_taken_seconds ASC);

CREATE INDEX IF NOT EXISTS idx_memory_game
  ON memory_game_results (actions ASC, time_taken_seconds ASC);
