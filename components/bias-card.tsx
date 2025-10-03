"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Heart, Share2, Copy, Check, Star, Volume2, VolumeX } from "lucide-react"
import { useState } from "react"
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
      } catch (error) {
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
    onToggleFavorite?.(e)
  }

  const handleMasteredClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    haptics.success()
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
        className="glass rounded-2xl p-6 hover:shadow-lg"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        role="article"
        tabIndex={0}
        aria-label={`${bias.title} - ${bias.category} bias`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge className={`mb-2 ${getCategoryColor(bias.category)}`}>{getCategoryLabel(bias.category)}</Badge>
            <h3 className="text-lg font-semibold text-balance font-serif">{bias.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground text-pretty leading-relaxed">{bias.summary}</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={isFavorite}
                tabIndex={0}
                className="touch-target"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            )}
            {onToggleMastered && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMasteredClick}
                aria-label={isMastered ? "Unmark as mastered" : "Mark as mastered"}
                aria-pressed={isMastered}
                tabIndex={0}
                className="touch-target"
              >
                <Star className={`h-5 w-5 ${isMastered ? "fill-yellow-500 text-yellow-500" : ""}`} />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="glass rounded-2xl p-8 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="article"
      aria-labelledby="bias-title"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge className={`mb-3 ${getCategoryColor(bias.category)}`}>{getCategoryLabel(bias.category)}</Badge>
            <h1 id="bias-title" className="text-3xl font-bold text-balance font-serif">
              {bias.title}
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={isFavorite}
                className="touch-target"
              >
                <Heart className={`h-6 w-6 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            )}
            {onToggleMastered && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMasteredClick}
                aria-label={isMastered ? "Unmark as mastered" : "Mark as mastered"}
                aria-pressed={isMastered}
                className="touch-target"
              >
                <Star className={`h-6 w-6 ${isMastered ? "fill-yellow-500 text-yellow-500" : ""}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <p className="text-lg leading-relaxed text-pretty">{bias.summary}</p>
        </div>

        {/* Why it happens */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 font-serif">
            Why it happens
          </h2>
          <p className="leading-relaxed text-pretty">{bias.why}</p>
        </div>

        {/* How to counter */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 font-serif">
            How to counter it
          </h2>
          <p className="leading-relaxed text-pretty">{bias.counter}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSpeak}
            variant="outline"
            className={`flex-1 bg-transparent ${isSpeaking ? "animate-pulse" : ""}`}
            aria-label={isSpeaking ? "Stop speaking" : "Read bias aloud"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-4 w-4 mr-2" aria-hidden="true" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Listen
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 bg-transparent"
            aria-label="Share this bias"
          >
            <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Share
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 bg-transparent"
            aria-label={copied ? "Copied to clipboard" : "Copy bias to clipboard"}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                Copy
              </>
            )}
          </Button>
        </div>

        {/* Source badge */}
        {bias.source === "user" && (
          <div className="pt-2">
            <Badge variant="outline">Custom Bias</Badge>
          </div>
        )}
      </div>
    </motion.div>
  )
}
