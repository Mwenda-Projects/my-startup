import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminStats from "@/components/admin/AdminStats";
import UserManagement from "@/components/admin/UserManagement";
import ReportsManagement from "@/components/admin/ReportsManagement";
import WithdrawalsManagement from "@/components/admin/WithdrawalsManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldAlert, Users, Flag, Wallet, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { user, isAdmin, isLoading: authLoading } = useAdminCheck();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    totalServices: 0,
    totalTransactions: 0,
    pendingReports: 0,
    pendingWithdrawals: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } else if (!authLoading && isAdmin) {
      fetchAllData();
    }
  }, [authLoading, user, isAdmin, navigate]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchReports(),
      fetchWithdrawals(),
    ]);
    setIsLoading(false);
  };

  const fetchStats = async () => {
    try {
      const [
        { count: usersCount },
        { count: itemsCount },
        { count: servicesCount },
        { count: transactionsCount },
        { count: reportsCount },
        { count: withdrawalsCount },
        { data: revenueData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("items").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("transactions").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("transactions").select("platform_fee").eq("status", "completed"),
      ]);

      const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.platform_fee || 0), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalItems: itemsCount || 0,
        totalServices: servicesCount || 0,
        totalTransactions: transactionsCount || 0,
        pendingReports: reportsCount || 0,
        pendingWithdrawals: withdrawalsCount || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: roles } = await supabase
        .from("user_roles")
        .select("*");

      const usersWithRoles = profiles?.map((profile) => ({
        ...profile,
        role: roles?.find((r) => r.user_id === profile.id)?.role || "user",
      }));

      setUsers(usersWithRoles || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch user info for each withdrawal
      if (data) {
        const userIds = [...new Set(data.map((w) => w.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const withdrawalsWithUsers = data.map((w) => ({
          ...w,
          user: profiles?.find((p) => p.id === w.user_id),
        }));

        setWithdrawals(withdrawalsWithUsers);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, content, and payouts</p>
          </div>
        </div>

        <div className="space-y-8">
          <AdminStats stats={stats} />

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">Reports</span>
                {stats.pendingReports > 0 && (
                  <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {stats.pendingReports}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="gap-2">
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Payouts</span>
                {stats.pendingWithdrawals > 0 && (
                  <span className="ml-1 bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {stats.pendingWithdrawals}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserManagement users={users} onRefresh={fetchUsers} />
            </TabsContent>

            <TabsContent value="reports">
              <ReportsManagement reports={reports} onRefresh={fetchReports} />
            </TabsContent>

            <TabsContent value="withdrawals">
              <WithdrawalsManagement withdrawals={withdrawals} onRefresh={fetchWithdrawals} />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
