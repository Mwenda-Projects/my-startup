import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { referral_code } = await req.json();
    if (!referral_code) {
      return new Response(JSON.stringify({ error: "Referral code is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has a referrer
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", user.id)
      .single();

    if (currentProfile?.referred_by) {
      return new Response(JSON.stringify({ error: "You have already used a referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the referrer by code
    const { data: referrer, error: referrerError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("referral_code", referral_code.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      return new Response(JSON.stringify({ error: "Invalid referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Can't refer yourself
    if (referrer.id === user.id) {
      return new Response(JSON.stringify({ error: "You cannot use your own referral code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the user's profile with referrer
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ referred_by: referrer.id })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(JSON.stringify({ error: "Failed to apply referral code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create referral record
    const { error: referralError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrer.id,
        referred_id: user.id,
        status: "pending",
        credit_amount: 50, // KSH 50 credit
      });

    if (referralError) {
      console.error("Error creating referral:", referralError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Referral code applied! ${referrer.full_name || 'Your friend'} will earn KSH 50 when you complete your first purchase.`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
