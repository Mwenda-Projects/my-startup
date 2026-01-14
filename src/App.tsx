import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationSubscription, usePushNotifications } from "@/hooks/usePushNotifications";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import ServiceForm from "./pages/ServiceForm";
import Marketplace from "./pages/Marketplace";
import ItemDetail from "./pages/ItemDetail";
import ItemForm from "./pages/ItemForm";
import Wallet from "./pages/Wallet";
import Messages from "./pages/Messages";
import Favorites from "./pages/Favorites";
import SellerProfile from "./pages/SellerProfile";
import HelpCenter from "./pages/HelpCenter";
import SafetyTips from "./pages/SafetyTips";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Admin from "./pages/Admin";
import Events from "./pages/Events";
import EventForm from "./pages/EventForm";
import EventDetail from "./pages/EventDetail";
import Leaderboards from "./pages/Leaderboards";
import Referrals from "./pages/Referrals";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import AIChatbot from "./components/chat/AIChatbot";

const queryClient = new QueryClient();

// Component to handle push notification subscription
const NotificationHandler = () => {
  const [userId, setUserId] = useState<string | undefined>();
  const { requestPermission, isSupported, permission } = usePushNotifications();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserId(session?.user?.id);
        // Request permission when user logs in
        if (session?.user && isSupported && permission !== "granted") {
          requestPermission();
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, [isSupported, permission, requestPermission]);

  // Subscribe to real-time notifications
  useNotificationSubscription(userId);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="hustlesphere-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NotificationHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard/services/new" element={<ServiceForm />} />
            <Route path="/dashboard/services/:id/edit" element={<ServiceForm />} />
            <Route path="/dashboard/items/new" element={<ItemForm />} />
            <Route path="/dashboard/items/:id/edit" element={<ItemForm />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<ItemDetail />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/seller/:id" element={<SellerProfile />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/safety" element={<SafetyTips />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AIChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
