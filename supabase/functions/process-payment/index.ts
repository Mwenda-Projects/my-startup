import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, transaction_id, listing_id, listing_type, amount, seller_id } = await req.json();

    if (action === 'create_transaction') {
      // Validate inputs
      if (!listing_id || !listing_type || !amount || !seller_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check seller can't buy from themselves
      if (user.id === seller_id) {
        return new Response(
          JSON.stringify({ error: 'You cannot purchase your own listing' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get seller's commission rate
      const { data: sellerProfile } = await supabase
        .from('seller_profiles')
        .select('commission_rate')
        .eq('user_id', seller_id)
        .single();

      const commissionRate = sellerProfile?.commission_rate || 10;
      const platformFee = Math.ceil(amount * (commissionRate / 100));
      const sellerAmount = amount - platformFee;

      // Get listing title
      const table = listing_type === 'item' ? 'items' : 'services';
      const { data: listing } = await supabase
        .from(table)
        .select('title')
        .eq('id', listing_id)
        .single();

      // Create transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          listing_id,
          listing_type,
          listing_title: listing?.title || 'Unknown',
          amount,
          platform_fee: platformFee,
          seller_amount: sellerAmount,
          buyer_id: user.id,
          seller_id,
          status: 'pending_payment'
        })
        .select()
        .single();

      if (txError) {
        console.error('Error creating transaction:', txError);
        return new Response(
          JSON.stringify({ error: 'Failed to create transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ transaction }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'confirm_delivery') {
      if (!transaction_id) {
        return new Response(
          JSON.stringify({ error: 'Transaction ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transaction_id)
        .single();

      if (txError || !transaction) {
        return new Response(
          JSON.stringify({ error: 'Transaction not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check authorization
      if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Not authorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

      if (transaction.seller_id === user.id) {
        updates.seller_confirmed_delivery = true;
        updates.delivered_at = new Date().toISOString();
        updates.status = 'delivered';
      }

      if (transaction.buyer_id === user.id) {
        updates.buyer_confirmed = true;
      }

      // If both confirmed, complete the transaction
      const willComplete = 
        (transaction.seller_id === user.id && transaction.buyer_confirmed) ||
        (transaction.buyer_id === user.id && transaction.seller_confirmed_delivery);

      if (willComplete) {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
        updates.escrow_released_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transaction_id);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update transaction' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, completed: willComplete }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Process payment error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
