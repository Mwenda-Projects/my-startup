import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, Lock, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";

interface WalletData {
  available_balance: number;
  escrow_balance: number;
  total_earned: number;
  total_fees_paid: number;
}

interface SellerProfile {
  tier: "free" | "premium" | "trusted";
  commission_rate: number;
  completed_orders: number;
  average_rating: number;
  total_ratings: number;
  is_verified: boolean;
}

const tierColors = {
  free: "bg-muted text-muted-foreground",
  premium: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white",
  trusted: "bg-gradient-to-r from-emerald-500 to-teal-400 text-white"
};

const tierLabels = {
  free: "Free Seller",
  premium: "Premium Seller",
  trusted: "Trusted Seller"
};

const WalletCard = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [walletRes, sellerRes] = await Promise.all([
        supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("seller_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()
      ]);

      if (walletRes.data) setWallet(walletRes.data);
      if (sellerRes.data) setSellerProfile(sellerRes.data as SellerProfile);
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Wallet not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seller Tier Badge */}
      {sellerProfile && (
        <div className="flex items-center justify-between">
          <Badge className={tierColors[sellerProfile.tier]}>
            {tierLabels[sellerProfile.tier]}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {sellerProfile.commission_rate}% commission
          </span>
        </div>
      )}

      {/* Main Balance Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-medium opacity-90">
            <Wallet className="w-5 h-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold mb-4">
            KSh {wallet.available_balance.toLocaleString()}
          </p>
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            Withdraw
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Lock className="w-4 h-4" />
              <span className="text-sm">In Escrow</span>
            </div>
            <p className="text-2xl font-semibold">
              KSh {wallet.escrow_balance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Earned</span>
            </div>
            <p className="text-2xl font-semibold">
              KSh {wallet.total_earned.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seller Stats */}
      {sellerProfile && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Seller Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{sellerProfile.completed_orders}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sellerProfile.average_rating > 0 
                  ? sellerProfile.average_rating.toFixed(1) 
                  : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{sellerProfile.total_ratings}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA for Free Sellers */}
      {sellerProfile?.tier === "free" && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4">
            <p className="font-medium mb-1">Upgrade to Premium</p>
            <p className="text-sm text-muted-foreground mb-3">
              Get 6% commission instead of 10% and unlimited listings
            </p>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletCard;
