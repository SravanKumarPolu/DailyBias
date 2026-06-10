import { Link } from "react-router-dom";
import { ArrowRight, Brain, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const features = [
  {
    icon: Brain,
    title: "One Bias Per Day",
    description: "Learn a new cognitive bias daily with clear explanations and real-world examples.",
  },
  {
    icon: Shield,
    title: "Think Sharper",
    description: "Build awareness of the mental shortcuts that lead to poor decisions.",
  },
  {
    icon: Sparkles,
    title: "Stay Consistent",
    description: "Track your streak and build a daily habit of better thinking.",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />

      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Hero */}
      <main id="main-content" className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl text-center space-y-8">
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-primary" />
              Think better, one day at a time
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Master your mind with{" "}
            <span className="gradient-text">DebiasDaily</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.3s" }}>
            Discover one cognitive bias every day. Understand why your brain tricks you — and learn how to think more clearly.
          </p>

          <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/today">
              <Button variant="hero" size="lg" className="gap-2">
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto max-w-4xl mt-24 grid gap-4 sm:grid-cols-3 px-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 space-y-3 animate-fade-up"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <div className="gradient-bg rounded-xl p-2 w-fit">
                <feature.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
