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

    const { code, phone_number } = await req.json();
    if (!code || !phone_number) {
      return new Response(JSON.stringify({ error: "Code and phone number are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the verification code
    const { data: verificationRecord, error: findError } = await supabase
      .from("phone_verification_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("phone_number", phone_number)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (findError || !verificationRecord) {
      return new Response(JSON.stringify({ error: "No valid verification code found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check attempts
    if (verificationRecord.attempts >= 5) {
      return new Response(JSON.stringify({ error: "Too many attempts. Please request a new code." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment attempts
    await supabase
      .from("phone_verification_codes")
      .update({ attempts: verificationRecord.attempts + 1 })
      .eq("id", verificationRecord.id);

    // Verify code
    if (verificationRecord.code !== code) {
      return new Response(JSON.stringify({ error: "Invalid verification code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as verified
    await supabase
      .from("phone_verification_codes")
      .update({ verified: true })
      .eq("id", verificationRecord.id);

    // Update user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone_number,
        phone_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Phone verified successfully" }),
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
