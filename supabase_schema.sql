-- ============================================================
-- Gifted with Love — Complete Supabase Database Schema
-- Run this in your Supabase SQL Editor (fresh or existing project)
-- ============================================================

-- Enable Row Level Security on all tables
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: Profiles are viewable by everyone; users can update own
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Seed default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Face Miniatures', 'face-miniatures', 'Detailed 3D printed busts of your loved ones', 1),
  ('Lamps', 'lamps', 'Beautiful lithophane lamps that illuminate your photos', 2),
  ('Home Decor', 'home-decor', 'Elegant name plates and desk accessories', 3),
  ('Accessories', 'accessories', 'Keychains and everyday carry items', 4),
  ('Couple Gifts', 'couple-gifts', 'Heart-shaped lamps and couple busts', 5),
  ('Corporate', 'corporate', 'Premium bulk gifts for clients and employees', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. PRODUCTS (enhanced)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  product_type TEXT DEFAULT 'uncustomised' CHECK (product_type IN ('customised', 'uncustomised')),
  is_active BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 100,
  weight_grams INTEGER,
  print_time_minutes INTEGER,
  material TEXT DEFAULT 'PLA',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Products are readable by everyone; admins manage
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Insert default products (linked to categories)
INSERT INTO products (name, description, price, image, category_id, product_type, stock_quantity, weight_grams, print_time_minutes, material) VALUES
  ('3D Face Miniatures', 'Detailed hand-painted 3D bust of your loved one', 2499, '/images/products/model1.jpeg', 1, 'customised', 999, 150, 180, 'PLA+'),
  ('Lithophane Lamps', 'Your photos illuminate beautifully when lit from behind', 1999, '/images/products/globe_front.jpeg', 2, 'customised', 999, 200, 240, 'PLA'),
  ('Personalized Name Plates', 'Elegant 3D printed name plates for desk or door', 999, '/images/products/globe_back.jpeg', 3, 'uncustomised', 100, 80, 90, 'PLA'),
  ('Custom Keychains', 'Carry your memories everywhere with photo keychains', 499, '/images/products/model1_raw.jpeg', 4, 'customised', 999, 20, 30, 'PLA'),
  ('Couple Gifts Set', 'Heart-shaped lamps and couple busts for special days', 3499, '/images/products/model1_raw_generated.jpeg', 5, 'customised', 999, 250, 300, 'PLA'),
  ('Corporate Gift Box', 'Premium bulk 3D printed gifts for clients', 4999, '/images/products/globe_front.jpeg', 6, 'uncustomised', 50, 500, 360, 'PLA+')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all carts" ON cart_items;
CREATE POLICY "Admins can view all carts" ON cart_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 5. ORDERS (enhanced for pipeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'order_placed',
  -- Valid statuses:
  -- Customised:  order_placed → pending_photo → design_ready → approved → printing → qc → shipped → delivered
  -- Uncustomised: order_placed → packed → shipped → delivered
  -- Universal: cancelled
  payment_method TEXT DEFAULT 'online',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure existing orders tables get the new guest/payment columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'online';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Authenticated users see their own orders; guests use the lookup function
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Order owners and guests can update pending orders" ON orders;
CREATE POLICY "Order owners and guests can update pending orders" ON orders
  FOR UPDATE USING (
    auth.uid() = user_id OR guest_phone IS NOT NULL
  ) WITH CHECK (
    auth.uid() = user_id OR guest_phone IS NOT NULL
  );

DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Secure guest order lookup by order id + phone
CREATE OR REPLACE FUNCTION get_guest_order(order_id UUID, phone TEXT)
RETURNS SETOF orders AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM orders
  WHERE id = order_id AND guest_phone = phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Guest order lookup including items (used by the storefront order tracker)
CREATE OR REPLACE FUNCTION get_guest_order_with_items(order_id UUID, phone TEXT)
RETURNS TABLE (
  order_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'order', row_to_json(o.*),
    'items', COALESCE((
      SELECT jsonb_agg(
        row_to_json(oi.*) || jsonb_build_object('product', row_to_json(p.*))
      )
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = o.id
    ), '[]'::jsonb)
  )
  FROM orders o
  WHERE o.id = order_id AND o.guest_phone = phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_phone ON orders(guest_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- 6. ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  custom_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS custom_image TEXT;

DROP POLICY IF EXISTS "Order items viewable by order owner or admin" ON order_items;
CREATE POLICY "Order items viewable by order owner or admin" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid()
             OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

DROP POLICY IF EXISTS "Order items insertable by order owner or guest orders" ON order_items;
CREATE POLICY "Order items insertable by order owner or guest orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR orders.guest_phone IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
CREATE POLICY "Admins can manage order items" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 7. ORDER STATUS HISTORY (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_osh_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_osh_created ON order_status_history(created_at DESC);

DROP POLICY IF EXISTS "Order history is viewable with order" ON order_status_history;
CREATE POLICY "Order history is viewable with order" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id
    )
  );

DROP POLICY IF EXISTS "Admins can manage order history" ON order_status_history;
CREATE POLICY "Admins can manage order history" ON order_status_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 8. ORDER CUSTOMIZATIONS (for customised product pipeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  customer_photo_url TEXT,
  design_preview_url TEXT,
  customer_notes TEXT,
  admin_notes TEXT,
  customer_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP POLICY IF EXISTS "Customizations are viewable with order" ON order_customizations;
CREATE POLICY "Customizations are viewable with order" ON order_customizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_customizations.order_id
    )
  );

DROP POLICY IF EXISTS "Admins can manage customizations" ON order_customizations;
CREATE POLICY "Admins can manage customizations" ON order_customizations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 9. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- 10. COMMUNITY POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS community_posts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP POLICY IF EXISTS "Community posts are viewable by everyone" ON community_posts;
CREATE POLICY "Community posts are viewable by everyone" ON community_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own posts" ON community_posts;
CREATE POLICY "Users can insert own posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;
CREATE POLICY "Users can delete own posts" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 11. NEWSLETTER SUBSCRIPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

DROP POLICY IF EXISTS "Admins can manage newsletter subscriptions" ON newsletter_subscriptions;
CREATE POLICY "Admins can manage newsletter subscriptions" ON newsletter_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow public insert (anyone can subscribe) but no public read
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active);

-- ============================================================
-- 12. ADMIN HELPER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 13. SEED FIRST ADMIN (run this manually after your first signup)
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_UUID';

-- ============================================================
-- 14. CONTACT SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP POLICY IF EXISTS "Admins can manage contact submissions" ON contact_submissions;
CREATE POLICY "Admins can manage contact submissions" ON contact_submissions
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_submissions(is_read);

-- ============================================================
-- 15. SCHEMA MIGRATIONS (run these on existing tables)
-- ============================================================

-- Add custom_image to cart_items for photo uploads in customize flow
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS custom_image TEXT;

-- Add is_visible to community_posts for moderation
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add voucher fields to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- ============================================================
-- 16. VOUCHERS / PROMO CODES
-- ============================================================
CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_discount_amount INTEGER,
  min_order_amount INTEGER DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP POLICY IF EXISTS "Vouchers are viewable by everyone" ON vouchers;
CREATE POLICY "Vouchers are viewable by everyone" ON vouchers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage vouchers" ON vouchers;
CREATE POLICY "Admins can manage vouchers" ON vouchers
  FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);

-- Seed default first-order voucher
INSERT INTO vouchers (code, discount_percent, max_discount_amount, min_order_amount, usage_limit, is_active, starts_at, expires_at)
VALUES ('WELCOME10', 10, 500, 0, NULL, true, NOW(), NOW() + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 17. PRODUCT VIEWS (analytics for product detail page)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_views_product ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewer ON product_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created ON product_views(created_at DESC);

-- Anyone (guest or authenticated) can record a view
DROP POLICY IF EXISTS "Anyone can insert product views" ON product_views;
CREATE POLICY "Anyone can insert product views" ON product_views
  FOR INSERT WITH CHECK (true);

-- Admins can view all analytics
DROP POLICY IF EXISTS "Admins can view product views" ON product_views;
CREATE POLICY "Admins can view product views" ON product_views
  FOR SELECT USING (public.is_admin());

-- Users can view their own product views (optional, keeps select usable for auth users)
DROP POLICY IF EXISTS "Users can view own product views" ON product_views;
CREATE POLICY "Users can view own product views" ON product_views
  FOR SELECT USING (auth.uid() = viewer_id);
