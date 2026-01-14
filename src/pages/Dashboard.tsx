import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, ShoppingBag, UserCircle, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import ServiceCard from "@/components/cards/ServiceCard";
import ItemCard from "@/components/cards/ItemCard";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
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
  is_active: boolean;
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
  is_active: boolean;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      
      if (profileData) setProfile(profileData);

      // Fetch services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", userId);
      
      if (servicesData) setServices(servicesData);

      // Fetch items
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", userId);
      
      if (itemsData) setItems(itemsData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    } else {
      setServices(services.filter(s => s.id !== id));
      toast({ title: "Deleted", description: "Service removed successfully" });
    }
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    } else {
      setItems(items.filter(i => i.id !== id));
      toast({ title: "Deleted", description: "Item removed successfully" });
    }
  };

  if (isLoading) {
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
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="py-8 border-b border-border mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {profile?.full_name || "Hustler"}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your services, items, and profile
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link to="/profile">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gradient-primary">
                    <Briefcase className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{services.length}</p>
                    <p className="text-sm text-muted-foreground">Services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg gradient-accent">
                    <ShoppingBag className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{items.length}</p>
                    <p className="text-sm text-muted-foreground">Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{services.filter(s => s.is_active).length + items.filter(i => i.is_active).length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{items.filter(i => i.is_sold).length}</p>
                    <p className="text-sm text-muted-foreground">Sold</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="services" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList>
                <TabsTrigger value="services" className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  My Services
                </TabsTrigger>
                <TabsTrigger value="items" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  My Items
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="services">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Services</h2>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/dashboard/services/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Link>
                </Button>
              </div>

              {services.length === 0 ? (
                <Card className="py-12">
                  <CardContent className="text-center">
                    <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No services yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start offering your skills and services to fellow students
                    </p>
                    <Button variant="hero" asChild>
                      <Link to="/dashboard/services/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Service
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="relative group">
                      <ServiceCard
                        id={service.id}
                        title={service.title}
                        description={service.description}
                        category={service.category}
                        price={service.price}
                        priceType={service.price_type}
                        imageUrl={service.image_url || undefined}
                        sellerName={profile?.full_name || undefined}
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                          <Link to={`/dashboard/services/${service.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteService(service.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="items">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Items</h2>
                <Button variant="accent" size="sm" asChild>
                  <Link to="/dashboard/items/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Link>
                </Button>
              </div>

              {items.length === 0 ? (
                <Card className="py-12">
                  <CardContent className="text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No items yet</h3>
                    <p className="text-muted-foreground mb-4">
                      List items you want to sell to fellow students
                    </p>
                    <Button variant="accent" asChild>
                      <Link to="/dashboard/items/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Item
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="relative group">
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
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Button size="icon" variant="secondary" className="h-8 w-8" asChild>
                          <Link to={`/dashboard/items/${item.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteItem(item.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
