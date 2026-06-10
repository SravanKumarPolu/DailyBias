import { useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import { Bookmark, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { getAllBiases } from "@/data/biases";
import { toast } from "sonner";

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const SavedPage = () => {
  const { bookmarks, removeBookmark } = useBookmarks();
  const allBiases = useMemo(() => getAllBiases(), []);

  const items = useMemo(
    () =>
      bookmarks
        .map((b) => {
          const bias = allBiases.find((x) => x.id === b.biasId);
          return bias ? { bias, savedAt: b.savedAt } : null;
        })
        .filter((x): x is { bias: ReturnType<typeof getAllBiases>[number]; savedAt: string } => x !== null),
    [bookmarks, allBiases]
  );

  const handleRemove = (id: string, title: string) => {
    removeBookmark(id);
    toast("Removed from saved", {
      description: `"${title}" has been gently removed from your collection.`,
      duration: 3000,
      className: "calm-toast",
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO
        title="Saved Biases"
        description="View your saved cognitive biases. Build your personal collection of biases to learn and reference."
      />
      <Header />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
      </div>
      <main className="relative pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div className="text-center space-y-3 animate-fade-up">
            <div className="gradient-bg inline-flex rounded-2xl p-3">
              <Bookmark className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Saved Biases</h1>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Your collection lives here. Revisit any bias whenever you need a calm reminder.
            </p>
          </div>

          {items.length === 0 ? (
            <div
              className="glass rounded-2xl p-10 text-center space-y-3 animate-fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              <p className="text-sm text-muted-foreground">No saved biases yet.</p>
              <p className="text-xs text-muted-foreground/80">
                Tap the bookmark icon on today's bias to start your collection.
              </p>
              <Link to="/today">
                <Button variant="glass" className="rounded-xl mt-2">
                  Go to today's bias
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Saved biases">
              {items.map(({ bias, savedAt }, i) => (
                <li
                  key={bias.id}
                  className="glass rounded-2xl flex items-center gap-2 animate-fade-up transition-colors hover:bg-secondary/30 focus-within:ring-2 focus-within:ring-ring"
                  style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                >
                  <Link
                    to={`/bias/${bias.id}`}
                    aria-label={`Open ${bias.title}`}
                    className="flex flex-1 items-center gap-4 p-4 sm:p-5 rounded-2xl focus:outline-none min-w-0"
                  >
                    <div className="gradient-bg rounded-xl p-2 shrink-0">
                      <Bookmark className="h-4 w-4 text-primary-foreground" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-semibold text-foreground truncate">{bias.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="rounded-full bg-secondary/50 px-2 py-0.5">
                          {bias.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={savedAt}>Saved {formatDate(savedAt)}</time>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  </Link>

                  <Button
                    variant="glass"
                    size="icon"
                    onClick={() => handleRemove(bias.id, bias.title)}
                    aria-label={`Remove ${bias.title} from saved`}
                    className="rounded-xl shrink-0 mr-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedPage;
