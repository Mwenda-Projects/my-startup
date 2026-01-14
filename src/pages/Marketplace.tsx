import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ItemCard from "@/components/cards/ItemCard";
import LocationFilter from "@/components/search/LocationFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, ShoppingBag, Loader2 } from "lucide-react";
import { calculateDistance, formatDistance } from "@/hooks/useGeolocation";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: string;
  image_url: string | null;
  is_sold: boolean;
  latitude: number | null;
  longitude: number | null;
}

const categories = [
  "All Categories",
  "Textbooks",
  "Electronics",
  "Furniture",
  "Clothing",
  "Sports",
  "Tickets",
  "Other",
];

const Marketplace = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showSold, setShowSold] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (lat: number | null, lng: number | null, radius: number) => {
    if (lat && lng) {
      setUserLocation({ lat, lng });
    } else {
      setUserLocation(null);
    }
    setRadiusKm(radius);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" || item.category === selectedCategory;
      const matchesSold = showSold || !item.is_sold;
      return matchesSearch && matchesCategory && matchesSold;
    });

    // If user location is set, filter by distance and sort by proximity
    if (userLocation) {
      result = result
        .map((item) => {
          const distance =
            item.latitude && item.longitude
              ? calculateDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude)
              : null;
          return { ...item, distance };
        })
        .filter((item) => item.distance === null || item.distance <= radiusKm)
        .sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    return result;
  }, [items, searchQuery, selectedCategory, showSold, userLocation, radiusKm]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-b from-accent/10 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Campus <span className="text-gradient-accent">Marketplace</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Buy and sell items within your campus community
              </p>

              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 h-12">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="mt-4">
                <LocationFilter
                  onLocationChange={handleLocationChange}
                  radiusKm={radiusKm}
                  onRadiusChange={setRadiusKm}
                  className="justify-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Listings */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedCategory !== "All Categories"
                    ? "Try adjusting your search or filters"
                    : "Be the first to list an item!"}
                </p>
                <Button variant="accent" asChild>
                  <Link to="/auth?mode=signup">Sell Your Items</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <p className="text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{filteredAndSortedItems.length}</span> items
                    {userLocation && " near you"}
                  </p>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={showSold}
                      onChange={(e) => setShowSold(e.target.checked)}
                      className="rounded border-border"
                    />
                    Show sold items
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedItems.map((item) => (
                    <div key={item.id} className="relative">
                      <ItemCard
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        category={item.category}
                        price={item.price}
                        condition={item.condition}
                        imageUrl={item.image_url || undefined}
                        isSold={item.is_sold}
                      />
                      {userLocation && (item as any).distance && (
                        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                          📍 {formatDistance((item as any).distance)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Marketplace;
