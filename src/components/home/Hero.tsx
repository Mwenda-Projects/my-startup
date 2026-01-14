import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Subtle decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/5 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Campus Marketplace for Students</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up">
            Your Campus.{" "}
            <span className="text-gradient">Your Hustle.</span>
            <br />
            Your Success.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Offer services, sell items, and discover opportunities. Join thousands of students building their future on HustleSphere.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?mode=signup">
                Start Hustling Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/services">
                Explore Services
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Users className="w-4 h-4" />
                <span className="text-2xl sm:text-3xl font-bold text-white">2K+</span>
              </div>
              <p className="text-xs sm:text-sm text-white/60">Active Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-2xl sm:text-3xl font-bold text-white">500+</span>
              </div>
              <p className="text-xs sm:text-sm text-white/60">Services Listed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-2xl sm:text-3xl font-bold text-white">KSh 5M+</span>
              </div>
              <p className="text-xs sm:text-sm text-white/60">Earned by Students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
