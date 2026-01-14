import { Briefcase, ShoppingBag, Shield, Zap, Users, Star } from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Offer Your Skills",
    description: "From tutoring to design, list your services and connect with students who need your expertise.",
    color: "primary",
  },
  {
    icon: ShoppingBag,
    title: "Buy & Sell Items",
    description: "Textbooks, electronics, furniture – trade with fellow students at fair campus prices.",
    color: "accent",
  },
  {
    icon: Shield,
    title: "Safe & Verified",
    description: "All users are verified students. Trade with confidence within your campus community.",
    color: "primary",
  },
  {
    icon: Zap,
    title: "Instant Connect",
    description: "Message sellers and service providers directly. No middleman, no waiting.",
    color: "accent",
  },
  {
    icon: Users,
    title: "Campus Community",
    description: "Build your reputation with reviews and become a trusted member of the hustle.",
    color: "primary",
  },
  {
    icon: Star,
    title: "Stand Out",
    description: "Create a compelling profile that showcases your skills and attracts opportunities.",
    color: "accent",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Hustle Smart</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Built by students, for students. All the tools you need to turn your skills and stuff into cash.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                  feature.color === "primary"
                    ? "gradient-primary shadow-glow"
                    : "gradient-accent shadow-accent-glow"
                } group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
