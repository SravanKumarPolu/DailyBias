import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useWeeklyReview } from "@/hooks/useWeeklyReview";
import { trackWeeklyReviewOpened } from "@/lib/analytics";
import {
  CalendarDays,
  ArrowRight,
  Flame,
  Bookmark,
  PenLine,
  Layers,
} from "lucide-react";

const formatDayLabel = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (dateStr === todayStr) return "Today";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const SummaryStat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) => (
  <div className="glass rounded-xl p-4 text-center space-y-1.5">
    <Icon className="h-4 w-4 text-primary/80 mx-auto" aria-hidden="true" />
    <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
    <p className="text-[11px] text-muted-foreground leading-snug">{label}</p>
  </div>
);

const WeeklyReviewPage = () => {
  useEffect(() => {
    trackWeeklyReviewOpened();
  }, []);

  const {
    entries,
    activeDaysThisWeek,
    biasesInWeek,
    reflectionsThisWeek,
    showEmptyHint,
    streak,
    bookmarksCount,
    weekStart,
    weekEnd,
  } = useWeeklyReview();

  const rangeLabel = (() => {
    const start = new Date(weekStart + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const end = new Date(weekEnd + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return `${start} – ${end}`;
  })();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Header />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 right-1/4 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-accent/8 blur-[90px]" />
      </div>

      <main className="relative pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <div className="text-center space-y-3 animate-fade-up">
            <div className="gradient-bg inline-flex rounded-2xl p-3">
              <CalendarDays className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Weekly Review</h1>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              A calm look back at your last seven days of learning.
            </p>
            <p className="text-xs text-muted-foreground/70">{rangeLabel}</p>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <SummaryStat icon={Layers} label="Active days this week" value={activeDaysThisWeek} />
            <SummaryStat icon={Flame} label="Current streak" value={streak} />
            <SummaryStat icon={Bookmark} label="Saved biases" value={bookmarksCount} />
            <SummaryStat
              icon={PenLine}
              label="Reflections this week"
              value={reflectionsThisWeek}
            />
          </div>

          {showEmptyHint && (
            <div
              className="glass rounded-2xl p-6 text-center space-y-2 animate-fade-up"
              style={{ animationDelay: "0.15s" }}
              role="status"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your weekly review will grow as you learn each day.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Visit the Today page daily to build a full seven-day picture.
              </p>
            </div>
          )}

          {entries.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center space-y-4 animate-fade-up">
              <p className="text-sm text-muted-foreground">
                No learning history yet. Start with today&apos;s bias.
              </p>
              <Link to="/">
                <Button variant="glass" className="rounded-xl">
                  Go to Today
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                Last {entries.length} day{entries.length === 1 ? "" : "s"} · {biasesInWeek} bias
                {biasesInWeek === 1 ? "" : "es"}
              </h2>
              <ul className="space-y-3">
                {entries.map((entry) => (
                  <li key={entry.date}>
                    <Link
                      to={`/bias/${entry.bias.id}`}
                      className="glass block rounded-2xl p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_24px_hsl(258_60%_60%_/_0.08)] group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                              {formatDayLabel(entry.date)}
                            </span>
                            {entry.visited && (
                              <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5">
                                Visited
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground/60">
                              {entry.bias.category}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                            {entry.bias.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {entry.bias.definition}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WeeklyReviewPage;
