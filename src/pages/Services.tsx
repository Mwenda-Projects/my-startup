import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ServiceCard from "@/components/cards/ServiceCard";
import LocationFilter from "@/components/search/LocationFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, Briefcase, Loader2 } from "lucide-react";
import { calculateDistance, formatDistance } from "@/hooks/useGeolocation";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: string;
  image_url: string | null;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const categories = [
  "All Categories",
  "Tutoring",
  "Design",
  "Writing",
  "Programming",
  "Photography",
  "Music",
  "Fitness",
  "Other",
];

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
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

  const filteredAndSortedServices = useMemo(() => {
    let result = services.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // If user location is set, filter by distance and sort by proximity
    if (userLocation) {
      result = result
        .map((service) => {
          const distance =
            service.latitude && service.longitude
              ? calculateDistance(userLocation.lat, userLocation.lng, service.latitude, service.longitude)
              : null;
          return { ...service, distance };
        })
        .filter((service) => service.distance === null || service.distance <= radiusKm)
        .sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    return result;
  }, [services, searchQuery, selectedCategory, userLocation, radiusKm]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-background mb-4">
                Find Student <span className="text-gradient">Services</span>
              </h1>
              <p className="text-background/70 text-lg mb-8">
                From tutoring to design, discover talented students ready to help
              </p>

              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-background/95 border-0"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 h-12 bg-background/95 border-0">
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
              <div className="mt-4 flex justify-center">
                <LocationFilter
                  onLocationChange={handleLocationChange}
                  radiusKm={radiusKm}
                  onRadiusChange={setRadiusKm}
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredAndSortedServices.length === 0 ? (
              <div className="text-center py-20">
                <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedCategory !== "All Categories"
                    ? "Try adjusting your search or filters"
                    : "Be the first to offer your services!"}
                </p>
                <Button variant="hero" asChild>
                  <Link to="/auth?mode=signup">Offer Your Services</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <p className="text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{filteredAndSortedServices.length}</span> services
                    {userLocation && " near you"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedServices.map((service) => (
                    <div key={service.id} className="relative">
                      <ServiceCard
                        id={service.id}
                        title={service.title}
                        description={service.description}
                        category={service.category}
                        price={service.price}
                        priceType={service.price_type}
                        imageUrl={service.image_url || undefined}
                        sellerName={service.profiles?.full_name || undefined}
                        sellerAvatar={service.profiles?.avatar_url || undefined}
                      />
                      {userLocation && (service as any).distance && (
                        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                          📍 {formatDistance((service as any).distance)}
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

export default Services;
