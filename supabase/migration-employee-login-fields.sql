-- Migration: employee login fields (run in Supabase SQL Editor on existing projects)

ALTER TABLE employee_ids ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE employee_ids ADD COLUMN IF NOT EXISTS can_play_games BOOLEAN DEFAULT false;

-- Optional: backfill demo users as eligible
UPDATE employee_ids SET can_play_games = true WHERE employee_id IN ('EMP001', 'EMP002', 'EMP003');
