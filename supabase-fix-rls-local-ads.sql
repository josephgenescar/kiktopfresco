-- Supabase-only fix for public ads
-- Run this in Supabase SQL Editor

-- 1) Make local_ads fully visible to the public app.
ALTER TABLE local_ads DISABLE ROW LEVEL SECURITY;

-- 2) If you prefer to keep RLS on, use these permissive policies instead.
DROP POLICY IF EXISTS "Allow public read on local_ads" ON local_ads;
CREATE POLICY "Allow public read on local_ads" ON local_ads
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write on local_ads" ON local_ads;
CREATE POLICY "Allow public write on local_ads" ON local_ads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on local_ads" ON local_ads
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on local_ads" ON local_ads
  FOR DELETE USING (true);
