import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Briefcase, ShoppingBag, User, LogOut, Wallet, MessageCircle, Heart, ShieldAlert, Calendar, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import NotificationBell from "@/components/notifications/NotificationBell";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      const { data } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });
      setIsAdmin(!!data);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => checkAdmin(session.user.id), 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { href: "/services", label: "Services", icon: Briefcase },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src={logo} 
              alt="HustleSphere" 
              className="h-10 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive(href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/messages">
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/favorites">
                    <Heart className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/wallet">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin">
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Icons + Menu Toggle */}
          <div className="md:hidden flex items-center gap-1">
            {user && (
              <>
                <NotificationBell />
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <Link to="/messages">
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                  <Link to="/favorites">
                    <Heart className="w-5 h-5" />
                  </Link>
                </Button>
              </>
            )}
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              {user ? (
                <>
                  <Link
                    to="/wallet"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    Wallet
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                    >
                      <ShieldAlert className="w-5 h-5" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-3 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-3 rounded-lg gradient-primary text-primary-foreground font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
