import { Link, useLocation } from "react-router-dom";
import { Brain, Bookmark, Settings, Info, CheckCircle, Sun } from "lucide-react";
import { useQuizCompletion } from "@/hooks/useQuizCompletion";
import { getTodaysBias } from "@/data/biases";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const location = useLocation();
  const todaysBias = useMemo(() => getTodaysBias(), []);
  const { isDoneToday } = useQuizCompletion(todaysBias.id);

  const navItems = [
    { label: "Today", path: "/", icon: Sun },
    { label: "Biases", path: "/biases", icon: Brain },
    { label: "Saved", path: "/saved", icon: Bookmark },
    { label: "Quiz", path: "/quiz", icon: Brain },
    { label: "Review", path: "/weekly-review", icon: CheckCircle },
    { label: "Settings", path: "/settings", icon: Settings },
    { label: "About", path: "/about", icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[hsl(var(--glass-border))] md:hidden">
      <div className="flex items-center justify-around pb-safe">
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
              className={cn(
                "relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-2 transition-colors duration-200",
                active
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span className="relative inline-flex">
                <Icon className="h-5 w-5" />
                {showQuizDone && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-2 ring-background"
                  />
                )}
              </span>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-primary rounded-full" />
              )}
              {showQuizDone && <span className="sr-only">Quiz done today</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
