import { useEffect, useRef, useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBiasFeedback } from "@/hooks/useBiasFeedback";
import { cn } from "@/lib/utils";

interface BiasFeedbackProps {
  biasId: string;
  className?: string;
}

const BiasFeedback = ({ biasId, className }: BiasFeedbackProps) => {
  const { entry, setUseful, saveComment } = useBiasFeedback(biasId);
  const [commentDraft, setCommentDraft] = useState(entry?.comment ?? "");
  const [commentSaved, setCommentSaved] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setCommentDraft(entry?.comment ?? "");
  }, [entry?.comment, biasId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const scheduleCommentSave = (value: string) => {
    setCommentDraft(value);
    setCommentSaved(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      saveComment(value);
      setCommentSaved(true);
      window.setTimeout(() => setCommentSaved(false), 2000);
    }, 500);
  };

  const useful = entry?.useful;

  return (
    <section
      className={cn("glass rounded-2xl p-5 sm:p-6 space-y-4 animate-fade-up", className)}
      aria-labelledby={`feedback-heading-${biasId}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="rounded-xl bg-primary/10 p-2 mt-0.5">
          <MessageSquareHeart className="h-4 w-4 text-primary/80" aria-hidden="true" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3
            id={`feedback-heading-${biasId}`}
            className="text-sm font-medium text-foreground"
          >
            Was today&apos;s bias useful?
          </h3>
          <p className="text-xs text-muted-foreground/80">
            Your feedback stays on this device.
          </p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Was today's bias useful?"
        className="flex flex-wrap gap-2"
      >
        <Button
          type="button"
          variant="glass"
          size="lg"
          onClick={() => setUseful(true)}
          aria-pressed={useful === true}
          className={cn(
            "rounded-xl min-h-[44px] px-5 touch-manipulation",
            useful === true && "bg-primary/15 text-primary ring-1 ring-primary/40",
          )}
        >
          <span aria-hidden="true">👍</span>
          <span>Yes</span>
        </Button>
        <Button
          type="button"
          variant="glass"
          size="lg"
          onClick={() => setUseful(false)}
          aria-pressed={useful === false}
          className={cn(
            "rounded-xl min-h-[44px] px-5 touch-manipulation",
            useful === false && "bg-primary/15 text-primary ring-1 ring-primary/40",
          )}
        >
          <span aria-hidden="true">👎</span>
          <span>No</span>
        </Button>
      </div>

      {useful !== undefined && (
        <div className="space-y-2">
          <Textarea
            value={commentDraft}
            onChange={(e) => scheduleCommentSave(e.target.value)}
            placeholder="Optional — tell us more (private, saved locally)…"
            className="min-h-[72px] rounded-xl border-primary/10 bg-primary/[0.03] text-sm resize-none focus-visible:ring-primary/30"
            aria-label="Optional feedback comment"
          />
          <p className="text-[11px] text-muted-foreground/60" role="status" aria-live="polite">
            {commentSaved ? "Saved on this device" : "Private — saved locally on your device"}
          </p>
        </div>
      )}
    </section>
  );
};

export default BiasFeedback;
