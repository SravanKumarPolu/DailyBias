"use client"

import type React from "react"
import { memo } from "react"

// Removed framer-motion import - using static divs to prevent flickering
import { Heart, Share2, Copy, Check, Star, Volume2, VolumeX } from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react"
// Removed unused useEffect import
import type { Bias } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BiasExamples, generateExamples, generateTips } from "@/components/bias-examples"
import { BiasResearchInfo } from "@/components/bias-research-info"
import { BiasFeedback } from "@/components/bias-feedback"
import { ExpertReview } from "@/components/expert-review"
import { ShareableCard } from "@/components/shareable-card"
import { getCategoryColor, getCategoryLabel } from "@/lib/category-utils"
import { haptics } from "@/lib/haptics"
import { useTTSController } from "@/hooks/use-tts-controller"
import { useToast } from "@/hooks/use-toast"
import { shareBias } from "@/lib/native-features"

interface BiasCardProps {
  bias: Bias
  variant?: "compact" | "detailed"
  isFavorite?: boolean
  onToggleFavorite?: (e?: React.MouseEvent) => void
  isMastered?: boolean
  onToggleMastered?: (e?: React.MouseEvent) => void
}

function BiasCardComponent({
  bias,
  variant = "detailed",
  isFavorite = false,
  onToggleFavorite,
  isMastered = false,
  onToggleMastered,
}: BiasCardProps) {
  const [copied, setCopied] = useState(false)
  const [favoriteAnimating, setFavoriteAnimating] = useState(false)
  const [masteredAnimating, setMasteredAnimating] = useState(false)
  const favoriteRef = useRef<HTMLButtonElement>(null)
  const masteredRef = useRef<HTMLButtonElement>(null)
  const { speak, pause, resume, reset, state: ttsState, isEnabled, isSupported, activeBiasId, activeSectionId } = useTTSController()
  const { toast } = useToast()

  // Generate unique bias ID for TTS tracking
  const biasId = `${bias.id}-${bias.title}`
  const isCurrentBias = activeBiasId === biasId
  // Only show playing/paused states if this is the current bias AND state matches
  // This prevents "Resume" from appearing incorrectly on other bias cards
  const isPlaying = isCurrentBias && ttsState === "playing"
  const isPaused = isCurrentBias && ttsState === "paused"

  // Reset button should be enabled if there's active speech (playing or paused) for this bias
  const canReset = isCurrentBias && (isPlaying || isPaused)

  // Removed all animation state - using static rendering to prevent flickering

  // Section helpers for section-based listening
  const sectionId = useCallback((key: string) => `${biasId}::${key}`, [biasId])
  const playingSectionKey = isCurrentBias ? (activeSectionId?.split("::")[1] ?? null) : null
  const getSectionLabel = (key: string) => {
    switch (key) {
      case "definition":
        return "Definition"
      case "why":
        return "Why it happens"
      case "counter":
        return "How to counter it"
      case "examples":
        return "Real-World Examples"
      case "tips":
        return "Quick Tips"
      case "full":
        return "Full Bias"
      default:
        return key
    }
  }

  const handleSectionListen = useCallback(async (key: "definition" | "why" | "counter") => {
    if (!isSupported || !isEnabled) return

    const id = sectionId(key)
    const isThisSectionActive = isCurrentBias && activeSectionId === id
    const text =
      key === "definition"
        ? bias.summary
        : key === "why"
        ? bias.why
        : bias.counter

    try {
      if (isThisSectionActive) {
        if (ttsState === "playing") {
          pause()
          return
        }
        if (ttsState === "paused") {
          resume()
          return
        }
      }
      await speak(text, biasId, id)
    } catch (e) {
      console.error("[BiasCard] Section speech error:", e)
    }
  }, [isSupported, isEnabled, isCurrentBias, activeSectionId, ttsState, pause, resume, speak, biasId, bias.summary, bias.why, bias.counter, sectionId])

  const handleShare = async () => {
    haptics.light()
    try {
      await shareBias({
        title: bias.title,
        summary: bias.summary,
        why: bias.why,
        counter: bias.counter,
      })
    } catch {
      // Fallback to copy if share fails
      handleCopy()
    }
  }

  const handleCopy = async () => {
    const text = `🧠 ${bias.title}

📝 Summary: ${bias.summary}

❓ Why it happens: ${bias.why}

✅ How to counter it: ${bias.counter}

🔗 Learn more: ${window.location.href}

#CognitiveBias #Psychology #DebiasDaily #DailyBias`

    await navigator.clipboard.writeText(text)
    haptics.success()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Memoize handlers to prevent recreation and ensure buttons work properly
  // FIX: Don't use preventDefault/stopPropagation on touch events - they can block Android touch handling
  const handleFavoriteClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only prevent default for mouse events, not touch events (Android needs touch events)
    if (e.type === 'click' && 'button' in e && e.button !== 0) {
      e.preventDefault()
    }
    // Don't stop propagation - let events bubble naturally for Android
    haptics.light()

    // Trigger heart-beat animation
    setFavoriteAnimating(true)
    setTimeout(() => setFavoriteAnimating(false), 500)

    // Call the handler - ensure it's called even if component re-renders
    if (onToggleFavorite) {
      // Pass empty event or undefined instead of the event object
      onToggleFavorite()
    }
  }, [onToggleFavorite])

  const handleMasteredClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only prevent default for mouse events, not touch events (Android needs touch events)
    if (e.type === 'click' && 'button' in e && e.button !== 0) {
      e.preventDefault()
    }
    // Don't stop propagation - let events bubble naturally for Android
    haptics.success()

    // Trigger bounce animation
    setMasteredAnimating(true)
    setTimeout(() => setMasteredAnimating(false), 600)

    // Call the handler - ensure it's called even if component re-renders
    if (onToggleMastered) {
      // Pass empty event or undefined instead of the event object
      onToggleMastered()
    }
  }, [onToggleMastered])

  // MOBILE FIX: Use ref to prevent double-firing on mobile (both onClick and onTouchEnd can fire)
  const isHandlingSpeakRef = useRef(false)

  // Generate full bias card content text
  const generateBiasText = useCallback(() => {
    const examples = generateExamples(bias)
    const tips = generateTips(bias)

    // Build comprehensive text in order: title, summary, why, counter, examples, tips
    let text = `${bias.title}. ${bias.summary}. Why it happens: ${bias.why}. How to counter it: ${bias.counter}.`

    // Add real-world examples
    if (examples.length > 0) {
      text += ` Real world examples: ${examples.join('. ')}.`
    }

    // Add quick tips
    if (tips.length > 0) {
      text += ` Quick tips: ${tips.join('. ')}.`
    }

    return text
  }, [bias])

  // Handle Listen/Pause/Resume button
  const handleListen = useCallback(async (e?: React.MouseEvent | React.TouchEvent) => {
    // MOBILE FIX: Prevent double-firing from both onClick and onTouchEnd
    if (isHandlingSpeakRef.current) {
      return
    }
    isHandlingSpeakRef.current = true

    // Reset flag after a short delay
    const resetFlag = () => {
      setTimeout(() => {
        isHandlingSpeakRef.current = false
      }, 300)
    }

    // Only prevent default for mouse events, not touch events (Android needs touch events)
    if (e && e.type === 'click' && 'button' in e && e.button !== 0) {
      e.preventDefault()
    }

    if (!isSupported) {
      // Check if we're in an in-app browser
      const userAgent = navigator.userAgent.toLowerCase()
      const isInAppBrowser =
        userAgent.includes('telegram') ||
        userAgent.includes('whatsapp') ||
        userAgent.includes('fbav') ||
        userAgent.includes('fban') ||
        userAgent.includes('instagram') ||
        userAgent.includes('twitterandroid') ||
        userAgent.includes('twitterios') ||
        userAgent.includes('linkedinapp')

      if (isInAppBrowser) {
        toast({
          title: "Open in Browser",
          description: "Voice reading works better in Chrome or Safari. Tap the banner above to open in your browser.",
          duration: 5000,
        })
      } else {
        toast({
          title: "Not Supported",
          description: "Your browser doesn't support text-to-speech functionality.",
          variant: "destructive",
        })
      }
      resetFlag()
      return
    }

    if (!isEnabled) {
      toast({
        title: "Voice Disabled",
        description: "Enable voice in Settings to use this feature.",
      })
      resetFlag()
      return
    }

    // MOBILE FIX: Add haptic feedback immediately on user interaction
    haptics.light()

    try {
      // If paused for this bias, resume
      if (isPaused) {
        await resume()
        resetFlag()
        return
      }

      // If playing this bias, pause
      if (isPlaying) {
        pause()
        resetFlag()
        return
      }

      // Otherwise, start speaking from the beginning
      // (This ensures that if we're in idle state, we start fresh)
      const text = generateBiasText()
      await speak(text, biasId)
    } catch (error) {
      console.error('[BiasCard] Speech error:', error)
      toast({
        title: "Speech Error",
        description: "Could not start speech. Try again or check Settings.",
        variant: "destructive",
      })
    } finally {
      resetFlag()
    }
  }, [isSupported, isEnabled, isPlaying, isPaused, pause, resume, speak, biasId, generateBiasText, toast])

  // Handle Reset button
  const handleReset = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e && e.type === 'click' && 'button' in e && e.button !== 0) {
      e.preventDefault()
    }

    haptics.light()
    reset()

    toast({
      title: "Reset",
      description: "Playback has been reset.",
      duration: 2000,
    })
  }, [reset, toast])

  // Stop speech when switching to a different bias
  useEffect(() => {
    if (activeBiasId !== null && activeBiasId !== biasId && (isPlaying || isPaused)) {
      // Another bias is playing, but this component is still mounted
      // The TTS controller will handle stopping when speak() is called with a different biasId
    }
  }, [activeBiasId, biasId, isPlaying, isPaused])

  if (variant === "compact") {
    return (
        <div
        className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer sm:rounded-2xl sm:p-5 md:p-6"
        // Removed motion.div to prevent flickering - using static div instead
        role="article"
        tabIndex={0}
        aria-label={`${bias.title} - ${bias.category} bias`}
        data-testid="bias-card"
      >
        {/* Gradient overlay for depth - FIX: pointer-events-none to prevent blocking buttons */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />

        {/* Inner highlight - FIX: pointer-events-none to prevent blocking buttons */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4 sm:gap-5">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`text-xs sm:text-sm lg:text-base xl:text-base 2xl:text-lg ${getCategoryColor(bias.category)}`}>
                {getCategoryLabel(bias.category)}
              </Badge>
              {bias.researchLevel && (
                <Badge
                  variant="outline"
                  className={`text-xs sm:text-sm lg:text-base xl:text-base 2xl:text-lg font-semibold ${
                    bias.researchLevel === 'established'
                      ? 'border-success/50 bg-success text-success-foreground dark:border-success/60 dark:bg-success dark:text-success-foreground'
                      : bias.researchLevel === 'emerging'
                      ? 'border-warning/50 bg-warning text-warning-foreground dark:border-warning/60 dark:bg-warning dark:text-warning-foreground'
                      : 'border-destructive/50 bg-destructive text-destructive-foreground dark:border-destructive/60 dark:bg-destructive dark:text-destructive-foreground'
                  }`}
                >
                  {bias.researchLevel === 'established' ? 'Well-Established' :
                   bias.researchLevel === 'emerging' ? 'Emerging Research' :
                   'Contested'}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-balance leading-tight sm:text-xl sm:line-clamp-2">
              {bias.title}
            </h3>
            <p className="text-foreground/80 text-sm leading-relaxed text-pretty sm:text-base line-clamp-3">
              {bias.summary}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2">
            {onToggleFavorite && (
              <Button
                ref={favoriteRef}
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                onTouchEnd={handleFavoriteClick}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={isFavorite}
                tabIndex={0}
                data-testid="bias-favorite-button"
                className="touch-target min-h-[44px] min-w-[44px]"
                style={{
                  touchAction: 'manipulation',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  pointerEvents: 'auto',
                  zIndex: 10,
                  userSelect: 'none'
                }}
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5 ${
                    isFavorite ? "fill-destructive text-destructive" : ""
                  } ${favoriteAnimating ? "animate-heart-beat" : ""}`}
                />
              </Button>
            )}
            {onToggleMastered && (
              <Button
                ref={masteredRef}
                variant="ghost"
                size="icon"
                onClick={handleMasteredClick}
                onTouchEnd={handleMasteredClick}
                aria-label={isMastered ? "Unmark as mastered" : "Mark as mastered"}
                aria-pressed={isMastered}
                tabIndex={0}
                className="touch-target min-h-[44px] min-w-[44px]"
                style={{
                  touchAction: 'manipulation',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  pointerEvents: 'auto',
                  zIndex: 10,
                  userSelect: 'none'
                }}
              >
                <Star
                  className={`h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5 ${
                    isMastered ? "fill-warning text-warning-foreground" : ""
                  } ${masteredAnimating ? "animate-bounce-subtle" : ""}`}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group relative mx-auto w-full max-w-2xl rounded-xl bg-card/60 backdrop-blur-md border border-border/60 p-6 shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer sm:rounded-2xl sm:p-8 md:p-10 xl:max-w-2xl 2xl:max-w-2xl"
      // Removed motion.div props to prevent flickering - using static div instead
      // Removed overflow-hidden to allow absolutely positioned buttons to be visible
      role="article"
      aria-labelledby="bias-title"
      data-testid="bias-card"
      suppressHydrationWarning
    >
      {/* Background and decorative elements wrapper with overflow-hidden for rounded corners */}
      <div className="absolute inset-0 overflow-hidden rounded-xl sm:rounded-2xl pointer-events-none">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* Top highlight */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* Side glow effect */}
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>

      <div className="relative space-y-8 sm:space-y-10 md:space-y-12">
        {/* Header - Using CSS Grid for better mobile layout */}
        {/* pr-28 (112px) reserves space for absolutely positioned buttons: 44px button + 8px gap + 44px button + 16px right margin */}
        <div className="space-y-4 pr-28">
          {/* Row 1: Category badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`text-xs ${getCategoryColor(bias.category)}`}>
              {getCategoryLabel(bias.category)}
            </Badge>
            {bias.researchLevel && (
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  bias.researchLevel === 'established'
                    ? 'border-success/50 bg-success text-success-foreground dark:border-success/60 dark:bg-success dark:text-success-foreground'
                    : bias.researchLevel === 'emerging'
                    ? 'border-warning/50 bg-warning text-warning-foreground dark:border-warning/60 dark:bg-warning dark:text-warning-foreground'
                    : 'border-destructive/50 bg-destructive text-destructive-foreground dark:border-destructive/60 dark:bg-destructive dark:text-destructive-foreground'
                }`}
              >
                {bias.researchLevel === 'established' ? 'Well-Established' :
                 bias.researchLevel === 'emerging' ? 'Emerging Research' :
                 'Contested'}
              </Badge>
            )}
          </div>

          {/* Row 2: Title spans full width - padding-right prevents overlap with buttons */}
          <h2
            id="bias-title"
            className="w-full font-bold tracking-tight text-balance break-normal hyphens-auto leading-tight
             text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl"
          >
            {bias.title}
          </h2>
        </div>

        {/* Summary - Enhanced as key definition section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground/80 text-sm font-semibold tracking-wide uppercase sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
              Definition
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSectionListen("definition")}
              aria-label={
                isCurrentBias && activeSectionId === sectionId("definition")
                  ? ttsState === "playing" ? "Pause Definition" : "Resume Definition"
                  : "Listen to Definition"
              }
              className="h-8 px-2"
              disabled={!isSupported || !isEnabled}
            >
              {isCurrentBias && activeSectionId === sectionId("definition") && ttsState === "playing" ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-base leading-relaxed text-pretty sm:text-lg lg:text-xl xl:text-xl 2xl:text-xl text-foreground">
            {bias.summary}
          </p>
        </div>

        {/* Why it happens */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground/80 text-sm font-semibold tracking-wide uppercase sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
              Why it happens
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSectionListen("why")}
              aria-label={
                isCurrentBias && activeSectionId === sectionId("why")
                  ? ttsState === "playing" ? "Pause Why it happens" : "Resume Why it happens"
                  : "Listen to Why it happens"
              }
              className="h-8 px-2"
              disabled={!isSupported || !isEnabled}
            >
              {isCurrentBias && activeSectionId === sectionId("why") && ttsState === "playing" ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-base leading-relaxed text-pretty sm:text-lg lg:text-xl xl:text-xl 2xl:text-xl text-foreground">{bias.why}</p>
        </div>

        {/* How to counter */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground/80 text-sm font-semibold tracking-wide uppercase sm:text-base lg:text-lg xl:text-lg 2xl:text-xl">
              How to counter it
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSectionListen("counter")}
              aria-label={
                isCurrentBias && activeSectionId === sectionId("counter")
                  ? ttsState === "playing" ? "Pause How to counter it" : "Resume How to counter it"
                  : "Listen to How to counter it"
              }
              className="h-8 px-2"
              disabled={!isSupported || !isEnabled}
            >
              {isCurrentBias && activeSectionId === sectionId("counter") && ttsState === "playing" ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-base leading-relaxed text-pretty sm:text-lg lg:text-xl xl:text-xl 2xl:text-xl text-foreground">{bias.counter}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4 sm:pt-6">
          {/* Currently Playing Label */}
          {isCurrentBias && (isPlaying || isPaused) && playingSectionKey && (
            <div className="text-xs text-muted-foreground -mb-1">
              Playing: {getSectionLabel(playingSectionKey as string)} {isPaused ? "(paused)" : ""}
            </div>
          )}
          {/* Primary Actions Row 1: Listen + Reset */}
          <div className="flex gap-3">
            <Button
              onClick={handleListen}
              onTouchStart={(e) => {
                // MOBILE FIX: Use onTouchStart for immediate response on mobile
                // Note: preventDefault() removed - passive listeners can't prevent default
                // Double-firing is prevented by isHandlingSpeakRef guard in handleListen
                handleListen(e)
              }}
              onTouchEnd={(e) => {
                // MOBILE FIX: Also handle onTouchEnd as fallback
                // Only fire if onTouchStart didn't already handle it
                if (!isHandlingSpeakRef.current) {
                  handleListen(e)
                }
              }}
              variant="outline"
              className={`flex-1 text-base transition-all duration-200 sm:text-lg min-h-[44px] touch-target ${
                isPlaying ? "animate-pulse" : ""
              }`}
              style={{
                touchAction: 'manipulation',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto',
                userSelect: 'none'
              }}
              aria-label={
                isPlaying
                  ? "Pause speaking"
                  : isPaused
                  ? "Resume speaking"
                  : "Read bias aloud"
              }
              title={
                !isSupported
                  ? "Speech not supported in this browser"
                  : !isEnabled
                  ? "Enable voice in Settings first"
                  : isPlaying
                  ? "Pause reading"
                  : isPaused
                  ? "Resume reading"
                  : "Read this bias aloud"
              }
              disabled={!isSupported || !isEnabled}
            >
              {isPlaying ? (
                <>
                  <VolumeX
                    className="mr-2 h-4 w-4 transition-transform duration-200"
                    aria-hidden="true"
                  />
                  <span>Pause</span>
                </>
              ) : isPaused ? (
                <>
                  <Volume2
                    className="mr-2 h-4 w-4 transition-transform duration-200"
                    aria-hidden="true"
                  />
                  <span>Resume</span>
                </>
              ) : !isEnabled ? (
                <>
                  <VolumeX
                    className="mr-2 h-4 w-4 transition-transform duration-200 opacity-50"
                    aria-hidden="true"
                  />
                  <span>Voice Off</span>
                </>
              ) : (
                <>
                  <Volume2
                    className="mr-2 h-4 w-4 transition-transform duration-200"
                    aria-hidden="true"
                  />
                  <span>Listen</span>
                </>
              )}
            </Button>
            {/* Reset button - always available when TTS is supported and enabled */}
            <Button
              onClick={handleReset}
              onTouchEnd={handleReset}
              variant="outline"
              className="flex-1 text-base transition-all duration-200 sm:text-lg min-h-[44px] touch-target"
              style={{
                touchAction: 'manipulation',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto',
                userSelect: 'none'
              }}
              aria-label="Reset playback"
              title="Reset playback to beginning"
              disabled={!isSupported || !isEnabled || !canReset}
            >
              <span>Reset</span>
            </Button>
          </div>
          {/* Primary Actions Row 2: Share + Copy */}
          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              onTouchEnd={handleShare}
              variant="outline"
              className="flex-1 text-base transition-all duration-200 sm:text-lg min-h-[44px] touch-target"
              style={{
                touchAction: 'manipulation',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto',
                userSelect: 'none'
              }}
              aria-label="Share this bias"
            >
              <Share2 className="mr-2 h-4 w-4 transition-transform duration-200" aria-hidden="true" />
              Share
            </Button>
            <Button
              onClick={handleCopy}
              onTouchEnd={handleCopy}
              variant="outline"
              className={`flex-1 text-base transition-all duration-200 sm:text-lg min-h-[44px] touch-target ${
                copied ? "animate-scale-in" : ""
              }`}
              style={{
                touchAction: 'manipulation',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto',
                userSelect: 'none'
              }}
              aria-label={copied ? "Copied to clipboard" : "Copy bias to clipboard"}
            >
              {copied ? (
                <>
                  <Check
                    className="mr-2 h-4 w-4 text-success transition-all duration-200"
                    aria-hidden="true"
                  />
                  Copied
                </>
              ) : (
                <>
                  <Copy
                    className="mr-2 h-4 w-4 transition-transform duration-200"
                    aria-hidden="true"
                  />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Quick Reference Card Button */}
          <ShareableCard bias={bias} />
        </div>

        {/* Examples and Tips */}
        <BiasExamples bias={bias} />

        {/* Research & Sources */}
        <BiasResearchInfo bias={bias} />

        {/* User Feedback */}
        <BiasFeedback bias={bias} />

        {/* Expert Review */}
        <ExpertReview bias={bias} />

        {/* Source badge */}
        {bias.source === "user" && (
          <div className="pt-4">
            <Badge variant="outline" className="text-xs">
              Custom Bias
            </Badge>
          </div>
        )}
      </div>

      {/* Icons positioned absolutely at top-right of card - moved after main content for proper keyboard navigation order */}
      {(onToggleFavorite || onToggleMastered) && (
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              onTouchEnd={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorite}
              data-testid="bias-favorite-button"
              className="touch-target min-h-[44px] min-w-[44px]"
              style={{
                touchAction: 'manipulation',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto',
                zIndex: 20,
                userSelect: 'none'
              }}
            >
              <Heart
                className={`h-5 w-5 transition-all duration-200 sm:h-6 sm:w-6 ${
                  isFavorite ? "fill-destructive text-destructive" : ""
                } ${favoriteAnimating ? "animate-heart-beat" : ""}`}
              />
            </Button>
          )}
          {onToggleMastered && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMasteredClick}
              onTouchEnd={handleMasteredClick}
              aria-label={isMastered ? "Unmark as mastered" : "Mark as mastered"}
              aria-pressed={isMastered}
              className="touch-target min-h-[44px] min-w-[44px]"
              style={{
                touchAction: 'manipulation',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
                pointerEvents: 'auto',
                zIndex: 20,
                userSelect: 'none'
              }}
            >
              <Star
                className={`h-5 w-5 transition-all duration-200 sm:h-6 sm:w-6 ${
                  isMastered ? "fill-warning text-warning-foreground" : ""
                } ${masteredAnimating ? "animate-bounce-subtle" : ""}`}
              />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Memoize BiasCard to prevent unnecessary re-renders
export const BiasCard = memo(BiasCardComponent, (prevProps: BiasCardProps, nextProps: BiasCardProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.bias.id === nextProps.bias.id &&
    prevProps.bias.title === nextProps.bias.title &&
    prevProps.bias.summary === nextProps.bias.summary &&
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.isMastered === nextProps.isMastered &&
    prevProps.variant === nextProps.variant &&
    prevProps.onToggleFavorite === nextProps.onToggleFavorite &&
    prevProps.onToggleMastered === nextProps.onToggleMastered
  )
})
