-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- Creates the memory game result table required for saving scores

CREATE TABLE IF NOT EXISTS memory_game_results (
  id BIGSERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  actions INTEGER NOT NULL,
  time_taken_seconds NUMERIC NOT NULL,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_game
  ON memory_game_results (actions ASC, time_taken_seconds ASC);
