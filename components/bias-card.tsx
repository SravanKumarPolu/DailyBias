"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Heart, Share2, Copy, Check, Star, Volume2, VolumeX } from "lucide-react"
import { useState, useRef } from "react"
import type { Bias } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCategoryColor, getCategoryLabel } from "@/lib/category-utils"
import { haptics } from "@/lib/haptics"
import { useSpeech } from "@/hooks/use-speech"
import { useToast } from "@/hooks/use-toast"

interface BiasCardProps {
  bias: Bias
  variant?: "compact" | "detailed"
  isFavorite?: boolean
  onToggleFavorite?: (e?: React.MouseEvent) => void
  isMastered?: boolean
  onToggleMastered?: (e?: React.MouseEvent) => void
}

export function BiasCard({
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
  const { speak, stop, isSpeaking, isEnabled, isSupported } = useSpeech()
  const { toast } = useToast()

  const handleShare = async () => {
    const shareText = `🧠 ${bias.title}\n\n${bias.summary}\n\n💡 Learn more cognitive biases at ${window.location.origin}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${bias.title} - Cognitive Bias`,
          text: shareText,
          url: window.location.href,
        })
        haptics.light()
      } catch {
        console.log("[DailyBias] Share cancelled")
      }
    } else {
      handleCopy()
    }
  }

  const handleCopy = async () => {
    const text = `🧠 ${bias.title}

📝 Summary: ${bias.summary}

❓ Why it happens: ${bias.why}

✅ How to counter it: ${bias.counter}

🔗 Learn more: ${window.location.href}

#CognitiveBias #Psychology #DailyBias`

    await navigator.clipboard.writeText(text)
    haptics.success()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    haptics.light()

    // Trigger heart-beat animation
    setFavoriteAnimating(true)
    setTimeout(() => setFavoriteAnimating(false), 500)

    onToggleFavorite?.(e)
  }

  const handleMasteredClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    haptics.success()

    // Trigger bounce animation
    setMasteredAnimating(true)
    setTimeout(() => setMasteredAnimating(false), 600)

    onToggleMastered?.(e)
  }

  const handleSpeak = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive",
      })
      return
    }

    if (!isEnabled) {
      toast({
        title: "Voice Disabled",
        description: "Enable voice in Settings to use this feature.",
      })
      return
    }

    if (isSpeaking) {
      stop()
    } else {
      const text = `${bias.title}. ${bias.summary}. Why it happens: ${bias.why}. How to counter it: ${bias.counter}.`
      speak(text)
      haptics.light()
    }
  }

  if (variant === "compact") {
    return (
      <motion.div
        className="glass hover-lift rounded-xl p-4 transition-shadow duration-300 hover:shadow-lg sm:rounded-2xl sm:p-5 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        role="article"
        tabIndex={0}
        aria-label={`${bias.title} - ${bias.category} bias`}
      >
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <Badge className={`mb-1.5 text-xs sm:mb-2 ${getCategoryColor(bias.category)}`}>
              {getCategoryLabel(bias.category)}
            </Badge>
            <h3 className="mb-1.5 font-serif text-base leading-tight font-semibold text-balance sm:mb-2 sm:text-lg">
              {bias.title}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed text-pretty sm:text-sm">
              {bias.summary}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1 sm:gap-2">
            {onToggleFavorite && (
              <Button
                ref={favoriteRef}
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={isFavorite}
                tabIndex={0}
                className="touch-target hover-grow h-8 w-8 cursor-pointer transition-all duration-200 sm:h-10 sm:w-10"
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
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
                aria-label={isMastered ? "Unmark as mastered" : "Mark as mastered"}
                aria-pressed={isMastered}
                tabIndex={0}
                className="touch-target hover-grow h-8 w-8 cursor-pointer transition-all duration-200 sm:h-10 sm:w-10"
              >
                <Star
                  className={`h-4 w-4 transition-all duration-200 sm:h-5 sm:w-5 ${
                    isMastered ? "fill-yellow-500 text-yellow-500" : ""
                  } ${masteredAnimating ? "animate-bounce-subtle" : ""}`}
                />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="glass mx-auto max-w-2xl rounded-xl p-4 transition-shadow duration-300 sm:rounded-2xl sm:p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      role="article"
      aria-labelledby="bias-title"
    >
      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <Badge className={`mb-2 text-xs sm:mb-3 ${getCategoryColor(bias.category)}`}>
              {getCategoryLabel(bias.category)}
            </Badge>
            <h1
              id="bias-title"
              className="font-serif text-xl font-bold text-balance sm:text-2xl md:text-3xl"
            >
              {bias.title}
            </h1>
          </div>
          <div className="flex shrink-0 gap-1 sm:gap-2">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={isFavorite}
                className="touch-target hover-grow h-9 w-9 cursor-pointer transition-all duration-200 sm:h-10 sm:w-10"
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-200 sm:h-6 sm:w-6 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  } ${favoriteAnimating ? "animate-heart-beat" : ""}`}
                />
              </Button>
            )}
            {onToggleMastered && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMasteredClick}
                aria-label={isMastered ? "Unmark as mastered" : "Mark as mastered"}
                aria-pressed={isMastered}
                className="touch-target hover-grow h-9 w-9 cursor-pointer transition-all duration-200 sm:h-10 sm:w-10"
              >
                <Star
                  className={`h-5 w-5 transition-all duration-200 sm:h-6 sm:w-6 ${
                    isMastered ? "fill-yellow-500 text-yellow-500" : ""
                  } ${masteredAnimating ? "animate-bounce-subtle" : ""}`}
                />
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <p className="text-sm leading-relaxed text-pretty sm:text-base md:text-lg">
            {bias.summary}
          </p>
        </div>

        {/* Why it happens */}
        <div>
          <h2 className="text-muted-foreground mb-1.5 font-serif text-xs font-semibold tracking-wide uppercase sm:mb-2 sm:text-sm">
            Why it happens
          </h2>
          <p className="text-sm leading-relaxed text-pretty sm:text-base">{bias.why}</p>
        </div>

        {/* How to counter */}
        <div>
          <h2 className="text-muted-foreground mb-1.5 font-serif text-xs font-semibold tracking-wide uppercase sm:mb-2 sm:text-sm">
            How to counter it
          </h2>
          <p className="text-sm leading-relaxed text-pretty sm:text-base">{bias.counter}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:pt-4">
          <Button
            onClick={handleSpeak}
            variant="outline"
            className={`button-press hover-lift flex-1 cursor-pointer bg-transparent text-sm transition-all duration-200 sm:text-base ${
              isSpeaking ? "animate-pulse" : ""
            }`}
            aria-label={isSpeaking ? "Stop speaking" : "Read bias aloud"}
          >
            {isSpeaking ? (
              <>
                <VolumeX
                  className="mr-2 h-4 w-4 transition-transform duration-200"
                  aria-hidden="true"
                />
                <span className="xs:inline hidden">Stop</span>
                <span className="xs:hidden">Stop</span>
              </>
            ) : (
              <>
                <Volume2
                  className="mr-2 h-4 w-4 transition-transform duration-200"
                  aria-hidden="true"
                />
                <span className="xs:inline hidden">Listen</span>
                <span className="xs:hidden">Listen</span>
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="button-press hover-lift flex-1 cursor-pointer bg-transparent text-sm transition-all duration-200 sm:text-base"
            aria-label="Share this bias"
          >
            <Share2 className="mr-2 h-4 w-4 transition-transform duration-200" aria-hidden="true" />
            Share
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className={`button-press hover-lift flex-1 cursor-pointer bg-transparent text-sm transition-all duration-200 sm:text-base ${
              copied ? "animate-scale-in" : ""
            }`}
            aria-label={copied ? "Copied to clipboard" : "Copy bias to clipboard"}
          >
            {copied ? (
              <>
                <Check
                  className="mr-2 h-4 w-4 text-green-500 transition-all duration-200"
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

        {/* Source badge */}
        {bias.source === "user" && (
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              Custom Bias
            </Badge>
          </div>
        )}
      </div>
    </motion.div>
  )
}
