import { useEffect, useRef, useState } from "react";
import { PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { getReflectionPrompt } from "@/data/reflectionPrompts";
import { useReflection } from "@/hooks/useReflection";
import { cn } from "@/lib/utils";

interface ReflectionPromptProps {
  biasId: string;
  cycle: number;
  className?: string;
}

const ReflectionPrompt = ({ biasId, cycle, className }: ReflectionPromptProps) => {
  const prompt = getReflectionPrompt(biasId);
  const { text, save } = useReflection(biasId, cycle);
  const [draft, setDraft] = useState(text);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setDraft(text);
  }, [text, biasId, cycle]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleSave = (value: string) => {
    setDraft(value);
    setSaved(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      save(value);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  return (
    <section
      className={cn(
        "glass rounded-2xl p-5 sm:p-6 space-y-3 animate-fade-up",
        className,
      )}
      aria-labelledby={`reflection-heading-${biasId}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="rounded-xl bg-primary/10 p-2 mt-0.5">
          <PenLine className="h-4 w-4 text-primary/80" aria-hidden="true" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3
            id={`reflection-heading-${biasId}`}
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Daily reflection
          </h3>
          <p className="text-sm text-foreground/90 leading-relaxed">{prompt}</p>
        </div>
      </div>

      <Textarea
        value={draft}
        onChange={(e) => scheduleSave(e.target.value)}
        placeholder="Optional — jot a thought, example, or reminder for yourself…"
        className="min-h-[88px] rounded-xl border-primary/10 bg-primary/[0.03] text-sm resize-none focus-visible:ring-primary/30"
        aria-label="Your reflection"
      />

      <p className="text-[11px] text-muted-foreground/60" role="status" aria-live="polite">
        {saved ? "Saved on this device" : "Private — saved locally on your device"}
      </p>
    </section>
  );
};

export default ReflectionPrompt;
