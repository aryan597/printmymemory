/**
 * design-assistant Edge Function
 * Receives: { prompt, imageBase64?, imageMediaType? }
 * Returns:  { reply, matchedProduct?, nextAction?, confidence? }
 *
 * Deploy: supabase functions deploy design-assistant --project-ref aqkvpcbocxdiobyuowsd
 * Secret: supabase secrets set GEMINI_API_KEY=<key> --project-ref aqkvpcbocxdiobyuowsd
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/** Extract JSON from Gemini response that may be wrapped in markdown, thinking tags, etc. */
function extractJSON(raw: string): any {
  // Try direct parse first
  try { return JSON.parse(raw); } catch {}

  // Strip markdown code fences
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

  // Strip <think>...</think> tags (Gemini 2.5 sometimes adds these)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // Find the first { ... } block
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY secret not set');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const body = await req.json();
    const { prompt, imageBase64, imageMediaType, debug } = body;
    const history = Array.isArray(body.history) ? body.history : [];

    if (!prompt && !imageBase64) {
      return new Response(JSON.stringify({ error: 'prompt or image required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Fetch products ---
    const { data: products, error: prodErr } = await db
      .from('products')
      .select('id, name, description, price, image, category_id, product_type')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (prodErr) throw new Error(`Products fetch failed: ${prodErr.message}`);
    if (!products?.length) throw new Error('No active products found.');

    // --- Fetch categories ---
    const { data: categories } = await db.from('categories').select('id, name, slug');
    const catMap = Object.fromEntries((categories ?? []).map((c: any) => [c.id, c.name]));

    // --- Fetch customization configs ---
    let configs: any[] = [];
    const { data: cfgData, error: cfgErr } = await db
      .from('product_customization_configs')
      .select('product_id, field_key, field_type, field_label, options, is_required, sort_order')
      .order('sort_order', { ascending: true });
    if (!cfgErr) configs = cfgData ?? [];

    const productCatalog = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      category: catMap[p.category_id] ?? '',
      type: p.product_type,
      configs: configs.filter((c: any) => c.product_id === p.id),
    }));

    // Debug mode
    if (debug) {
      return new Response(
        JSON.stringify({ productCatalog, configsCount: configs.length }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // --- Gemini system prompt ---
    const systemPrompt = `You are a design consultant at PrintMyMemory, a Bangalore-based 3D printing studio. You talk like a real person who works here, not a bot. You know 3D printing inside out.

WHAT WE MAKE (product catalog):
${JSON.stringify(productCatalog.map(p => ({ id: p.id, name: p.name, description: p.description, price: p.price, category: p.category, type: p.type })), null, 2)}

HOW TO BEHAVE:
- You are "PrintMyMemory" speaking directly. Use "we" not "they". Example: "We can definitely make that for you!"
- Be warm, enthusiastic, and specific. Repeat back what the customer asked so they know you understood. For example if they say "keychain with Aryan on it", say something like "A custom keychain with 'Aryan' engraved on it? We'd love to make that for you!"
- This is a CONVERSATION. Read the earlier turns. Do not repeat questions you already asked. Build on what the customer already told you.
- When the request is vague, ask ONE friendly clarifying question to move it forward (who is it for, size, colour, quantity, a photo, or the text to engrave). Ask only what you still need.
- YOUR JOB IS TO FIND THEM SOMETHING TO PRINT, not to defer. Always point to concrete products or designs. WhatsApp is the LAST step to finalise a bespoke order, never your first answer.
- Match EVERY catalog product that could fit (up to 3, best first) by comparing the request to product NAMES and DESCRIPTIONS. Near-name matches count: if they say "customized lamp" and a product is named "Customized Lamp", that IS a match and must be included. Do not miss obvious matches.
- ALWAYS provide 2 to 4 short, generic, object-focused searchKeywords for the thing they want (e.g. "lithophane lamp photo", "dog figurine", "hexagon shelf") so we can pull matching printable designs from our design library. Give keywords even when you also matched a catalog product.
- If the idea is 3D printable but nothing in the catalog fits, that is fine. Reassure them we can print it, and rely on the searchKeywords to surface designs. Only mention WhatsApp once options have been shown and the piece is genuinely custom.
- If the customer sends an image, describe what you see and suggest what we could create from it, plus searchKeywords for it.
- Keep replies to 2-4 sentences. No em dashes. Use periods and commas only.
- Sound human. Don't say "I'm an AI" or "based on our catalog". Just talk naturally.

RESPOND WITH ONLY THIS JSON (no markdown, no code fences, no extra text):
{"reply":"your message","productIds":[NUMBERS],"searchKeywords":"2 to 4 words","nextAction":"show_products|ask_clarify|chat_whatsapp","confidence":"high|medium|low"}

productIds: catalog product ids that fit, 0 to 3, best first. Empty array if none fit.
searchKeywords: always fill this for any printable request (object-focused words).
nextAction: "show_products" when you have products or designs to show (the default), "ask_clarify" when you asked a question and need their answer, "chat_whatsapp" only for a finalised bespoke handoff.`;

    // --- Build multi-turn contents (system_instruction + history + current) ---
    const contents: any[] = [];
    for (const m of history) {
      const text = m?.text ?? m?.content;
      if (!text) continue;
      const role = (m.role === 'model' || m.role === 'ai' || m.role === 'assistant') ? 'model' : 'user';
      contents.push({ role, parts: [{ text: String(text) }] });
    }

    const currentParts: any[] = [{ text: prompt || 'I uploaded an image. What can you make from this?' }];
    if (imageBase64 && imageMediaType) {
      currentParts.push({ inline_data: { mime_type: imageMediaType, data: imageBase64 } });
    }
    contents.push({ role: 'user', parts: currentParts });

    // --- Call Gemini ---
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error('[design-assistant] Gemini error:', err);
      throw new Error(`AI service error (${geminiRes.status})`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    console.log('[design-assistant] Gemini raw:', rawText.slice(0, 500));

    const parsed = extractJSON(rawText);

    if (!parsed || !parsed.reply) {
      console.error('[design-assistant] Failed to parse Gemini response:', rawText);
      // Try to extract just the reply value from malformed JSON
      let fallbackReply = 'We can definitely help you with that! Send us a message on WhatsApp and our team will work with you on the details.';
      const replyMatch = rawText.match(/"reply"\s*:\s*"([^"]+)"/);
      if (replyMatch) {
        fallbackReply = replyMatch[1];
      }
      return new Response(
        JSON.stringify({
          reply: fallbackReply,
          products: [],
          matchedProduct: null,
          searchKeywords: (prompt || '').split(/\s+/).slice(0, 4).join(' '),
          nextAction: 'show_products',
          confidence: 'low',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // --- Enrich matched products (up to 3) with full data ---
    const ids = Array.isArray(parsed.productIds)
      ? parsed.productIds
      : (parsed.matchedProduct?.id ? [parsed.matchedProduct.id] : []);
    const matched = ids
      .map((id: any) => productCatalog.find((p) => p.id === Number(id)))
      .filter(Boolean)
      .slice(0, 3);

    return new Response(
      JSON.stringify({
        reply: parsed.reply,
        products: matched,
        matchedProduct: matched[0] ?? null, // back-compat
        searchKeywords: parsed.searchKeywords ?? '',
        nextAction: parsed.nextAction ?? 'show_products',
        confidence: parsed.confidence ?? 'low',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('[design-assistant] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message ?? 'Something went wrong' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
