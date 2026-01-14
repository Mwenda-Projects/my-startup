import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WalletCard from "@/components/wallet/WalletCard";
import TransactionList from "@/components/transactions/TransactionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Wallet = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Wallet & Transactions</h1>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Wallet Sidebar */}
              <div className="md:col-span-1">
                <WalletCard />
              </div>

              {/* Transactions */}
              <div className="md:col-span-2">
                <Tabs defaultValue="purchases" className="w-full">
                  <TabsList className="w-full mb-6">
                    <TabsTrigger value="purchases" className="flex-1">
                      My Purchases
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="flex-1">
                      My Sales
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="purchases">
                    <TransactionList type="buyer" />
                  </TabsContent>

                  <TabsContent value="sales">
                    <TransactionList type="seller" />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wallet;
