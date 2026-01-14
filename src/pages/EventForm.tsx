import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import ImageUpload from "@/components/uploads/ImageUpload";
import LocationInput from "@/components/search/LocationInput";

const EVENT_CATEGORIES = [
  "academic",
  "social",
  "sports",
  "music",
  "workshop",
  "career",
  "other",
];

const EventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    price: 0,
    capacity: 100,
    category: "social",
    is_free: false,
    image_url: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: existingEvent, isLoading: loadingEvent } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        title: existingEvent.title,
        description: existingEvent.description,
        event_date: existingEvent.event_date.slice(0, 16),
        location: existingEvent.location,
        price: Number(existingEvent.price),
        capacity: existingEvent.capacity,
        category: existingEvent.category,
        is_free: existingEvent.is_free ?? false,
        image_url: existingEvent.image_url || "",
        latitude: existingEvent.latitude,
        longitude: existingEvent.longitude,
      });
    }
  }, [existingEvent]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("events").insert({
        ...data,
        organizer_id: session.user.id,
        price: data.is_free ? 0 : data.price,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
    onError: (error) => {
      toast.error("Failed to create event: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!id) throw new Error("No event ID");
      const { error } = await supabase
        .from("events")
        .update({
          ...data,
          price: data.is_free ? 0 : data.price,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Event updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      navigate(`/events/${id}`);
    },
    onError: (error) => {
      toast.error("Failed to update event: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">
            Please sign in to create events.
          </p>
          <Button onClick={() => navigate("/auth")} className="mt-4">
            Sign In
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Event" : "Create New Event"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your event..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Date & Time</Label>
                  <Input
                    id="event_date"
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Event venue or address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_free: checked })
                    }
                  />
                  <Label htmlFor="is_free">Free Event</Label>
                </div>
              </div>

              {!formData.is_free && (
                <div className="space-y-2">
                  <Label htmlFor="price">Ticket Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Event Image</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) =>
                    setFormData({ ...formData, image_url: url })
                  }
                  bucket="listings"
                />
              </div>

              <LocationInput
                latitude={formData.latitude}
                longitude={formData.longitude}
                onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEditing ? "Update Event" : "Create Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default EventForm;
