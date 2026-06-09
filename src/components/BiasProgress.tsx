import { Progress } from "@/components/ui/progress";

interface BiasProgressProps {
  seenCount: number;
  totalBiases: number;
  cycle: number;
}

const BiasProgress = ({ seenCount, totalBiases, cycle }: BiasProgressProps) => {
  const percent = totalBiases > 0 ? Math.round((seenCount / totalBiases) * 100) : 0;

  return (
    <div
      className="glass rounded-2xl px-5 py-4 space-y-3 w-full max-w-md animate-fade-up"
      aria-label={`Bias journey progress: ${seenCount} of ${totalBiases} biases seen in cycle ${cycle}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
            Your journey
          </p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            <span className="tabular-nums">{seenCount}</span>
            <span className="text-muted-foreground"> / {totalBiases} biases</span>
          </p>
        </div>
        <span className="text-xs text-muted-foreground/80 tabular-nums">Cycle {cycle}</span>
      </div>
      <Progress value={percent} className="h-2 bg-primary/10" />
      <p className="text-[11px] text-muted-foreground/70">
        {seenCount >= totalBiases
          ? "Foundation cycle complete — keep going!"
          : `${totalBiases - seenCount} biases left in this cycle`}
      </p>
    </div>
  );
};

export default BiasProgress;
