import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://printmymemory.ind.in';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  // Static routes
  const routes = [
    '/',
    '/shop',
    '/shop3d',
    '/cart',
    '/order-lookup'
  ];

  let urls = routes.map(route => `<url><loc>${BASE_URL}${route}</loc><changefreq>daily</changefreq><priority>${route === '/' ? '1.0' : '0.8'}</priority></url>`);

  // Dynamic routes (products)
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, created_at')
      .eq('is_active', true);

    if (error) throw error;

    if (products) {
      const productUrls = products.map(product => {
        const date = product.created_at ? new Date(product.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        return `<url><loc>${BASE_URL}/product/${product.id}</loc><lastmod>${date}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`;
      });
      urls = urls.concat(productUrls);
    }
  } catch (err) {
    console.error('Error fetching products for sitemap:', err.message);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n  ')}
</urlset>`;

  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully at public/sitemap.xml');
}

generateSitemap();
