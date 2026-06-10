import { Link, useLocation } from "react-router-dom";
import { Brain, Bookmark, Sparkles, Settings, Info, Check, Sun, CheckCircle } from "lucide-react";
import { useQuizCompletion } from "@/hooks/useQuizCompletion";
import { getTodaysBias } from "@/data/biases";
import { useMemo } from "react";

const Header = () => {
  const location = useLocation();
  const todaysBias = useMemo(() => getTodaysBias(), []);
  const { isDoneToday } = useQuizCompletion(todaysBias.id);

  const navItems = [
    { label: "Today", path: "/", icon: Sun },
    { label: "Saved", path: "/saved", icon: Bookmark },
    { label: "Quiz", path: "/quiz", icon: Brain },
    { label: "Review", path: "/weekly-review", icon: CheckCircle },
    { label: "Settings", path: "/settings", icon: Settings },
    { label: "About", path: "/about", icon: Info },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[hsl(var(--glass-border))]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="gradient-bg rounded-lg p-1.5 transition-transform duration-200 group-hover:scale-105">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Debias<span className="gradient-text">Daily</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            const showQuizDone = item.path === "/quiz" && isDoneToday;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                aria-label={
                  showQuizDone ? `${item.label} (completed today)` : item.label
                }
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  active
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <span className="relative inline-flex">
                  <Icon className="h-4 w-4" />
                  {showQuizDone && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-2 ring-background"
                    />
                  )}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
                {showQuizDone && (
                  <span className="hidden md:inline-flex items-center gap-1 ml-1 rounded-full bg-primary/15 text-primary px-1.5 py-0.5 text-[10px] font-medium">
                    <Check className="h-2.5 w-2.5" />
                    Done
                  </span>
                )}
                {showQuizDone && <span className="sr-only">Quiz done today</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
