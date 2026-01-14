import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import PaymentModal from "@/components/payment/PaymentModal";
import SellerReviewsSummary from "@/components/reviews/SellerReviewsSummary";
import { useStartConversation } from "@/hooks/useStartConversation";
import { ArrowLeft, User, Calendar, Loader2, ShoppingBag, MapPin, ShoppingCart, MessageCircle } from "lucide-react";

interface ItemProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  university: string | null;
}

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  image_url: string | null;
  is_sold: boolean;
  created_at: string;
  user_id: string;
  profiles: ItemProfile | null;
}

const conditionLabels: Record<string, string> = {
  new: "Brand New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const { startConversation, isLoading: isStartingChat } = useStartConversation();

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url,
            university
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate("/marketplace");
        return;
      }
      setItem(data);
    } catch (error) {
      console.error("Error fetching item:", error);
      navigate("/marketplace");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back */}
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <div className="aspect-square md:aspect-video rounded-2xl overflow-hidden bg-muted relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center gradient-accent opacity-30">
                    <ShoppingBag className="w-24 h-24 text-accent-foreground" />
                  </div>
                )}
                {item.is_sold && (
                  <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                    <span className="text-background font-bold text-3xl rotate-[-15deg] px-8 py-3 border-4 border-background">
                      SOLD
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge>{item.category}</Badge>
                  <Badge variant="outline">{conditionLabels[item.condition] || item.condition}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {item.title}
                </h1>
                <p className="text-muted-foreground text-lg whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-accent mb-2">
                      KSh {item.price.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      Campus Pickup
                    </div>
                  </div>
                  <Button 
                    variant="accent" 
                    className="w-full" 
                    size="lg"
                    disabled={item.is_sold}
                    onClick={() => setShowPayment(true)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {item.is_sold ? "Item Sold" : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>

              {/* Seller Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">About the Seller</h3>
                  <Link 
                    to={`/seller/${item.profiles?.id || item.user_id}`}
                    className="flex items-center gap-4 mb-4 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {item.profiles?.avatar_url ? (
                        <img
                          src={item.profiles.avatar_url}
                          alt={item.profiles.full_name || "Seller"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.profiles?.full_name || "Student"}</p>
                      {item.profiles?.university && (
                        <p className="text-sm text-muted-foreground">{item.profiles.university}</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      asChild
                    >
                      <Link to={`/seller/${item.profiles?.id || item.user_id}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      disabled={isStartingChat}
                      onClick={() => startConversation({ 
                        sellerId: item.profiles?.id || item.user_id,
                        listingId: item.id,
                        listingType: "item"
                      })}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {isStartingChat ? "..." : "Message"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seller Reviews */}
              <SellerReviewsSummary 
                sellerId={item.profiles?.id || item.user_id}
                sellerName={item.profiles?.full_name}
              />
            </div>
          </div>
        </div>
      </main>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        listingId={item.id}
        listingType="item"
        listingTitle={item.title}
        amount={item.price}
        sellerId={item.profiles?.id || item.user_id}
        sellerName={item.profiles?.full_name || undefined}
        onSuccess={() => navigate("/wallet")}
      />

      <Footer />
    </div>
  );
};

export default ItemDetail;
