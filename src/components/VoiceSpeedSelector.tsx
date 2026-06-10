import { useMemo, useRef, useState } from "react";
import { Minus, Plus, Settings2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  useTTSSettings,
  useVoices,
  useTTSAvailability,
  RATE_PRESETS,
  VOLUME_STEP,
  clampVolume,
} from "@/hooks/useTTSSettings";
import { cn } from "@/lib/utils";

const AUTO_VALUE = "__auto__";

const VoiceSpeedSelector = () => {
  const voices = useVoices();
  const availability = useTTSAvailability();
  const { voiceURI, setVoiceURI, rate, setRate, volume, setVolume } = useTTSSettings();
  const volumePercent = Math.round(volume * 100);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const disabled = availability !== "ready";

  // Prefer English voices at the top, then everything else.
  const sortedVoices = useMemo(() => {
    const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
    const rest = voices.filter((v) => !v.lang.toLowerCase().startsWith("en"));
    return [...en, ...rest];
  }, [voices]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-label="Voice, speed and volume settings"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-disabled={disabled}
          data-state={open ? "open" : "closed"}
          className={cn(
            // Larger tap target on mobile (≥44px), compact on desktop.
            "inline-flex items-center justify-center rounded-full border bg-primary/5",
            "h-11 w-11 sm:h-7 sm:w-7",
            "transition-all duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            // Clearer open vs closed states.
            disabled && "opacity-50 cursor-not-allowed",
            open
              ? "border-primary/40 bg-primary/15 text-foreground shadow-[0_0_18px_hsl(258_60%_60%_/_0.22)]"
              : "border-primary/10 text-foreground/60 hover:text-foreground/90 hover:bg-primary/10 hover:border-primary/20",
          )}
        >
          <Settings2
            className={cn(
              "h-4 w-4 sm:h-3 sm:w-3 transition-transform duration-300",
              open && "rotate-45",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className={cn(
          "glass border-primary/10",
          // Roomier on mobile, original sizing on desktop.
          "w-[min(92vw,20rem)] sm:w-72",
          "p-5 sm:p-4 space-y-5 sm:space-y-4",
          "focus-visible:outline-none",
        )}
        onClick={(e) => e.stopPropagation()}
        onOpenAutoFocus={(e) => {
          // Avoid auto-focusing the Select on mobile, which can immediately
          // open the native picker on top of the popover.
          e.preventDefault();
        }}
        onCloseAutoFocus={(e) => {
          // Return focus to the trigger so keyboard users keep their place.
          e.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        {availability !== "ready" && (
          <div
            role="status"
            className={cn(
              "rounded-xl border px-3 py-2.5 text-[11px] leading-relaxed",
              availability === "loading"
                ? "border-primary/15 bg-primary/5 text-foreground/70"
                : "border-destructive/30 bg-destructive/10 text-foreground/80",
            )}
          >
            {availability === "loading" && "Loading available voices…"}
            {availability === "no-voices" &&
              "No text-to-speech voices found on this device. Listen features won't play audio until a system voice is installed."}
            {availability === "unsupported" &&
              "This browser doesn't support text-to-speech. Try Chrome, Safari, or Edge."}
          </div>
        )}
        <div className="space-y-2.5 sm:space-y-2">
          <label
            htmlFor="tts-voice-select"
            className="block text-[11px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70"
          >
            Voice
          </label>
          <Select
            value={voiceURI ?? AUTO_VALUE}
            onValueChange={(v) => setVoiceURI(v === AUTO_VALUE ? null : v)}
            disabled={disabled}
          >
            <SelectTrigger
              id="tts-voice-select"
              className={cn(
                "text-sm sm:text-xs rounded-xl border-primary/15 bg-primary/5",
                "h-11 sm:h-9",
                "focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 focus:ring-offset-background",
              )}
            >
              <SelectValue placeholder="System default" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value={AUTO_VALUE} className="text-sm sm:text-xs py-2.5 sm:py-1.5">
                System default
              </SelectItem>
              {sortedVoices.map((v) => (
                <SelectItem
                  key={v.voiceURI}
                  value={v.voiceURI}
                  className="text-sm sm:text-xs py-2.5 sm:py-1.5"
                >
                  {v.name}{" "}
                  <span className="text-muted-foreground/60">({v.lang})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span
              id="tts-speed-label"
              className="text-[11px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70"
            >
              Speed
            </span>
            <span className="text-xs text-foreground/70 tabular-nums">
              {rate.toFixed(2)}×
            </span>
          </div>
          <div
            role="radiogroup"
            aria-labelledby="tts-speed-label"
            className="flex items-center gap-1.5 sm:gap-1"
          >
            {RATE_PRESETS.map((r) => {
              const active = Math.abs(rate - r) < 0.01;
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`${r} times speed`}
                  onClick={() => setRate(r)}
                  disabled={disabled}
                  className={cn(
                    "flex-1 rounded-lg text-xs sm:text-[11px] font-medium transition-all duration-300",
                    "min-h-[44px] sm:min-h-0 px-2 py-2 sm:py-1.5",
                    "border",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                    active
                      ? "border-primary/30 bg-primary/15 text-foreground shadow-[0_0_14px_hsl(258_60%_60%_/_0.15)]"
                      : "border-primary/10 bg-primary/5 text-foreground/60 hover:text-foreground/90 hover:border-primary/20",
                  )}
                >
                  {r}×
                </button>
              );
            })}
          </div>
          <p className="text-[11px] sm:text-[10px] text-muted-foreground/60 leading-relaxed">
            Changes apply to the next sentence or playback.
          </p>
        </div>

        <div className="space-y-2.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <span
              id="tts-volume-label"
              className="text-[11px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70"
            >
              Volume
            </span>
            <span
              className="text-xs text-foreground/70 tabular-nums"
              aria-live="polite"
            >
              {volumePercent}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease volume by 10 percent"
              disabled={disabled || volume <= 0}
              onClick={() => setVolume(clampVolume(volume - VOLUME_STEP))}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border border-primary/10 bg-primary/5",
                "h-10 w-10 sm:h-9 sm:w-9 shrink-0",
                "text-foreground/70 hover:text-foreground hover:border-primary/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "disabled:opacity-50 disabled:pointer-events-none",
              )}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <Slider
              value={[volumePercent]}
              min={0}
              max={100}
              step={10}
              disabled={disabled}
              aria-labelledby="tts-volume-label"
              aria-valuetext={`${volumePercent} percent`}
              onValueChange={([next]) => setVolume(next / 100)}
              className="flex-1"
            />
            <button
              type="button"
              aria-label="Increase volume by 10 percent"
              disabled={disabled || volume >= 1}
              onClick={() => setVolume(clampVolume(volume + VOLUME_STEP))}
              className={cn(
                "inline-flex items-center justify-center rounded-lg border border-primary/10 bg-primary/5",
                "h-10 w-10 sm:h-9 sm:w-9 shrink-0",
                "text-foreground/70 hover:text-foreground hover:border-primary/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "disabled:opacity-50 disabled:pointer-events-none",
              )}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VoiceSpeedSelector;
