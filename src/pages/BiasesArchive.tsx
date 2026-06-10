import Header from "@/components/Header";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { getAllBiases, type BiasCategory } from "@/data/biases";
import { Link } from "react-router-dom";
import { Brain, ArrowRight } from "lucide-react";

const categoryOrder: BiasCategory[] = [
  "Core Thinking",
  "Memory & Perception",
  "Social",
  "Decision-Making",
  "Logical & Reasoning",
  "Behavioral & Everyday",
];

const BiasesArchive = () => {
  const allBiases = getAllBiases();

  const biasesByCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = allBiases.filter((bias) => bias.category === category);
    return acc;
  }, {} as Record<BiasCategory, typeof allBiases>);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO
        title="All Cognitive Biases"
        description="Browse the complete archive of cognitive biases. Learn about confirmation bias, anchoring, availability heuristic, and many more mental shortcuts."
      />

      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: 'Home', path: '/' },
            { name: 'All Biases', path: '/biases' },
          ]
        }}
      />
 <Header />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-accent/8 blur-[90px]" />
      </div>

      <main id="main-content" className="relative pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-4 animate-fade-up">
            <div className="gradient-bg inline-flex rounded-2xl p-3">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
              Cognitive Bias Archive
            </h1>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Explore our complete collection of cognitive biases. Each bias is explained with real-world examples and practical countermeasures.
            </p>
          </div>

          {categoryOrder.map((category, categoryIndex) => {
            const categoryBiases = biasesByCategory[category];
            if (!categoryBiases || categoryBiases.length === 0) return null;

            return (
              <div
                key={category}
                className="space-y-4 animate-fade-up"
                style={{ animationDelay: `${categoryIndex * 0.1}s` }}
              >
                <h2 className="text-2xl font-semibold text-foreground">{category}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categoryBiases.map((bias) => (
                    <Link
                      key={bias.id}
                      to={`/bias/${bias.id}`}
                      className="glass rounded-xl p-4 hover:bg-secondary/50 transition-colors duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {bias.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {bias.definition}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default BiasesArchive;
