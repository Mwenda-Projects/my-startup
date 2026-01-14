import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import ServiceCard from "@/components/cards/ServiceCard";
import ItemCard from "@/components/cards/ItemCard";
import { Heart, Briefcase, ShoppingBag, Loader2 } from "lucide-react";

const Favorites = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch favorite services
      const { data: serviceFavs } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("listing_type", "service");

      if (serviceFavs && serviceFavs.length > 0) {
        const serviceIds = serviceFavs.map((f) => f.listing_id);
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .in("id", serviceIds)
          .eq("is_active", true);

        setServices(servicesData || []);
      }

      // Fetch favorite items
      const { data: itemFavs } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("listing_type", "item");

      if (itemFavs && itemFavs.length > 0) {
        const itemIds = itemFavs.map((f) => f.listing_id);
        const { data: itemsData } = await supabase
          .from("items")
          .select("*")
          .in("id", itemIds)
          .eq("is_active", true);

        setItems(itemsData || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
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

  const totalFavorites = services.length + items.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <div>
              <h1 className="text-3xl font-bold">My Favorites</h1>
              <p className="text-muted-foreground">{totalFavorites} saved items</p>
            </div>
          </div>

          {totalFavorites === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground">
                Browse services and items to add them to your favorites
              </p>
            </div>
          ) : (
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
              </TabsList>

              <TabsContent value="services">
                {services.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No saved services
                  </div>
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
                  <div className="text-center py-12 text-muted-foreground">
                    No saved items
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                      <ItemCard key={item.id} {...item} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;