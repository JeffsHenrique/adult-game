# Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run:

```sql
CREATE TABLE daily_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT now(),
  date_key TEXT NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_daily_plays_fingerprint_date ON daily_plays(fingerprint, date_key);

-- Enable RLS
ALTER TABLE daily_plays ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON daily_plays
  FOR INSERT WITH CHECK (true);

-- Allow anonymous selects (only for checking own plays)
CREATE POLICY "Allow anonymous selects" ON daily_plays
  FOR SELECT USING (true);
```

3. Go to Project Settings > API
4. Copy the Project URL and anon/public key
5. Add to `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```