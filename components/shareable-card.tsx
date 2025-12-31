"use client"

import type React from "react"
import { useState } from "react"
import { Download, Share2, Eye, Loader2 } from "lucide-react"
import type { Bias } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  generateBiasCardDataURL,
  downloadBiasCard,
  shareBiasCard,
} from "@/lib/image-generator"
import { useToast } from "@/hooks/use-toast"
import { haptics } from "@/lib/haptics"
import { logger } from "@/lib/logger"

interface ShareableCardProps {
  bias: Bias
  trigger?: React.ReactNode
}

export function ShareableCard({ bias, trigger }: ShareableCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const handleOpen = async (open: boolean) => {
    setIsOpen(open)
    
    if (open && !previewUrl) {
      // Generate preview when dialog opens
      await generatePreview()
    }
  }

  const generatePreview = async () => {
    setIsGenerating(true)
    try {
      const dataUrl = await generateBiasCardDataURL(bias, {
        width: 540, // Half size for preview
        height: 960,
        quality: 0.8,
      })
      setPreviewUrl(dataUrl)
      logger.debug('[ShareableCard] Preview generated')
    } catch (error) {
      logger.error('[ShareableCard] Error generating preview:', error)
      toast({
        title: "Preview Failed",
        description: "Could not generate card preview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    haptics.light()
    setIsDownloading(true)
    
    try {
      await downloadBiasCard(bias, {
        width: 1080,
        height: 1920,
        format: 'png',
        quality: 0.95,
      })
      
      haptics.success()
      toast({
        title: "Card Downloaded",
        description: "Your reference card has been saved to your device.",
      })
      
      logger.debug('[ShareableCard] Card downloaded successfully')
    } catch (error) {
      logger.error('[ShareableCard] Error downloading card:', error)
      toast({
        title: "Download Failed",
        description: "Could not download the card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    haptics.light()
    setIsSharing(true)
    
    try {
      await shareBiasCard(bias, {
        width: 1080,
        height: 1920,
        format: 'png',
        quality: 0.95,
      })
      
      haptics.success()
      toast({
        title: "Card Shared",
        description: "Your reference card is ready to share.",
      })
      
      logger.debug('[ShareableCard] Card shared successfully')
    } catch (error) {
      logger.error('[ShareableCard] Error sharing card:', error)
      toast({
        title: "Share Failed",
        description: "Could not share the card. Please try downloading instead.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Reference Card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Quick Reference Card</DialogTitle>
          <DialogDescription>
            Download or share a visual reference card for this bias
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden -mx-6 px-6 space-y-4">
          {/* Preview */}
          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-muted border border-border/50">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Generating preview...
                  </p>
                </div>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={`Reference card for ${bias.title}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Preview unavailable
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownload}
              disabled={isDownloading || isGenerating}
              className="flex-1 gap-2"
              variant="default"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Save to Photos
                </>
              )}
            </Button>

            <Button
              onClick={handleShare}
              disabled={isSharing || isGenerating}
              className="flex-1 gap-2"
              variant="outline"
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center pb-2">
            High-resolution image (1080×1920px) perfect for social media
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

