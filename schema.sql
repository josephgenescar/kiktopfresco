-- KikTop Fresco - Supabase Database Schema
-- Kouri sa nan Supabase SQL Editor

-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS sunday_special CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS local_ads CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customer_reviews CASCADE;
DROP TABLE IF EXISTS site_visits CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Settings table
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  max_points INTEGER DEFAULT 100,
  points_rate INTEGER DEFAULT 150,
  admin_pwd TEXT DEFAULT 'kiktop2026',
  admin_email TEXT,
  whatsapp_number TEXT DEFAULT '50900000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (id, max_points, points_rate, admin_pwd, admin_email, whatsapp_number)
VALUES (1, 100, 150, 'kiktop2026', 'admin@kiktop.com', '50900000000')
ON CONFLICT (id) DO NOTHING;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name_fr TEXT NOT NULL,
  name_kr TEXT NOT NULL,
  tab TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  emoji TEXT,
  description_fr TEXT,
  description_kr TEXT,
  image TEXT,
  badge TEXT,
  alcohol BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  point_value INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  body TEXT,
  icon TEXT,
  bg TEXT DEFAULT '#0D2B5E',
  color TEXT DEFAULT '#ffffff',
  img TEXT,
  link TEXT,
  type TEXT DEFAULT 'text',
  active BOOLEAN DEFAULT TRUE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Local ads / publicite locale table
CREATE TABLE IF NOT EXISTS local_ads (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  body TEXT,
  button_text TEXT DEFAULT 'Wè plis',
  img TEXT,
  link TEXT,
  active BOOLEAN DEFAULT TRUE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  history JSONB DEFAULT '[]'::jsonb,
  referral_code TEXT UNIQUE,
  referred_by BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  referral_source TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_referral_code ON customers (referral_code);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  points_used INTEGER DEFAULT 0,
  payment_method TEXT DEFAULT 'whatsapp',
  payment_proof TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sunday Special table
CREATE TABLE IF NOT EXISTS sunday_special (
  id INTEGER PRIMARY KEY DEFAULT 1,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  special_price INTEGER NOT NULL,
  special_message TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  rating INTEGER DEFAULT 5,
  review TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site visits table
CREATE TABLE IF NOT EXISTS site_visits (
  session_id TEXT PRIMARY KEY,
  visit_date TEXT,
  page TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default sunday special
INSERT INTO sunday_special (id, product_id, special_price, special_message, active)
VALUES (1, NULL, 0, 'Special Dimanche', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_points ON customers(points DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_tab ON products(tab);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(active);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_local_ads_active ON local_ads(active);
CREATE INDEX IF NOT EXISTS idx_local_ads_position ON local_ads(position);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_approved ON customer_reviews(approved);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created_at ON customer_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_visit_date ON site_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at DESC);

-- Disable RLS for now (using service role keys provides security)
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE local_ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE sunday_special DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits DISABLE ROW LEVEL SECURITY;
