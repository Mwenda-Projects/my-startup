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
    const body = await req.json();
    console.log('M-Pesa callback received:', JSON.stringify(body, null, 2));

    const stkCallback = body?.Body?.stkCallback;
    
    if (!stkCallback) {
      console.error('Invalid callback structure');
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const merchantRequestId = stkCallback.MerchantRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Parse callback metadata
    let amount = null;
    let mpesaReceiptNumber = null;
    let transactionDate = null;
    let phoneNumber = null;

    if (resultCode === 0 && stkCallback.CallbackMetadata?.Item) {
      for (const item of stkCallback.CallbackMetadata.Item) {
        switch (item.Name) {
          case 'Amount':
            amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            transactionDate = String(item.Value);
            break;
          case 'PhoneNumber':
            phoneNumber = String(item.Value);
            break;
        }
      }
    }

    // Store callback in mpesa_callbacks table
    const { error: callbackError } = await supabase
      .from('mpesa_callbacks')
      .insert({
        checkout_request_id: checkoutRequestId,
        merchant_request_id: merchantRequestId,
        result_code: resultCode,
        result_desc: resultDesc,
        amount,
        mpesa_receipt_number: mpesaReceiptNumber,
        transaction_date: transactionDate,
        phone_number: phoneNumber,
        raw_callback: body,
        processed: false
      });

    if (callbackError) {
      console.error('Error storing callback:', callbackError);
    }

    // If payment was successful, update transaction and process escrow
    if (resultCode === 0 && mpesaReceiptNumber) {
      // Find the transaction by checkout request ID
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('id, amount, seller_id')
        .eq('mpesa_checkout_request_id', checkoutRequestId)
        .single();

      if (txError || !transaction) {
        console.error('Transaction not found for checkout:', checkoutRequestId);
      } else {
        // Call the add_to_escrow function
        const { error: escrowError } = await supabase.rpc('add_to_escrow', {
          _transaction_id: transaction.id,
          _checkout_request_id: checkoutRequestId,
          _receipt_number: mpesaReceiptNumber
        });

        if (escrowError) {
          console.error('Error adding to escrow:', escrowError);
        } else {
          console.log('Payment processed successfully for transaction:', transaction.id);
        }

        // Mark callback as processed
        await supabase
          .from('mpesa_callbacks')
          .update({ processed: true })
          .eq('checkout_request_id', checkoutRequestId);
      }
    }

    // Return success response to Safaricom
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Callback processing error:', error);
    return new Response(
      JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
