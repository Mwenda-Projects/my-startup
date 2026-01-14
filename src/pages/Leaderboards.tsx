import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BadgeDisplay from "@/components/badges/BadgeDisplay";
import { Link } from "react-router-dom";
import { Trophy, Medal, Award, Star, ShoppingBag } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  completed_orders: number;
  average_rating: number;
  total_ratings: number;
  tier: string;
  in_app_completion_rate: number;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    university: string | null;
  } | null;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Award className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/20";
    case 2:
      return "bg-gradient-to-r from-gray-400/10 to-gray-400/5 border-gray-400/20";
    case 3:
      return "bg-gradient-to-r from-amber-600/10 to-amber-600/5 border-amber-600/20";
    default:
      return "";
  }
};

const Leaderboards = () => {
  const [topByOrders, setTopByOrders] = useState<LeaderboardEntry[]>([]);
  const [topByRating, setTopByRating] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Fetch top sellers by completed orders
      const { data: orderLeaders } = await supabase
        .from("seller_profiles")
        .select("user_id, completed_orders, average_rating, total_ratings, tier, in_app_completion_rate")
        .gt("completed_orders", 0)
        .order("completed_orders", { ascending: false })
        .limit(10);

      // Fetch top sellers by rating (minimum 3 reviews)
      const { data: ratingLeaders } = await supabase
        .from("seller_profiles")
        .select("user_id, completed_orders, average_rating, total_ratings, tier, in_app_completion_rate")
        .gte("total_ratings", 3)
        .order("average_rating", { ascending: false })
        .order("total_ratings", { ascending: false })
        .limit(10);

      // Fetch profiles for all unique user IDs
      const allUserIds = [
        ...new Set([
          ...(orderLeaders?.map((s) => s.user_id) || []),
          ...(ratingLeaders?.map((s) => s.user_id) || []),
        ]),
      ];

      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, full_name, avatar_url, university")
        .in("id", allUserIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const mapWithProfiles = (entries: typeof orderLeaders): LeaderboardEntry[] =>
        (entries || []).map((entry) => ({
          ...entry,
          tier: entry.tier as string,
          profile: profileMap.get(entry.user_id) || null,
        }));

      setTopByOrders(mapWithProfiles(orderLeaders));
      setTopByRating(mapWithProfiles(ratingLeaders));
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const LeaderboardList = ({ entries, metric }: { entries: LeaderboardEntry[]; metric: "orders" | "rating" }) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="w-6 h-6" />
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No sellers on the leaderboard yet</p>
          <p className="text-sm">Complete transactions to appear here!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <Link
            key={entry.user_id}
            to={`/seller/${entry.user_id}`}
            className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors ${getRankBg(index + 1)}`}
          >
            <div className="flex-shrink-0">{getRankIcon(index + 1)}</div>
            <Avatar className="w-12 h-12">
              <AvatarImage src={entry.profile?.avatar_url || ""} />
              <AvatarFallback>{getInitials(entry.profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {entry.profile?.full_name || "Anonymous Seller"}
              </p>
              {entry.profile?.university && (
                <p className="text-sm text-muted-foreground truncate">
                  {entry.profile.university}
                </p>
              )}
              <BadgeDisplay
                stats={{
                  completed_orders: entry.completed_orders,
                  average_rating: entry.average_rating,
                  total_ratings: entry.total_ratings,
                  tier: entry.tier,
                  in_app_completion_rate: entry.in_app_completion_rate,
                }}
                maxDisplay={2}
              />
            </div>
            <div className="text-right flex-shrink-0">
              {metric === "orders" ? (
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span className="font-bold text-lg">{entry.completed_orders}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">{entry.average_rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({entry.total_ratings})</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Leaderboards</h1>
            <p className="text-muted-foreground mt-2">
              Top sellers ranked by performance and customer satisfaction
            </p>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Most Orders
              </TabsTrigger>
              <TabsTrigger value="rating" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Top Rated
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Top Sellers by Completed Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderboardList entries={topByOrders} metric="orders" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rating">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Top Sellers by Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderboardList entries={topByRating} metric="rating" />
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

export default Leaderboards;
