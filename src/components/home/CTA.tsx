import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      {/* Subtle border decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium">Join the Movement</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your{" "}
            <span className="text-gradient">Hustle?</span>
          </h2>

          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Join thousands of students already earning and saving on HustleSphere. Sign up in seconds – it's free!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?mode=signup">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/marketplace">
                Browse Marketplace
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
