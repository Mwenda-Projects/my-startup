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
    const { phone_number, amount, transaction_id } = await req.json();

    // Validate inputs
    if (!phone_number || !amount || !transaction_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: phone_number, amount, transaction_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get M-Pesa credentials from environment
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET');
    const passkey = Deno.env.get('MPESA_PASSKEY');
    const shortcode = Deno.env.get('MPESA_SHORTCODE');
    const callbackUrl = Deno.env.get('MPESA_CALLBACK_URL');

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      console.error('M-Pesa credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get OAuth token
    const auth = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenResponse = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        method: 'GET',
        headers: { 'Authorization': `Basic ${auth}` }
      }
    );

    if (!tokenResponse.ok) {
      console.error('Failed to get M-Pesa token:', await tokenResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with payment provider' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { access_token } = await tokenResponse.json();

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // Format phone number (ensure it's in 254 format)
    let formattedPhone = phone_number.replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    // Build callback URL with transaction ID
    const fullCallbackUrl = callbackUrl || `${Deno.env.get('SUPABASE_URL')}/functions/v1/mpesa-callback`;

    // Initiate STK Push
    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.ceil(amount),
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: fullCallbackUrl,
          AccountReference: transaction_id.slice(0, 12),
          TransactionDesc: 'CampusMarket Payment'
        })
      }
    );

    const stkResult = await stkResponse.json();
    console.log('STK Push response:', stkResult);

    if (stkResult.ResponseCode !== '0') {
      return new Response(
        JSON.stringify({ 
          error: stkResult.ResponseDescription || 'Failed to initiate payment',
          details: stkResult
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction with checkout request ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase
      .from('transactions')
      .update({ 
        mpesa_checkout_request_id: stkResult.CheckoutRequestID,
        payment_method: 'mpesa'
      })
      .eq('id', transaction_id);

    return new Response(
      JSON.stringify({
        success: true,
        checkout_request_id: stkResult.CheckoutRequestID,
        merchant_request_id: stkResult.MerchantRequestID,
        message: 'Please check your phone for the M-Pesa prompt'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('STK Push error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
