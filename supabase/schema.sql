-- Champions of Champions Microsite - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Employee IDs for login validation (whitelist — one row per allowed employee_id)
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

-- Participants: each person who logs in (multiple per employee_id allowed)
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (employee_id, email)
);

CREATE INDEX IF NOT EXISTS idx_participants_employee_id ON participants (employee_id);

-- Dubsmash submissions
CREATE TABLE IF NOT EXISTS dubsmash_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  clip_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instagram photo challenge submissions (one per employee_id)
CREATE TABLE IF NOT EXISTS instagram_challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL UNIQUE,
  branded_image_url TEXT NOT NULL,
  photo_captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  instagram_screenshot_url TEXT,
  likes_count INTEGER,
  screenshot_uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_instagram_likes ON instagram_challenge_submissions (likes_count DESC NULLS LAST);

-- Sample employee IDs (replace with your actual IDs)
INSERT INTO employee_ids (employee_id, name, can_play_games) VALUES
  ('EMP001', 'Demo User 1', true),
  ('EMP002', 'Demo User 2', true),
  ('EMP003', 'Demo User 3', true)
ON CONFLICT (employee_id) DO NOTHING;

-- Storage buckets (create via Supabase Dashboard or run in SQL):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('dubsmash-videos', 'dubsmash-videos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('instagram-challenge', 'instagram-challenge', true);
