// CGTrader sample-model integration for category browsing.
//
// Contract (stable — UI components import these):
//   searchCGTraderModels(keywords, { page }) -> Promise<{ models, total, page, source }>
//     model: { id, title, url, image, imageLarge, description, price, isFree,
//              printReady, formats, categorySlug, subcategorySlug, isAdultContent }
//   categoryToKeywords(categoryName) -> string
//   getCategorySampleModels(categoryName, { pagesToScan, searchOverride })
//     -> Promise<{ models, scannedPages, hasMore, error? }>
//
// Requests go through /api/cgtrader (Vercel serverless function in prod,
// Vite dev proxy locally) to avoid CORS against cgtrader.com.
// See docs/cgtrader-integration.md for endpoint details, validated params,
// and the relevance-filter design.

const CGTRADER_ORIGIN = 'https://www.cgtrader.com';
const CACHE_PREFIX = 'cgtrader:v2:'; // v2: models carry description/imageLarge/slugs
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const UPSTREAM_PAGE_SIZE = 120; // fixed by CGTrader (per_page is not supported)
const MAX_PAGES_TO_SCAN = 3;
const FULL_PAGE_THRESHOLD = 90; // a page this full suggests more results upstream
const DESCRIPTION_MAX_LENGTH = 300;

// All requests use print_ready=1 (validated upstream filter) so results are
// actual 3D-printable models, so keywords stay short and product-focused.
// Keys match the live `categories` table names (plus legacy seed names).
// Tuned against real page-1 responses on 2026-07-02 — see the "Relevance
// filtering" section of docs/cgtrader-integration.md for kept/total stats.
const CATEGORY_KEYWORDS = {
  'Photo Gifts': 'lithophane photo lamp',
  'Home Decor': 'home decor',
  // 'name plate sign' was ~93% jewelry pendants; this query surfaces desk
  // nameplates / 3D letters / word signs instead.
  'Personalized Text': 'nameplate letters sign',
  'Couple & Anniversary': 'heart couple gift',
  'Kids & Baby': 'kids toy figurine',
  'Corporate': 'desk accessory trophy',
  'Festive': 'festive ornament decoration',
  'Everyday Utility': 'desk organizer holder stand',
  // Legacy seed category names
  'Face Miniatures': 'miniature figurine bust',
  'Lamps': 'lithophane lamp',
  'Accessories': 'keychain',
  'Couple Gifts': 'heart couple gift',
  // Plain 'gift' is ~50% jewelry CAD; 'gift decor' reads like a gift shop.
  'All': 'gift decor',
};

export function categoryToKeywords(categoryName) {
  return CATEGORY_KEYWORDS[categoryName] || `${categoryName} 3d print`;
}

// ---------------------------------------------------------------------------
// Image validation — drop designs whose photo won't actually load, so we never
// render broken/placeholder cards. Browser-only (uses Image()).

export function imageLoads(url, timeout = 3500) {
  return new Promise((resolve) => {
    if (!url || typeof Image === 'undefined') return resolve(false);
    const img = new Image();
    let done = false;
    const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
    const t = setTimeout(() => finish(false), timeout);
    img.onload = () => { clearTimeout(t); finish(img.naturalWidth > 0); };
    img.onerror = () => { clearTimeout(t); finish(false); };
    img.decoding = 'async';
    img.src = url;
  });
}

/** Keep only the models whose image actually loads (checks up to `limit`). */
export async function filterLoadable(models, { limit = 24 } = {}) {
  const subset = (models || []).slice(0, limit);
  const oks = await Promise.all(subset.map((m) => imageLoads(m.image)));
  return subset.filter((_, i) => oks[i]);
}

// ---------------------------------------------------------------------------
// Relevance filtering
//
// CGTrader full-text search is loose — e.g. "name plate sign" is dominated by
// diamond-jewelry CAD renders. Each live category gets a set of topic terms
// (regex fragments, case-insensitive); a model stays only if its
// title + description + category slugs match at least one term. Models
// matching more terms sort first (upstream order preserved within a score).
//
// A category with no entry (legacy seeds) or an empty list ('All') skips the
// topic check — only the global blocklist applies.

const TOPIC_FILTERS = {
  'Photo Gifts': [
    'lithophane', 'litho', '\\bphoto', 'picture', 'frame', '\\blamp',
    'lantern', 'night ?light', 'keepsake', 'memory',
  ],
  'Home Decor': [
    'decor', '\\bvase', 'planter', 'sculpture', 'statue', '\\bwall\\b',
    'candle', 'bookend', 'ornament', '\\bhome\\b', 'figurine', 'pot\\b', 'lamp',
  ],
  'Personalized Text': [
    'name', '\\bsign', 'plaque', 'letter', '\\btext\\b', 'nameplate',
    '\\btag\\b', '\\bword\\b', 'alphabet', 'monogram', 'initial',
  ],
  'Couple & Anniversary': [
    'heart', 'couple', '\\blove\\b', 'valentine', 'romantic', 'wedding',
    'anniversary', '\\bhug', 'kiss', '\\brose',
  ],
  'Kids & Baby': [
    '\\btoy', '\\bkid', 'baby', 'cartoon', 'figurine', 'chibi', '\\bcute',
    'dino', 'child', 'nursery', 'rattle', 'plush', 'kawaii',
  ],
  'Corporate': [
    'desk', 'organizer', 'trophy', 'pen ?holder', 'award', 'office',
    'plaque', 'business card', 'card holder', 'stand', 'medal',
  ],
  'Festive': [
    'christmas', 'diwali', 'ornament', 'festive', 'holiday', 'santa',
    'diya', 'rangoli', 'easter', 'halloween', 'snowman', 'reindeer',
    'wreath', 'garland', 'xmas', 'new year',
  ],
  'Everyday Utility': [
    'organizer', 'holder', '\\bstand', 'hook', 'hanger', 'tray', '\\bbox',
    'dock', 'mount', 'caddy', '\\brack', 'container', 'opener', 'clip',
  ],
  'All': [],
};

// Rejected regardless of category (matched against title + slugs only —
// descriptions mention e.g. "diamond infill" or "gun-metal grey" too often).
// Jewelry CAD (rings/pendants rendered in gold) additionally gets rejected by
// categorySlug === 'jewelry' — it is not printable-gift material.
const GLOBAL_BLOCKLIST = [
  'nsfw', 'nude', 'naked', 'erotic', 'sexy', 'hentai', 'lingerie',
  '\\bguns?\\b', '\\brifle', '\\bpistol', '\\bfirearm', '\\bgrenade',
  '\\brevolver', 'knife blade', '\\bammo\\b',
  '\\bpendant', '\\bnecklace',
].map((fragment) => new RegExp(fragment, 'i'));

const compiledTopicTerms = new Map();

function getTopicTerms(categoryName) {
  if (!compiledTopicTerms.has(categoryName)) {
    const fragments = TOPIC_FILTERS[categoryName] || [];
    compiledTopicTerms.set(
      categoryName,
      fragments.map((fragment) => new RegExp(fragment, 'i'))
    );
  }
  return compiledTopicTerms.get(categoryName);
}

function isBlocked(model) {
  if (model.isAdultContent) return true;
  if (model.categorySlug === 'jewelry') return true;
  const haystack =
    `${model.title} ${model.categorySlug} ${model.subcategorySlug}`.toLowerCase();
  return GLOBAL_BLOCKLIST.some((term) => term.test(haystack));
}

// Number of topic terms the model matches; -1 when it matches none (and at
// least one was required). An empty term list means "no topic requirement".
function topicScore(model, terms) {
  if (!terms.length) return 0;
  const haystack =
    `${model.title} ${model.description} ${model.categorySlug} ${model.subcategorySlug}`.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (term.test(haystack)) score += 1;
  }
  return score > 0 ? score : -1;
}

// ---------------------------------------------------------------------------
// Normalization

function toAbsoluteUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${CGTRADER_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Raw descriptions are seller-authored and may contain HTML tags, entities,
// and heavy whitespace/markdown noise.
function toPlainDescription(raw) {
  const text = String(raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&(?:quot|#0?34);/gi, '"')
    .replace(/&(?:apos|#0?39);/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  const cut = text.slice(0, DESCRIPTION_MAX_LENGTH + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : DESCRIPTION_MAX_LENGTH).trimEnd()}…`;
}

function normalizeModel(item) {
  const attrs = item?.attributes || {};
  const price = Number(attrs.price) || 0;
  const formats = Array.isArray(attrs.metaverseFormatsList)
    ? attrs.metaverseFormatsList
        .map((f) => String(f?.name || '').replace(/^\./, '').toLowerCase())
        .filter(Boolean)
    : [];

  const image =
    attrs.primaryImage?.gridUrl ||
    attrs.primaryImage?.gridFallbackUrl ||
    attrs.schemaImageUrl ||
    '';

  return {
    id: attrs.id ?? item?.id,
    title: (attrs.title || '').trim(),
    url: toAbsoluteUrl(attrs.url || attrs.modelInfo?.modelUrl),
    image,
    // schemaImageUrl is the highest-res variant (~1448px vs ~612px grid).
    imageLarge: attrs.schemaImageUrl || image,
    description: toPlainDescription(attrs.description),
    price, // USD
    isFree: price === 0,
    printReady: Boolean(attrs.modelInfo?.types?.printReady),
    formats,
    categorySlug: attrs.categorySlug || '',
    subcategorySlug: attrs.subcategorySlug || '',
    isAdultContent: Boolean(attrs.primaryImage?.isAdultContent),
  };
}

// ---------------------------------------------------------------------------
// Caching (sessionStorage, 1h TTL) + in-flight request dedupe

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || Date.now() - entry.t > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.v;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // Storage full or unavailable — caching is best-effort.
  }
}

const inFlight = new Map();

// ---------------------------------------------------------------------------
// Public API

export async function searchCGTraderModels(keywords, { page = 1 } = {}) {
  const query = String(keywords || '').trim();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const cacheKey = `${CACHE_PREFIX}${query.toLowerCase()}:${pageNum}`;

  const cached = readCache(cacheKey);
  if (cached) return cached;

  if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);

  const promise = (async () => {
    try {
      const params = new URLSearchParams({
        keywords: query,
        page: String(pageNum),
        print_ready: '1',
        free: '1', // only surface free designs (we sell the printing, not the file)
      });
      const response = await fetch(`/api/cgtrader?${params}`, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        let message = `CGTrader proxy returned ${response.status}`;
        try {
          const body = await response.json();
          if (body?.error) message = body.error;
        } catch {
          // Non-JSON error body — keep the status message.
        }
        throw new Error(message);
      }

      const json = await response.json();
      const items = Array.isArray(json?.data) ? json.data : [];
      const models = items
        .map(normalizeModel)
        .filter((m) => m.id && m.title && m.url && m.image);

      const result = {
        models,
        total: Number(json?.meta?.totalCount) || models.length,
        page: Number(json?.meta?.currentPage) || pageNum,
        source: 'cgtrader',
      };
      writeCache(cacheKey, result);
      return result;
    } catch (err) {
      return {
        models: [],
        total: 0,
        page: pageNum,
        source: 'error',
        error: err?.message || 'CGTrader search failed',
      };
    } finally {
      inFlight.delete(cacheKey);
    }
  })();

  inFlight.set(cacheKey, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// Topic-filtered category feed
//
// Fetches up to `pagesToScan` upstream pages (clamped to 1..3; each page is
// sessionStorage-cached, so re-scans are cheap), drops models that fail the
// global blocklist or the category's topic terms, dedupes by id, and sorts
// stronger topic matches first. With `searchOverride` (user typed their own
// query) only the global blocklist applies.
// Never throws: -> { models, scannedPages, hasMore, error? }

export async function getCategorySampleModels(
  categoryName,
  { pagesToScan = 1, searchOverride = '' } = {}
) {
  try {
    const override = String(searchOverride).trim();
    const keywords = override || categoryToKeywords(categoryName);
    const maxPages = Math.min(
      MAX_PAGES_TO_SCAN,
      Math.max(1, parseInt(pagesToScan, 10) || 1)
    );
    const terms = override ? [] : getTopicTerms(categoryName);

    const seen = new Set();
    const kept = [];
    let scannedPages = 0;
    let lastPage = null;

    for (let page = 1; page <= maxPages; page += 1) {
      const result = await searchCGTraderModels(keywords, { page });
      if (result.error) {
        if (page === 1) {
          return { models: [], scannedPages: 1, hasMore: false, error: result.error };
        }
        break; // page 1 succeeded — return what we have, no error
      }
      scannedPages = page;
      lastPage = result;
      for (const model of result.models) {
        if (seen.has(model.id)) continue;
        seen.add(model.id);
        if (isBlocked(model)) continue;
        if (!model.isFree) continue; // free designs only
        const score = topicScore(model, terms);
        if (score < 0) continue;
        kept.push({ model, score });
      }
      if (result.models.length === 0) break; // upstream exhausted
    }

    // Stable by spec (ES2019+): equal scores keep upstream order.
    kept.sort((a, b) => b.score - a.score);

    const hasMore =
      scannedPages < MAX_PAGES_TO_SCAN &&
      Boolean(lastPage) &&
      (lastPage.models.length >= FULL_PAGE_THRESHOLD ||
        lastPage.total > scannedPages * UPSTREAM_PAGE_SIZE);

    return {
      models: kept.map((entry) => entry.model),
      scannedPages,
      hasMore,
    };
  } catch (err) {
    return {
      models: [],
      scannedPages: 1,
      hasMore: false,
      error: err?.message || 'CGTrader category feed failed',
    };
  }
}
