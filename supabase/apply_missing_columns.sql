-- ============================================================
-- MISSING PRODUCTION COLUMNS — RUN THIS IN THE SUPABASE SQL EDITOR
-- ============================================================
-- These columns exist in supabase_schema.sql but were never applied to the
-- live database. Their absence made the entire UTR checkout fail with
-- PGRST204 ("Could not find the 'utr_number' column ... in the schema cache").
-- The app now degrades gracefully without them, but run this to enable the
-- proper UTR column + customization/provenance persistence.

-- Orders: store the customer's UPI UTR / transaction reference
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utr_number TEXT;

-- Order items: customization summary for the print queue + agreed price
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS ai_printing_instructions TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS agreed_price INTEGER;

-- Products: design provenance (marketplace / imported models)
ALTER TABLE products ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS license TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS attribution TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_file TEXT;

-- Force PostgREST to refresh its schema cache so the API sees the new columns
NOTIFY pgrst, 'reload schema';
