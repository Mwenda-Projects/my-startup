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
import { ArrowLeft, User, Calendar, Loader2, Briefcase, ShoppingCart, MessageCircle } from "lucide-react";

interface ServiceProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  university: string | null;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: ServiceProfile | null;
}

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const { startConversation, isLoading: isStartingChat } = useStartConversation();

  useEffect(() => {
    if (id) fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
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
        navigate("/services");
        return;
      }
      setService(data);
    } catch (error) {
      console.error("Error fetching service:", error);
      navigate("/services");
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

  if (!service) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back */}
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-muted">
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center gradient-primary opacity-30">
                    <Briefcase className="w-24 h-24 text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge>{service.category}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(service.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {service.title}
                </h1>
                <p className="text-muted-foreground text-lg whitespace-pre-wrap">
                  {service.description}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary mb-2">
                      KSh {service.price.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">
                      {service.price_type === "hourly"
                        ? "per hour"
                        : service.price_type === "project"
                        ? "per project"
                        : "fixed price"}
                    </p>
                  </div>
                  <Button variant="hero" className="w-full" size="lg" onClick={() => setShowPayment(true)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Book Service
                  </Button>
                </CardContent>
              </Card>

              {/* Seller Card */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">About the Seller</h3>
                  <Link 
                    to={`/seller/${service.profiles?.id || service.user_id}`}
                    className="flex items-center gap-4 mb-4 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {service.profiles?.avatar_url ? (
                        <img
                          src={service.profiles.avatar_url}
                          alt={service.profiles.full_name || "Seller"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{service.profiles?.full_name || "Student"}</p>
                      {service.profiles?.university && (
                        <p className="text-sm text-muted-foreground">{service.profiles.university}</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      asChild
                    >
                      <Link to={`/seller/${service.profiles?.id || service.user_id}`}>
                        View Profile
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      disabled={isStartingChat}
                      onClick={() => startConversation({ 
                        sellerId: service.profiles?.id || service.user_id,
                        listingId: service.id,
                        listingType: "service"
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
                sellerId={service.profiles?.id || service.user_id}
                sellerName={service.profiles?.full_name}
              />
            </div>
          </div>
        </div>
      </main>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        listingId={service.id}
        listingType="service"
        listingTitle={service.title}
        amount={service.price}
        sellerId={service.profiles?.id || service.user_id}
        sellerName={service.profiles?.full_name || undefined}
        onSuccess={() => navigate("/wallet")}
      />

      <Footer />
    </div>
  );
};

export default ServiceDetail;
