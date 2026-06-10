import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Brain, Heart, Target } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO
        title="About DebiasDaily"
        description="Learn about DebiasDaily's mission to help you recognize cognitive biases and make better decisions. One calm, focused lesson at a time."
      />
      <Header />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <main id="main-content" className="relative pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-2xl space-y-8">
          <div className="text-center space-y-4 animate-fade-up">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">About DebiasDaily</h1>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              We believe better thinking starts with awareness. DebiasDaily helps you recognize the cognitive biases that shape your decisions — one calm, focused lesson at a time.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Brain, title: "Why Biases Matter", text: "Cognitive biases are systematic errors in thinking that affect everyone. By understanding them, you gain the power to make more rational, intentional choices." },
              { icon: Heart, title: "Built for Calm", text: "No noise, no clutter. DebiasDaily is designed to feel like a moment of clarity — a quiet space to learn something meaningful each day." },
              { icon: Target, title: "One Day at a Time", text: "Consistency beats intensity. We surface one bias per day so you can absorb it fully, reflect on it, and carry the insight forward." },
            ].map((item, i) => (
              <div
                key={item.title}
                className="glass rounded-2xl p-6 space-y-3 animate-fade-up"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <div className="gradient-bg rounded-xl p-2 w-fit">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
