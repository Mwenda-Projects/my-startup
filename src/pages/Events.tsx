import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventCard from "@/components/cards/EventCard";
import LocationFilter from "@/components/search/LocationFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateDistance, formatDistance } from "@/hooks/useGeolocation";

const EVENT_CATEGORIES = [
  "All",
  "Academic",
  "Social",
  "Sports",
  "Music",
  "Workshop",
  "Career",
  "Other",
];

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  price: number;
  capacity: number;
  tickets_sold: number;
  image_url: string | null;
  category: string;
  is_free: boolean | null;
  latitude: number | null;
  longitude: number | null;
}

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true });

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
        );
      }

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory.toLowerCase());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const handleLocationChange = (lat: number | null, lng: number | null, radius: number) => {
    if (lat && lng) {
      setUserLocation({ lat, lng });
    } else {
      setUserLocation(null);
    }
    setRadiusKm(radius);
  };

  const filteredAndSortedEvents = useMemo(() => {
    if (!events) return [];

    let result = [...events];

    // If user location is set, filter by distance and sort by proximity
    if (userLocation) {
      result = result
        .map((event) => {
          const distance =
            event.latitude && event.longitude
              ? calculateDistance(userLocation.lat, userLocation.lng, event.latitude, event.longitude)
              : null;
          return { ...event, distance };
        })
        .filter((event) => event.distance === null || event.distance <= radiusKm)
        .sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    return result;
  }, [events, userLocation, radiusKm]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Board</h1>
            <p className="text-muted-foreground">
              Discover and attend exciting events in your community
            </p>
          </div>
          {session && (
            <Button asChild>
              <Link to="/events/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <LocationFilter
            onLocationChange={handleLocationChange}
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedEvents.map((event) => (
              <div key={event.id} className="relative">
                <EventCard
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  eventDate={event.event_date}
                  location={event.location}
                  price={Number(event.price)}
                  capacity={event.capacity}
                  ticketsSold={event.tickets_sold}
                  imageUrl={event.image_url}
                  category={event.category}
                  isFree={event.is_free ?? false}
                />
                {userLocation && (event as any).distance && (
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                    📍 {formatDistance((event as any).distance)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search or filters"
                : "Be the first to create an event!"}
            </p>
            {session && (
              <Button asChild>
                <Link to="/events/new">Create Event</Link>
              </Button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
