import { useEffect, useRef } from "react";
import { Lightbulb, Brain, Eye, Sparkles, Shield, Volume2, Play, Pause, Square } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";
import { splitSentences, sentenceIndexAt } from "@/lib/sentences";
import type { CognitiveBias } from "@/data/biases";
import { cn } from "@/lib/utils";
import { isMobileBrowser } from "@/lib/ttsPlatform";

interface BiasCardProps {
  bias: CognitiveBias;
  /** Heading above the title; defaults to "Today's Bias". */
  headingLabel?: string;
}

const sections = [
  { id: "definition", icon: Brain, label: "Definition" },
  { id: "whyItHappens", icon: Lightbulb, label: "Why it happens" },
  { id: "examples", icon: Eye, label: "Real-life examples" },
  { id: "counterSteps", icon: Shield, label: "How to counter it" },
  { id: "tips", icon: Sparkles, label: "Quick tips" },
] as const;

const getSectionText = (bias: CognitiveBias, id: string): string => {
  switch (id) {
    case "definition": return bias.definition;
    case "whyItHappens": return bias.whyItHappens;
    case "examples": return bias.examples.join(". ");
    case "counterSteps": return bias.counterSteps.join(". ");
    case "tips": return bias.tips.join(". ");
    default: return "";
  }
};

/**
 * For list-based sections we treat each item as a "sentence" and compute the
 * char ranges to match `items.join(". ")` exactly so they line up with the
 * charIndex reported by SpeechSynthesis.
 */
const itemSpansFromList = (items: string[]) => {
  const spans: { start: number; end: number }[] = [];
  let cursor = 0;
  items.forEach((item, i) => {
    const start = cursor;
    const end = start + item.length;
    spans.push({ start, end });
    // ". " separator between items (not after the last one)
    cursor = end + (i < items.length - 1 ? 2 : 0);
  });
  return spans;
};

const activeListIndex = (
  items: string[],
  isActive: boolean,
  charIndex: number,
): number => {
  if (!isActive) return -1;
  const spans = itemSpansFromList(items);
  for (let i = 0; i < spans.length; i++) {
    if (charIndex < spans[i].end) return i;
  }
  return spans.length - 1;
};

const SectionTitle = ({
  icon: Icon,
  label,
  isActive,
  onPlay,
  onStop,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onPlay: () => void;
  onStop: () => void;
}) => (
  <div className="flex items-center gap-2 mb-2.5">
    <Icon className="h-4 w-4 text-primary/70" />
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h3>
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); isActive ? onStop() : onPlay(); }}
      className={cn(
        "ml-auto inline-flex items-center justify-center rounded-full touch-manipulation transition-all duration-500",
        "min-h-[44px] min-w-[44px] sm:min-h-8 sm:min-w-8",
        "text-muted-foreground/50 hover:text-primary/80",
        "sm:opacity-0 sm:group-hover/section:opacity-100",
        isActive && "!opacity-100 text-primary",
      )}
      aria-label={isActive ? `Stop listening to ${label}` : `Listen to ${label}`}
      aria-pressed={isActive}
    >
      {isActive ? (
        <Square className={cn("h-4 w-4 sm:h-3.5 sm:w-3.5 transition-all duration-500")} />
      ) : (
        <Volume2 className={cn("h-4 w-4 sm:h-3.5 sm:w-3.5 transition-all duration-500", isActive && "animate-pulse")} />
      )}
    </button>
  </div>
);

/**
 * Renders a paragraph as sentences, dimming inactive ones and softly
 * highlighting the active one when its section is being spoken.
 */
const HighlightedParagraph = ({
  text,
  isActiveSection,
  charIndex,
  className,
}: {
  text: string;
  isActiveSection: boolean;
  charIndex: number;
  className?: string;
}) => {
  // Simplified highlighting: only section-level, no sentence-level
  // This prevents bugs from sentence-level boundary events
  const spans = splitSentences(text);

  // Not playing this section → plain paragraph, dimmed siblings handled elsewhere.
  if (!isActiveSection) {
    return <p className={cn("text-sm text-foreground/80 leading-relaxed", className)}>{text}</p>;
  }

  // Active section → highlight the whole paragraph
  // Mark it so auto-scroll picks it up, matching list-item behavior.
  return (
    <p
      data-tts-active="true"
      className={cn(
        "text-sm leading-relaxed transition-all duration-500 rounded-md",
        "bg-primary/10 text-foreground px-1 -mx-0.5 shadow-[0_0_18px_hsl(258_60%_60%_/_0.10)]",
        className,
      )}
    >
      {text}
    </p>
  );
};

const BiasCard = ({ bias, headingLabel = "Today's Bias" }: BiasCardProps) => {
  const tts = useTTS();
  const isMobile = isMobileBrowser();

  const handlePlaySection = (sectionId: string) => {
    // play() now handles canceling and waiting internally
    void tts.play(getSectionText(bias, sectionId), sectionId);
  };

  const handleListenAll = () => {
    // playAll() now handles canceling and waiting internally
    void tts.playAll(
      sections.map((s) => {
        const spokenPrefix = `${s.label}. `;
        return {
          id: s.id,
          text: `${spokenPrefix}${getSectionText(bias, s.id)}`,
          spokenPrefix,
        };
      }),
    );
  };

  const isActive = (id: string) => tts.playbackMode === "section" && tts.activeSection === id && tts.state !== "idle";
  const isPlaying = tts.state !== "idle";
  const charIndex = tts.activeCharIndex;

  const activeExampleIdx = activeListIndex(bias.examples, isActive("examples"), charIndex);
  const activeCounterIdx = activeListIndex(bias.counterSteps, isActive("counterSteps"), charIndex);
  const activeTipIdx = activeListIndex(bias.tips, isActive("tips"), charIndex);

  // Auto-scroll the active sentence/list-item into view as TTS progresses.
  const cardRef = useRef<HTMLDivElement>(null);
  const lastScrolledRef = useRef<Element | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  useEffect(() => {
    // Disable auto-scroll on mobile to prevent performance issues
    if (isMobile) return;
    
    if (tts.state === "idle" || !tts.activeSection) {
      lastScrolledRef.current = null;
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      return;
    }
    
    // Throttle scroll using requestAnimationFrame to prevent performance issues
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
    }
    
    scrollRafRef.current = requestAnimationFrame(() => {
      const root = cardRef.current;
      if (!root) return;
      const el = root.querySelector('[data-tts-active="true"]');
      if (!el || el === lastScrolledRef.current) return;
      lastScrolledRef.current = el;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Only scroll when the active element is outside the comfortable middle band.
      if (rect.top < vh * 0.2 || rect.bottom > vh * 0.8) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      scrollRafRef.current = null;
    });
    
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [tts.state, tts.activeSection, tts.activeCharIndex,
      activeExampleIdx, activeCounterIdx, activeTipIdx, isMobile]);

  const listItemClass = (active: boolean, baseDimmed: string) =>
    cn(
      "transition-all duration-500 rounded-md px-1 -mx-1",
      active
        ? "bg-primary/10 text-foreground shadow-[0_0_18px_hsl(258_60%_60%_/_0.10)]"
        : baseDimmed,
    );

  return (
    <div ref={cardRef} className="glass rounded-3xl p-6 sm:p-10 space-y-7 animate-fade-up">
      {/* Header */}
      <div className="text-center space-y-3 pb-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60">{headingLabel}</p>
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text leading-tight">{bias.title}</h2>

        {/* Listen All controls — separate touch-friendly buttons */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {tts.state === "idle" && (
              <button
                type="button"
                onClick={handleListenAll}
                aria-label="Listen to all sections"
                className={cn(
                  "inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium touch-manipulation",
                  "bg-gradient-to-r from-primary/15 to-accent/15 text-foreground/80",
                  "border border-primary/10 hover:border-primary/25",
                  "hover:shadow-[0_0_20px_hsl(258_60%_60%_/_0.12)] transition-all duration-500",
                )}
              >
                <Play className="h-4 w-4" />
                Listen All
              </button>
            )}
            {tts.playbackMode === "section" && tts.state === "idle" && (
              <button
                type="button"
                onClick={handleListenAll}
                aria-label="Listen to all sections"
                className={cn(
                  "inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium touch-manipulation",
                  "bg-gradient-to-r from-primary/15 to-accent/15 text-foreground/80",
                  "border border-primary/10 hover:border-primary/25",
                  "hover:shadow-[0_0_20px_hsl(258_60%_60%_/_0.12)] transition-all duration-500",
                )}
              >
                <Play className="h-4 w-4" />
                Listen All
              </button>
            )}
            {tts.playbackMode === "all" && tts.state === "playing" && (
              <>
                {/* Desktop: show Pause + Stop */}
                {!isMobile && (
                  <button
                    type="button"
                    onClick={tts.pause}
                    aria-label="Pause playback"
                    className={cn(
                      "inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-full text-sm font-medium touch-manipulation",
                      "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground",
                      "border border-primary/30 shadow-[0_0_24px_hsl(258_60%_60%_/_0.18)] transition-all duration-500",
                    )}
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={tts.stop}
                  aria-label="Stop playback"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-full text-sm font-medium touch-manipulation",
                    "border border-primary/10 bg-primary/5 text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-300",
                  )}
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </>
            )}
            {/* Desktop only: paused state with Resume */}
            {!isMobile && tts.playbackMode === "all" && tts.state === "paused" && (
              <>
                <button
                  type="button"
                  onClick={tts.resume}
                  aria-label="Resume playback"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-full text-sm font-medium touch-manipulation",
                    "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground",
                    "border border-primary/30 shadow-[0_0_24px_hsl(258_60%_60%_/_0.18)] transition-all duration-500",
                  )}
                >
                  <Play className="h-4 w-4" />
                  Resume
                </button>
                <button
                  type="button"
                  onClick={tts.stop}
                  aria-label="Stop playback"
                  className={cn(
                    "inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-full text-sm font-medium touch-manipulation",
                    "border border-primary/10 bg-primary/5 text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-300",
                  )}
                >
                  <Square className="h-4 w-4" />
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Queue progress bar — only during Listen All */}
          <div
            className={cn(
              "h-[2px] w-40 rounded-full bg-primary/10 overflow-hidden transition-all duration-500",
              tts.isQueue && isPlaying ? "opacity-100" : "opacity-0"
            )}
            role="progressbar"
            aria-valuenow={Math.round(tts.queueProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Listen All progress"
          >
            <div
              className="h-full bg-gradient-to-r from-primary/70 to-accent/70 transition-[width] duration-700 ease-out"
              style={{ width: `${tts.queueProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

      {/* 1. Definition */}
      <div className={cn(
        "group/section rounded-2xl px-4 py-3 -mx-1 transition-all duration-500",
        isActive("definition") && "bg-primary/[0.04] ring-1 ring-primary/10"
      )}>
        <SectionTitle icon={Brain} label="Definition" isActive={isActive("definition")} onPlay={() => handlePlaySection("definition")} onStop={() => tts.stop()} />
        <HighlightedParagraph text={bias.definition} isActiveSection={isActive("definition")} charIndex={charIndex} />
      </div>

      {/* 2. Why it happens */}
      <div className={cn(
        "group/section rounded-2xl px-4 py-3 -mx-1 transition-all duration-500",
        isActive("whyItHappens") && "bg-primary/[0.04] ring-1 ring-primary/10"
      )}>
        <SectionTitle icon={Lightbulb} label="Why it happens" isActive={isActive("whyItHappens")} onPlay={() => handlePlaySection("whyItHappens")} onStop={() => tts.stop()} />
        <HighlightedParagraph text={bias.whyItHappens} isActiveSection={isActive("whyItHappens")} charIndex={charIndex} />
      </div>

      {/* 3. Real-life examples */}
      <div className={cn(
        "group/section rounded-2xl px-4 py-3 -mx-1 transition-all duration-500",
        isActive("examples") && "bg-primary/[0.04] ring-1 ring-primary/10"
      )}>
        <SectionTitle icon={Eye} label="Real-life examples" isActive={isActive("examples")} onPlay={() => handlePlaySection("examples")} onStop={() => tts.stop()} />
        <ul className="space-y-2">
          {bias.examples.map((ex, i) => {
            const active = i === activeExampleIdx;
            return (
              <li key={i} data-tts-active={active ? "true" : undefined} className={cn(
                "flex gap-3 text-sm leading-relaxed transition-all duration-500",
                isActive("examples") && !active ? "text-foreground/45" : "text-foreground/80",
              )}>
                <span className={cn(
                  "mt-1.5 h-1 w-1 rounded-full shrink-0 transition-colors duration-500",
                  active ? "bg-primary/80" : "bg-primary/40",
                )} />
                <span className={listItemClass(active, "")}>{ex}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 4. How to counter it */}
      <div className={cn(
        "group/section rounded-2xl border border-primary/10 bg-primary/[0.03] p-5 sm:p-6 transition-all duration-500",
        isActive("counterSteps") && "border-primary/20 shadow-[0_0_24px_hsl(258_60%_60%_/_0.08)]"
      )}>
        <SectionTitle icon={Shield} label="How to counter it" isActive={isActive("counterSteps")} onPlay={() => handlePlaySection("counterSteps")} onStop={() => tts.stop()} />
        <ol className="space-y-3 mt-3">
          {bias.counterSteps.map((step, i) => {
            const active = i === activeCounterIdx;
            return (
              <li key={i} data-tts-active={active ? "true" : undefined} className={cn(
                "flex gap-3 text-sm leading-relaxed transition-all duration-500",
                isActive("counterSteps") && !active ? "text-foreground/45" : "text-foreground/80",
              )}>
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold shrink-0 mt-0.5 transition-all duration-500",
                  active ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary/70",
                )}>
                  {i + 1}
                </span>
                <span className={listItemClass(active, "")}>{step}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 5. Quick tips */}
      <div className={cn(
        "group/section rounded-2xl px-4 py-3 -mx-1 transition-all duration-500",
        isActive("tips") && "bg-primary/[0.04] ring-1 ring-primary/10"
      )}>
        <SectionTitle icon={Sparkles} label="Quick tips" isActive={isActive("tips")} onPlay={() => handlePlaySection("tips")} onStop={() => tts.stop()} />
        <ul className="space-y-2">
          {bias.tips.map((tip, i) => {
            const active = i === activeTipIdx;
            return (
              <li key={i} data-tts-active={active ? "true" : undefined} className={cn(
                "flex gap-3 text-sm leading-relaxed transition-all duration-500",
                isActive("tips") && !active ? "text-foreground/45" : "text-foreground/80",
              )}>
                <span className={cn(
                  "mt-1.5 h-1 w-1 rounded-full shrink-0 transition-colors duration-500",
                  active ? "bg-accent/80" : "bg-accent/40",
                )} />
                <span className={listItemClass(active, "")}>{tip}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default BiasCard;
