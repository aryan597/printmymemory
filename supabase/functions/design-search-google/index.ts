/**
 * design-search-google Edge Function
 * Searches Google Custom Search API and fetches Open Graph metadata for the results.
 * 
 * Requires ENV vars:
 * - GOOGLE_API_KEY
 * - GOOGLE_CSE_ID
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    const GOOGLE_CSE_ID = Deno.env.get('GOOGLE_CSE_ID');

    if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
      return new Response(JSON.stringify({ 
        error: 'Google Custom Search is not configured. Please set GOOGLE_API_KEY and GOOGLE_CSE_ID.' 
      }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call Google Custom Search API
    const gSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=10`;
    const gRes = await fetch(gSearchUrl);
    
    if (!gRes.ok) {
      const errText = await gRes.text();
      console.error('Google API Error:', errText);
      throw new Error('Google Search API request failed');
    }

    const gData = await gRes.json();
    const items = gData.items || [];

    // Map Google results to our Model format
    const models = items.map((item: any) => {
      // Extract OG image from Google's pagemap if available
      const pagemap = item.pagemap || {};
      const cseImage = pagemap.cse_image?.[0]?.src || pagemap.metatags?.[0]?.['og:image'] || '';
      
      return {
        id: item.link, // Use link as ID since it's unique
        title: item.title,
        description: item.snippet,
        image: cseImage,
        url: item.link,
        printReady: true, // We assume true for these niche 3D printing sites
        publisher: item.displayLink
      };
    });

    return new Response(JSON.stringify({ models, hasMore: false }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Search error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
