-- Live stream interaction tracking
CREATE TABLE IF NOT EXISTS live_stream_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  stream_event_id TEXT NOT NULL,
  action TEXT NOT NULL,
  stream_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_stream_events_employee
  ON live_stream_events (employee_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_live_stream_events_action
  ON live_stream_events (action, created_at DESC);
