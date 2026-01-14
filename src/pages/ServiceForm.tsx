import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ImageUpload from "@/components/uploads/ImageUpload";
import LocationInput from "@/components/search/LocationInput";

const categories = ["Tutoring", "Design", "Writing", "Programming", "Photography", "Music", "Fitness", "Other"];
const priceTypes = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Per Hour" },
  { value: "project", label: "Per Project" },
];

const ServiceForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    priceType: "fixed",
    imageUrl: "",
    isActive: true,
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchService();
    }
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price.toString(),
        priceType: data.price_type,
        imageUrl: data.image_url || "",
        isActive: data.is_active ?? true,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch service", variant: "destructive" });
      navigate("/dashboard");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const serviceData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        price_type: formData.priceType,
        image_url: formData.imageUrl || null,
        is_active: formData.isActive,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", id);
        if (error) throw error;
        toast({ title: "Success", description: "Service updated successfully" });
      } else {
        const { error } = await supabase.from("services").insert(serviceData);
        if (error) throw error;
        toast({ title: "Success", description: "Service created successfully" });
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Service" : "Create New Service"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Service Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Math Tutoring for Calculus I & II"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your service in detail..."
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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

                  <div className="space-y-2">
                    <Label htmlFor="priceType">Price Type</Label>
                    <Select
                      value={formData.priceType}
                      onValueChange={(v) => setFormData({ ...formData, priceType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceTypes.map((pt) => (
                          <SelectItem key={pt.value} value={pt.value}>
                            {pt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="25.00"
                    required
                  />
                </div>

                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="services"
                />

                <LocationInput
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-muted-foreground">Make this service visible to others</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditing ? (
                      "Update Service"
                    ) : (
                      "Create Service"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ServiceForm;
