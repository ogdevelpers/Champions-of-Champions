-- Migration: support multiple people logging in with the same employee_id
-- Run in Supabase SQL Editor
-- Games are unchanged — still one submission per employee_id

-- Each login creates (or reuses) a row here instead of overwriting employee_ids
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
