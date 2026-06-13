import Header from "@/components/Header";
import SEO from "@/components/SEO";
import StructuredData from "@/components/StructuredData";
import { getAllBiases, type BiasCategory } from "@/data/biases";
import { Link } from "react-router-dom";
import { Brain, ArrowRight, Search, X } from "lucide-react";
import { useState, useMemo } from "react";

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
  const [searchQuery, setSearchQuery] = useState("");

  const biasesByCategory = categoryOrder.reduce((acc, category) => {
    acc[category] = allBiases.filter((bias) => bias.category === category);
    return acc;
  }, {} as Record<BiasCategory, typeof allBiases>);

  // Smart search with priority matching
  const searchResults = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return null;

    const results = allBiases.map((bias) => {
      const titleLower = bias.title.toLowerCase();
      const definitionLower = bias.definition.toLowerCase();
      const categoryLower = bias.category.toLowerCase();

      let priority = 0;
      let matchType = "";

      if (titleLower.startsWith(trimmedQuery)) {
        priority = 4;
        matchType = "title-start";
      } else if (titleLower.includes(trimmedQuery)) {
        priority = 3;
        matchType = "title-contains";
      } else if (definitionLower.includes(trimmedQuery)) {
        priority = 2;
        matchType = "description";
      } else if (categoryLower.includes(trimmedQuery)) {
        priority = 1;
        matchType = "category";
      }

      return { bias, priority, matchType };
    }).filter((result) => result.priority > 0);

    // Sort by priority (highest first), then by category order, then by title
    results.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      
      const aCategoryIndex = categoryOrder.indexOf(a.bias.category);
      const bCategoryIndex = categoryOrder.indexOf(b.bias.category);
      if (aCategoryIndex !== bCategoryIndex) return aCategoryIndex - bCategoryIndex;
      
      return a.bias.title.localeCompare(b.bias.title);
    });

    return results;
  }, [searchQuery, allBiases]);

  const handleClearSearch = () => {
    setSearchQuery("");
  };

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

          {/* Search Input */}
          <div className="max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" 
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search biases..."
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                aria-label="Search biases"
                id="bias-search"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
                  aria-label="Clear search"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Results or Category Grouped Biases */}
          {searchResults ? (
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No biases found</p>
                  <p className="text-muted-foreground/70 text-sm mt-2">Try adjusting your search terms</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {searchResults.map(({ bias, matchType }, index) => (
                    <Link
                      key={bias.id}
                      to={`/bias/${bias.id}`}
                      className={`glass rounded-xl p-4 hover:bg-secondary/50 transition-colors duration-200 group ${
                        matchType === "title-start" ? "ring-2 ring-primary/20" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {bias.title}
                            </h3>
                            {matchType === "title-start" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                Best match
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {bias.definition}
                          </p>
                          <p className="text-xs text-muted-foreground/60">
                            {bias.category}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            categoryOrder.map((category, categoryIndex) => {
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
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default BiasesArchive;
