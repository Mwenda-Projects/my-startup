import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import SellerReviews from "@/components/reviews/SellerReviews";
import ServiceCard from "@/components/cards/ServiceCard";
import ItemCard from "@/components/cards/ItemCard";
import BadgeDisplay from "@/components/badges/BadgeDisplay";
import { useStartConversation } from "@/hooks/useStartConversation";
import { User, MapPin, Calendar, Star, Briefcase, ShoppingBag, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SellerData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  university: string | null;
  major: string | null;
  graduation_year: number | null;
  created_at: string;
}

interface SellerStats {
  tier: "free" | "premium" | "trusted";
  is_verified: boolean;
  average_rating: number;
  total_ratings: number;
  completed_orders: number;
  in_app_completion_rate: number;
}

const tierColors = {
  free: "bg-muted text-muted-foreground",
  premium: "bg-gradient-to-r from-amber-500 to-yellow-400 text-white",
  trusted: "bg-gradient-to-r from-emerald-500 to-teal-400 text-white"
};

const tierLabels = {
  free: "Seller",
  premium: "Premium Seller",
  trusted: "Trusted Seller"
};

const SellerProfile = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { startConversation, isLoading: isStartingChat } = useStartConversation();

  useEffect(() => {
    if (id) fetchSellerData();
  }, [id]);

  const fetchSellerData = async () => {
    try {
      // Fetch profile from public view
      const { data: profile, error: profileError } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;
      setSeller(profile);

      // Fetch seller stats
      const { data: sellerProfile } = await supabase
        .from("seller_profiles")
        .select("tier, is_verified, average_rating, total_ratings, completed_orders, in_app_completion_rate")
        .eq("user_id", id)
        .single();

      if (sellerProfile) {
        setStats(sellerProfile as SellerStats);
      }

      // Fetch services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setServices(servicesData || []);

      // Fetch items
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", id)
        .eq("is_active", true)
        .eq("is_sold", false)
        .order("created_at", { ascending: false });

      setItems(itemsData || []);
    } catch (error) {
      console.error("Error fetching seller data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          <div className="container mx-auto px-4 text-center py-16">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Seller Not Found</h1>
            <p className="text-muted-foreground mb-4">This seller profile doesn't exist.</p>
            <Button asChild>
              <Link to="/services">Browse Services</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {seller.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt={seller.full_name || "Seller"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{seller.full_name || "Student Seller"}</h1>
                    {stats?.is_verified && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                    {stats && (
                      <Badge className={tierColors[stats.tier]}>
                        {tierLabels[stats.tier]}
                      </Badge>
                    )}
                  </div>

                  {/* Achievement Badges */}
                  {stats && (
                    <div className="mb-3">
                      <BadgeDisplay
                        stats={{
                          completed_orders: stats.completed_orders,
                          average_rating: stats.average_rating,
                          total_ratings: stats.total_ratings,
                          tier: stats.tier,
                          in_app_completion_rate: stats.in_app_completion_rate,
                        }}
                        showAll
                      />
                    </div>
                  )}

                  {seller.bio && (
                    <p className="text-muted-foreground mb-4">{seller.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {seller.university && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {seller.university}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Member {formatDistanceToNow(new Date(seller.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    disabled={isStartingChat}
                    onClick={() => startConversation({ sellerId: id! })}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {isStartingChat ? "Starting..." : "Message"}
                  </Button>
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-xl font-bold">
                        {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : "-"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{stats.total_ratings} reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{stats.completed_orders}</p>
                    <p className="text-xs text-muted-foreground">Orders completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{services.length + items.length}</p>
                    <p className="text-xs text-muted-foreground">Active listings</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="services">
            <TabsList className="mb-6">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Services ({services.length})
              </TabsTrigger>
              <TabsTrigger value="items" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Items ({items.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services">
              {services.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No services listed</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service.id} {...service} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="items">
              {items.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No items for sale</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((item) => (
                    <ItemCard key={item.id} {...item} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <SellerReviews sellerId={id!} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerProfile;