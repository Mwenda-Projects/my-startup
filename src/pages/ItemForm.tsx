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

const categories = ["Textbooks", "Electronics", "Furniture", "Clothing", "Sports", "Tickets", "Other"];
const conditions = [
  { value: "new", label: "Brand New" },
  { value: "like-new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

const ItemForm = () => {
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
    condition: "good",
    imageUrl: "",
    isSold: false,
    isActive: true,
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price.toString(),
        condition: data.condition,
        imageUrl: data.image_url || "",
        isSold: data.is_sold ?? false,
        isActive: data.is_active ?? true,
        latitude: data.latitude,
        longitude: data.longitude,
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch item", variant: "destructive" });
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

      const itemData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        condition: formData.condition,
        image_url: formData.imageUrl || null,
        is_sold: formData.isSold,
        is_active: formData.isActive,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("items")
          .update(itemData)
          .eq("id", id);
        if (error) throw error;
        toast({ title: "Success", description: "Item updated successfully" });
      } else {
        const { error } = await supabase.from("items").insert(itemData);
        if (error) throw error;
        toast({ title: "Success", description: "Item created successfully" });
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
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
              <CardTitle>{isEditing ? "Edit Item" : "List New Item"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Item Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Introduction to Psychology Textbook"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your item in detail..."
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
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(v) => setFormData({ ...formData, condition: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
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
                    placeholder="50.00"
                    required
                  />
                </div>

                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  folder="items"
                />

                <LocationInput
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive">Active</Label>
                      <p className="text-sm text-muted-foreground">Make this item visible to others</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                    />
                  </div>

                  {isEditing && (
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isSold">Mark as Sold</Label>
                        <p className="text-sm text-muted-foreground">Item has been sold</p>
                      </div>
                      <Switch
                        id="isSold"
                        checked={formData.isSold}
                        onCheckedChange={(v) => setFormData({ ...formData, isSold: v })}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="accent" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditing ? (
                      "Update Item"
                    ) : (
                      "List Item"
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

export default ItemForm;
