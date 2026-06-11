-- Supabase-only fix for public ads
-- Run this in Supabase SQL Editor

ALTER TABLE local_ads DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS enabled instead, use this policy:
-- CREATE POLICY "Allow public read on local_ads" ON local_ads
-- FOR SELECT USING (true);
