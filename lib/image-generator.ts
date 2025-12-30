/**
 * Image Generator for Quick Reference Cards
 * Generates shareable bias card images with summary and counter-strategy
 */

import type { Bias } from './types'
import { getCategoryColor, getCategoryLabel } from './category-utils'
import { logger } from './logger'

export interface CardImageOptions {
  width?: number
  height?: number
  format?: 'png' | 'jpeg'
  quality?: number
  includeWatermark?: boolean
}

const DEFAULT_OPTIONS: Required<CardImageOptions> = {
  width: 1080,
  height: 1920,
  format: 'png',
  quality: 0.95,
  includeWatermark: true,
}

/**
 * Generate a shareable image card for a bias
 */
export async function generateBiasCard(
  bias: Bias,
  options: CardImageOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (typeof window === 'undefined') {
    throw new Error('Image generation is only available in the browser')
  }

  const canvas = document.createElement('canvas')
  canvas.width = opts.width
  canvas.height = opts.height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  try {
    // Draw background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, opts.height)
    
    // Get category color for gradient
    const categoryColor = getCategoryColor(bias.category)
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (isDark) {
      gradient.addColorStop(0, '#0a0a0a')
      gradient.addColorStop(0.5, '#1a1a1a')
      gradient.addColorStop(1, '#0a0a0a')
    } else {
      gradient.addColorStop(0, '#ffffff')
      gradient.addColorStop(0.5, '#f5f5f5')
      gradient.addColorStop(1, '#ffffff')
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, opts.width, opts.height)

    // Add accent border on left side
    const accentGradient = ctx.createLinearGradient(0, 0, 0, opts.height)
    accentGradient.addColorStop(0, categoryColor)
    accentGradient.addColorStop(1, adjustColorBrightness(categoryColor, -20))
    ctx.fillStyle = accentGradient
    ctx.fillRect(0, 0, 12, opts.height)

    // Configure text rendering
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const padding = 80
    const contentWidth = opts.width - padding * 2
    let yPosition = padding

    // Draw app name and logo
    ctx.fillStyle = isDark ? '#ffffff' : '#000000'
    ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('🧠 DebiasDaily', padding, yPosition)
    yPosition += 100

    // Draw category badge
    const categoryLabel = getCategoryLabel(bias.category)
    ctx.fillStyle = categoryColor
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const categoryWidth = ctx.measureText(categoryLabel.toUpperCase()).width
    
    // Badge background
    ctx.fillStyle = categoryColor + '20' // 20% opacity
    roundRect(ctx, padding, yPosition, categoryWidth + 48, 60, 30)
    ctx.fill()
    
    // Badge text
    ctx.fillStyle = categoryColor
    ctx.fillText(categoryLabel.toUpperCase(), padding + 24, yPosition + 14)
    yPosition += 120

    // Draw bias title
    ctx.fillStyle = isDark ? '#ffffff' : '#000000'
    ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    
    const titleLines = wrapText(ctx, bias.title, contentWidth - 24)
    for (const line of titleLines) {
      ctx.fillText(line, padding + 24, yPosition)
      yPosition += 90
    }
    yPosition += 60

    // Draw summary section
    ctx.fillStyle = isDark ? '#a0a0a0' : '#666666'
    ctx.font = '36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('📝 What it is', padding + 24, yPosition)
    yPosition += 60

    ctx.fillStyle = isDark ? '#e0e0e0' : '#1a1a1a'
    ctx.font = '44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const summaryLines = wrapText(ctx, bias.summary, contentWidth - 24)
    for (const line of summaryLines.slice(0, 4)) { // Limit to 4 lines
      ctx.fillText(line, padding + 24, yPosition)
      yPosition += 62
    }
    yPosition += 80

    // Draw counter-strategy section
    ctx.fillStyle = isDark ? '#a0a0a0' : '#666666'
    ctx.font = '36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('✅ How to counter it', padding + 24, yPosition)
    yPosition += 60

    ctx.fillStyle = isDark ? '#e0e0e0' : '#1a1a1a'
    ctx.font = '44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    const counterLines = wrapText(ctx, bias.counter, contentWidth - 24)
    for (const line of counterLines.slice(0, 4)) { // Limit to 4 lines
      ctx.fillText(line, padding + 24, yPosition)
      yPosition += 62
    }

    // Draw footer with watermark
    if (opts.includeWatermark) {
      const footerY = opts.height - 100
      ctx.fillStyle = isDark ? '#666666' : '#999999'
      ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.fillText('Learn more at debiasdaily.com', padding + 24, footerY)
    }

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to generate image blob'))
          }
        },
        `image/${opts.format}`,
        opts.quality
      )
    })
  } catch (error) {
    logger.error('[ImageGenerator] Error generating bias card:', error)
    throw error
  }
}

/**
 * Generate a data URL for preview
 */
export async function generateBiasCardDataURL(
  bias: Bias,
  options: CardImageOptions = {}
): Promise<string> {
  const blob = await generateBiasCard(bias, options)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Download the generated card image
 */
export async function downloadBiasCard(
  bias: Bias,
  options: CardImageOptions = {}
): Promise<void> {
  try {
    const blob = await generateBiasCard(bias, options)
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${bias.id}-reference-card.${options.format || 'png'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100)
    
    logger.debug('[ImageGenerator] Downloaded bias card:', bias.id)
  } catch (error) {
    logger.error('[ImageGenerator] Error downloading bias card:', error)
    throw error
  }
}

/**
 * Share the generated card image using native share
 */
export async function shareBiasCard(
  bias: Bias,
  options: CardImageOptions = {}
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Share is only available in the browser')
  }

  try {
    const blob = await generateBiasCard(bias, options)
    const file = new File([blob], `${bias.id}-reference-card.png`, {
      type: 'image/png',
    })

    // Check if Web Share API supports files
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Daily Bias: ${bias.title}`,
        text: `Check out this cognitive bias!`,
        files: [file],
      })
      logger.debug('[ImageGenerator] Shared bias card:', bias.id)
    } else {
      // Fallback: download the image
      await downloadBiasCard(bias, options)
      logger.debug('[ImageGenerator] Web Share not supported, downloaded instead')
    }
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      // User cancelled the share
      logger.debug('[ImageGenerator] Share cancelled by user')
      return
    }
    logger.error('[ImageGenerator] Error sharing bias card:', error)
    throw error
  }
}

/**
 * Helper: Wrap text to fit within a given width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Helper: Draw rounded rectangle
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * Helper: Adjust color brightness
 */
function adjustColorBrightness(color: string, amount: number): string {
  // Simple hex color adjustment
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  
  let r = (num >> 16) + amount
  let g = ((num >> 8) & 0x00ff) + amount
  let b = (num & 0x0000ff) + amount
  
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

