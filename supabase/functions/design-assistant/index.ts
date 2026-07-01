/**
 * design-assistant Edge Function
 * Receives: { prompt, imageBase64?, imageMediaType? }
 * Returns:  { reply, matchedProduct?, customizationType?, fields? }
 *
 * Deploy: supabase functions deploy design-assistant --project-ref svaceoqmieqnvfxnjjdn
 * Secret: supabase secrets set GEMINI_API_KEY=<your_key> --project-ref svaceoqmieqnvfxnjjdn
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY secret not set');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    console.log('[design-assistant] SUPABASE_URL:', SUPABASE_URL);
    console.log('[design-assistant] Has service key:', !!SUPABASE_SERVICE_KEY);

    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // --- Parse request ---
    const body = await req.json();
    const { prompt, imageBase64, imageMediaType, debug } = body;

    if (!prompt && !imageBase64) {
      return new Response(JSON.stringify({ error: 'prompt or image required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Fetch active products ---
    const { data: products, error: prodErr } = await db
      .from('products')
      .select('id, name, description, price, image, category_id, product_type')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    console.log('[design-assistant] Products fetched:', products?.length ?? 0, 'error:', prodErr?.message ?? 'none');

    if (prodErr) throw new Error(`Products fetch failed: ${prodErr.message}`);
    if (!products || products.length === 0) {
      throw new Error(`No active products found. Check that products table has is_active=true rows.`);
    }

    // --- Fetch categories ---
    const { data: categories, error: catErr } = await db
      .from('categories')
      .select('id, name, slug');

    console.log('[design-assistant] Categories fetched:', categories?.length ?? 0, 'error:', catErr?.message ?? 'none');

    const catMap = Object.fromEntries((categories ?? []).map((c: any) => [c.id, c.name]));

    // --- Fetch customization configs (may not exist yet) ---
    let configs: any[] = [];
    const { data: cfgData, error: cfgErr } = await db
      .from('product_customization_configs')
      .select('product_id, field_key, field_type, field_label, options, is_required, sort_order')
      .order('sort_order', { ascending: true });

    console.log('[design-assistant] Configs fetched:', cfgData?.length ?? 0, 'error:', cfgErr?.message ?? 'none');

    if (!cfgErr) configs = cfgData ?? [];

    const productCatalog = (products ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: catMap[p.category_id] ?? '',
      type: p.product_type,
      configs: configs.filter((c: any) => c.product_id === p.id),
    }));

    console.log('[design-assistant] Catalog built:', productCatalog.length, 'products');

    // Debug mode: return catalog without calling Gemini
    if (debug) {
      return new Response(
        JSON.stringify({ productCatalog, configsCount: configs.length }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // --- Build Gemini prompt ---
    const systemContext = `You are a helpful design assistant for PrintMyMemory, a Bangalore-based 3D printing gift shop.

PRODUCT CATALOG (JSON):
${JSON.stringify(productCatalog, null, 2)}

CUSTOMIZATION TYPES:
- photo_upload: customer needs to upload a photo (lithophanes, face miniatures, couple gifts with photos)
- text: customer needs to provide text (name plates, keychains with names, custom text)
- ams_color: customer picks colors from our AMS multi-color printer palette
- select / color_picker: customer picks from predefined options

YOUR JOB:
1. Understand what the customer wants from their message (and optional image).
2. Match them to the best product from the catalog above (by id and name).
3. Determine what customization is needed.
4. Reply in a friendly, concise way (2-4 sentences max). No em dashes. Use "." or "," not "—".
5. Return structured JSON with your response.

RESPONSE FORMAT (strict JSON, no markdown fences):
{
  "reply": "friendly message to customer",
  "matchedProduct": { "id": <number>, "name": "<string>" } | null,
  "nextAction": "upload_photo" | "enter_text" | "pick_color" | "view_catalog" | "none",
  "confidence": "high" | "medium" | "low"
}

If you cannot match a product or the request is unclear, set matchedProduct to null and nextAction to "view_catalog".
If the request is completely off-topic (not about gifts or printing), politely redirect.`;

    // --- Build Gemini content parts ---
    const parts: any[] = [{ text: `${systemContext}\n\nCUSTOMER: ${prompt || 'I uploaded an image, what can you make from this?'}` }];

    if (imageBase64 && imageMediaType) {
      parts.push({
        inline_data: {
          mime_type: imageMediaType,
          data: imageBase64,
        },
      });
    }

    // --- Call Gemini ---
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${err}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Gemini occasionally wraps in ```json ... ```, strip it
      const clean = rawText.replace(/```json\n?|\n?```/g, '').trim();
      try { parsed = JSON.parse(clean); } catch { parsed = { reply: rawText }; }
    }

    // --- Enrich with full product + configs if matched ---
    let enrichedProduct = null;
    if (parsed.matchedProduct?.id) {
      enrichedProduct = productCatalog.find((p) => p.id === parsed.matchedProduct.id) ?? null;
    }

    return new Response(
      JSON.stringify({
        reply: parsed.reply ?? 'I can help you create something beautiful!',
        matchedProduct: enrichedProduct,
        nextAction: parsed.nextAction ?? 'none',
        confidence: parsed.confidence ?? 'low',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('design-assistant error:', err);
    return new Response(
      JSON.stringify({ error: err.message ?? 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
