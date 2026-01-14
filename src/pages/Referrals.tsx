import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ReferralSection from "@/components/referral/ReferralSection";
import { Gift, Users, CheckCircle, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Referral {
  id: string;
  status: string;
  credit_amount: number;
  credited_at: string | null;
  created_at: string;
  referred: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReferralStats {
  total_referrals: number;
  pending_referrals: number;
  credited_referrals: number;
  total_earned: number;
}

const Referrals = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's referral code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code, referred_by")
        .eq("id", user.id)
        .single();

      if (profile) {
        setReferralCode(profile.referral_code);
        setReferredBy(profile.referred_by);
      }

      // Fetch referrals made by this user
      const { data: referralsData } = await supabase
        .from("referrals")
        .select("id, status, credit_amount, credited_at, created_at, referred_id")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsData) {
        // Fetch referred user profiles
        const referredIds = referralsData.map((r) => r.referred_id);
        const { data: profiles } = await supabase
          .from("public_profiles")
          .select("id, full_name, avatar_url")
          .in("id", referredIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        const enrichedReferrals = referralsData.map((r) => ({
          ...r,
          referred: profileMap.get(r.referred_id) || null,
        }));

        setReferrals(enrichedReferrals);

        // Calculate stats
        const credited = referralsData.filter((r) => r.status === "credited");
        setStats({
          total_referrals: referralsData.length,
          pending_referrals: referralsData.filter((r) => r.status === "pending").length,
          credited_referrals: credited.length,
          total_earned: credited.reduce((sum, r) => sum + Number(r.credit_amount), 0),
        });
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Referral Program</h1>
            <p className="text-muted-foreground mt-2">
              Invite friends and earn KSH 50 for each friend who completes a purchase
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stats.total_referrals}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{stats.pending_referrals}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{stats.credited_referrals}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Gift className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">KSH {stats.total_earned}</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="share" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="share">Share & Earn</TabsTrigger>
              <TabsTrigger value="history">Referral History</TabsTrigger>
            </TabsList>

            <TabsContent value="share">
              <ReferralSection
                referralCode={referralCode}
                referredBy={referredBy}
                onCodeApplied={fetchData}
              />
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referrals</CardTitle>
                  <CardDescription>
                    Track the status of people you've referred
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {referrals.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No referrals yet</p>
                      <p className="text-sm">Share your code to start earning!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {referrals.map((referral) => (
                        <div
                          key={referral.id}
                          className="flex items-center gap-4 p-4 rounded-lg border"
                        >
                          <Avatar>
                            <AvatarImage src={referral.referred?.avatar_url || ""} />
                            <AvatarFallback>
                              {getInitials(referral.referred?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {referral.referred?.full_name || "Anonymous User"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Joined {formatDistanceToNow(new Date(referral.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="text-right">
                            {referral.status === "credited" ? (
                              <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                +KSH {referral.credit_amount}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Referrals;
