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
    const africastalkingApiKey = Deno.env.get("AFRICASTALKING_API_KEY");
    const africastalkingUsername = Deno.env.get("AFRICASTALKING_USERNAME");

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

    const { phone_number } = await req.json();
    if (!phone_number) {
      return new Response(JSON.stringify({ error: "Phone number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code in database
    const { error: insertError } = await supabase
      .from("phone_verification_codes")
      .insert({
        user_id: user.id,
        phone_number,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    if (insertError) {
      console.error("Error storing verification code:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create verification code" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send SMS via Africa's Talking (common for Kenya)
    if (africastalkingApiKey && africastalkingUsername) {
      try {
        const response = await fetch("https://api.africastalking.com/version1/messaging", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "apiKey": africastalkingApiKey,
          },
          body: new URLSearchParams({
            username: africastalkingUsername,
            to: phone_number,
            message: `Your HustleSphere verification code is: ${code}. Valid for 10 minutes.`,
          }),
        });

        const smsResult = await response.json();
        console.log("SMS sent:", smsResult);
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
        // Continue anyway - code is stored and can be verified manually for testing
      }
    } else {
      console.log("SMS provider not configured. Verification code:", code);
      // For development/testing, we still return success
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent",
        // Only include code in development for testing
        ...(Deno.env.get("ENVIRONMENT") === "development" && { debug_code: code })
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
