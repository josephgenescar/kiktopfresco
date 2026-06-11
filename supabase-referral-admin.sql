-- SQL pou verify/ajoute kolòn parennage nan Supabase
-- Kouri sa nan Supabase SQL Editor

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by BIGINT,
  ADD COLUMN IF NOT EXISTS referral_source TEXT DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_customers_referral_code ON customers (referral_code);
CREATE INDEX IF NOT EXISTS idx_customers_referred_by ON customers (referred_by);

ALTER TABLE customers
  ADD CONSTRAINT customers_referred_by_fkey
  FOREIGN KEY (referred_by)
  REFERENCES customers(id)
  ON DELETE SET NULL;

-- View easy pou admin
CREATE OR REPLACE VIEW customer_referral_stats AS
SELECT
  c.id,
  c.name,
  c.email,
  c.phone,
  c.referral_code,
  c.referral_source,
  c.referred_by,
  p.name AS referrer_name,
  c.created_at
FROM customers c
LEFT JOIN customers p ON p.id = c.referred_by;

-- Query pou wè parennage
SELECT
  id,
  name,
  phone,
  referral_code,
  referral_source,
  referred_by,
  created_at
FROM customer_referral_stats
ORDER BY created_at DESC;
