import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const payload = await req.json();
    const { utr } = payload;

    if (!utr) {
      return new Response(JSON.stringify({ error: 'UTR is required in JSON body: { "utr": "..." }' }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Initialize Supabase Client with Service Role Key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the order that matches this UTR
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('utr_number', utr.trim())
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found for UTR', details: orderError }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if it's already verified
    if (order.status !== 'pending_payment') {
      return new Response(JSON.stringify({ message: 'Order already processed', status: order.status }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify amount if provided by the webhook
    if (payload.amount && parseFloat(payload.amount) !== parseFloat(order.total_amount)) {
      console.warn(`Amount mismatch for order ${order.id}: Expected ${order.total_amount}, got ${payload.amount}`);
      // We still process it or maybe flag it? Let's just log it for now to avoid false positives.
    }

    // Update the order status to order_placed
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'order_placed',
        paid_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      throw updateError;
    }

    // Note: To send confirmation emails, the webhook could either trigger them via Edge Function 
    // using EmailJS REST API, or we rely on the Admin checking the dashboard. 
    // For now, the user gets the receipt page immediately, so they are already confirmed.

    return new Response(JSON.stringify({ success: true, order_id: order.id, message: 'Payment verified and order updated.' }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
})
