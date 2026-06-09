import { Sparkles, Flame, Bookmark, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CycleMilestoneStats } from "@/types/biasProgress";

interface CycleCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: CycleMilestoneStats;
  onContinue: () => void;
}

const StatCard = ({
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
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

const CycleCompletionModal = ({
  open,
  onOpenChange,
  stats,
  onContinue,
}: CycleCompletionModalProps) => {
  const handleContinue = () => {
    onContinue();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-primary/15 sm:max-w-md">
        <DialogHeader className="text-center sm:text-center space-y-3">
          <div className="mx-auto gradient-bg rounded-2xl p-3 w-fit">
            <Sparkles className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
          <DialogTitle className="text-2xl gradient-text">
            Foundation complete
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed max-w-sm mx-auto">
            You've seen all 60 cognitive biases in cycle {stats.cycle}. That's a
            full foundation — take a breath and celebrate the consistency you built.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-2">
          <StatCard icon={CalendarDays} label="Days active" value={stats.daysActive} />
          <StatCard icon={Flame} label="Day streak" value={stats.streak} />
          <StatCard icon={Bookmark} label="Saved" value={stats.bookmarksCount} />
        </div>

        <Button
          onClick={handleContinue}
          className="w-full rounded-xl gradient-bg text-primary-foreground"
        >
          Begin cycle {stats.cycle + 1}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CycleCompletionModal;
