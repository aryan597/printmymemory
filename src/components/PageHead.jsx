import { useEffect } from 'react';

const SITE = 'PrintMyMemory';
const BASE_URL = 'https://printmymemory.ind.in';
const DEFAULT_DESC = 'Turn your favourite photos into personalized 3D printed gifts. Custom miniatures, lithophane lamps, keychains and more. Handcrafted in Bangalore, India.';
const DEFAULT_IMAGE = `${BASE_URL}/logo.png`;

/**
 * Lightweight page-level SEO. Sets document title + meta tags.
 * No external dependency needed.
 *
 * Usage: <PageHead title="Shop" description="Browse all products" />
 */
export default function PageHead({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  path = '',
  noIndex = false,
}) {
  const fullTitle = title ? `${title} | ${SITE}` : `${SITE} - Turn Your Memories Into Personalized 3D Gifts`;
  const url = `${BASE_URL}${path}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('property', 'twitter:title', fullTitle);
    setMeta('property', 'twitter:description', description);
    setMeta('property', 'twitter:image', image);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    if (noIndex) {
      setMeta('name', 'robots', 'noindex, nofollow');
    } else {
      const el = document.querySelector('meta[name="robots"]');
      if (el) el.remove();
    }

    // Cleanup on unmount: restore defaults
    return () => {
      document.title = `${SITE} - Turn Your Memories Into Personalized 3D Gifts`;
    };
  }, [fullTitle, description, url, image, noIndex]);

  return null;
}
