// Vercel serverless proxy for CGTrader's public site search endpoint.
//
// GET /api/cgtrader?keywords=lithophane+lamp&page=2&print_ready=1
//
// Passes the upstream JSON through unmodified — all normalization lives in
// src/lib/cgtrader.js so dev (Vite proxy) and prod behave identically.
// See docs/cgtrader-integration.md for validated params and response shape.

const UPSTREAM = 'https://www.cgtrader.com/search.json';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// Only forward params we have validated against the upstream endpoint.
// `q` is accepted as an alias for `keywords`.
const ALLOWED_PARAMS = ['keywords', 'page', 'print_ready', 'free', 'sort_by'];

const FETCH_TIMEOUT_MS = 8000;

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query || {};
  const upstream = new URL(UPSTREAM);

  const keywords = query.keywords ?? query.q;
  if (keywords) upstream.searchParams.set('keywords', String(keywords));

  for (const param of ALLOWED_PARAMS) {
    if (param === 'keywords') continue;
    const value = query[param];
    if (value !== undefined && value !== '') {
      upstream.searchParams.set(param, String(value));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(upstream, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: `CGTrader responded with status ${response.status}` });
    }

    const data = await response.json();

    // Cache at Vercel's edge: fresh for 1h, serve stale for 24h while revalidating.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json(data);
  } catch (err) {
    const message =
      err?.name === 'AbortError'
        ? 'CGTrader request timed out'
        : `CGTrader request failed: ${err?.message || 'unknown error'}`;
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timer);
  }
}
