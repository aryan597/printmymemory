import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration at startup
const hasValidUrl = supabaseUrl && supabaseUrl.includes('.supabase.co');
const hasValidKey = supabaseAnonKey && supabaseAnonKey.length >= 50 && supabaseAnonKey.startsWith('eyJ');

if (!hasValidUrl || !hasValidKey) {
  console.error(
    '[Supabase Config] Missing or invalid credentials.\n' +
    'Make sure your .env file has:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...\n' +
    'See .env.example and SUPABASE_SETUP_GUIDE.md for help.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export const TABLES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  CART_ITEMS: 'cart_items',
  COMMUNITY_POSTS: 'community_posts',
  REVIEWS: 'reviews',
  PROFILES: 'profiles',
  CATEGORIES: 'categories',
  ORDER_STATUS_HISTORY: 'order_status_history',
  ORDER_CUSTOMIZATIONS: 'order_customizations',
  NEWSLETTER_SUBS: 'newsletter_subscriptions',
  ADDRESSES: 'addresses',
  VOUCHERS: 'vouchers',
  CONTACT_SUBMISSIONS: 'contact_submissions',
  PRODUCT_VIEWS: 'product_views',
};
