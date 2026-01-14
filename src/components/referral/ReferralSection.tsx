import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Copy, Gift, Users, CheckCircle, Loader2 } from "lucide-react";

interface ReferralSectionProps {
  referralCode: string | null;
  referredBy?: string | null;
  onCodeApplied?: () => void;
}

const ReferralSection = ({ referralCode, referredBy, onCodeApplied }: ReferralSectionProps) => {
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);

  const copyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const shareReferral = () => {
    const text = `Join HustleSphere using my referral code: ${referralCode} and we both earn rewards when you make your first purchase!`;
    const url = `${window.location.origin}/auth?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({ title: "Join HustleSphere", text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const applyReferralCode = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "Enter a code",
        description: "Please enter a referral code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke("apply-referral-code", {
        body: { referral_code: inputCode.trim() },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data as { message: string };
      toast({
        title: "Success!",
        description: data.message,
      });
      setInputCode("");
      onCodeApplied?.();
    } catch (error: any) {
      toast({
        title: "Failed to apply code",
        description: error.message || "Invalid referral code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Your Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your code with friends. You'll earn KSH 50 when they complete their first purchase!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-wider text-center">
              {referralCode || "Loading..."}
            </div>
            <Button variant="outline" size="icon" onClick={copyCode} disabled={!referralCode}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={shareReferral} className="w-full gap-2" disabled={!referralCode}>
            <Users className="w-4 h-4" />
            Share with Friends
          </Button>
        </CardContent>
      </Card>

      {/* Apply Referral Code */}
      {!referredBy && (
        <Card>
          <CardHeader>
            <CardTitle>Have a Referral Code?</CardTitle>
            <CardDescription>
              Enter a friend's referral code. They'll earn KSH 50 when you complete your first purchase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referral-code">Referral Code</Label>
              <Input
                id="referral-code"
                placeholder="Enter code (e.g., ABC12345)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="uppercase"
              />
            </div>
            <Button onClick={applyReferralCode} className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply Code
            </Button>
          </CardContent>
        </Card>
      )}

      {referredBy && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>You were referred by a friend! Complete a purchase to unlock their reward.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralSection;
