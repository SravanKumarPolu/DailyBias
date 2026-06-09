import { useRef } from "react";
import { Flame, Bookmark, Share2, BookmarkCheck, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useStreak } from "@/hooks/useStreak";
import { useShareBias } from "@/hooks/useShareBias";
import type { ShareableBias } from "@/lib/share";

interface BiasActionsProps {
  bias: ShareableBias;
  /** When false, hides the share button (e.g. when the page has its own share UI). */
  showShare?: boolean;
  /** Affects bookmark button aria-label wording. */
  bookmarkContext?: "today" | "saved";
}

const BiasActions = ({
  bias,
  showShare = true,
  bookmarkContext = "today",
}: BiasActionsProps) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { streak } = useStreak();
  const bookmarked = isBookmarked(bias.id);
  const announcerRef = useRef<HTMLDivElement>(null);
  const { share, sharing, copied } = useShareBias(bias);

  const biasLabel = bookmarkContext === "saved" ? "this bias" : "today's bias";
  const shareLabel =
    bookmarkContext === "today" ? "Share today's bias" : "Share this bias";

  const announce = (message: string) => {
    if (!announcerRef.current) return;
    announcerRef.current.textContent = "";
    window.setTimeout(() => {
      if (announcerRef.current) announcerRef.current.textContent = message;
    }, 50);
  };

  const handleBookmark = () => {
    const nowSaved = toggleBookmark(bias.id);

    const title = nowSaved ? "Saved for later" : "Removed from saved";
    const description = nowSaved
      ? "Take a breath — today's bias is tucked away for whenever you need it."
      : "All clear — this bias has been gently removed from your collection.";

    toast(title, {
      description,
      icon: nowSaved ? <Sparkles className="h-4 w-4 text-primary" /> : undefined,
      duration: 3500,
      className: "calm-toast",
    });

    announce(`${title}. ${description}`);
  };

  const handleShare = async () => {
    const outcome = await share();
    if (outcome === "copied") {
      announce("Copied to clipboard. Share today's bias with a friend.");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="glass flex items-center gap-2 rounded-xl px-4 py-2" aria-label={`${streak} day streak`}>
        <Flame className="h-4 w-4 text-orange-400" />
        <span className="text-sm font-medium text-foreground">{streak}</span>
        <span className="text-xs text-muted-foreground">day streak</span>
      </div>

      <Button
        variant="glass"
        size="icon"
        onClick={handleBookmark}
        className="rounded-xl"
        aria-pressed={bookmarked}
        aria-label={
          bookmarked ? `Remove bookmark from ${biasLabel}` : `Bookmark ${biasLabel}`
        }
      >
        {bookmarked ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {showShare && (
        <Button
          variant="glass"
          size="icon"
          onClick={handleShare}
          disabled={sharing}
          aria-busy={sharing}
          aria-label={copied ? "Bias copied to clipboard" : shareLabel}
          className={`rounded-xl touch-manipulation ${copied ? "bg-primary/15 text-primary ring-1 ring-primary/40" : ""}`}
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default BiasActions;
