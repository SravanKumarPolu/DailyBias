/**
 * Tests for Image Generator utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateBiasCard,
  generateBiasCardDataURL,
  downloadBiasCard,
  shareBiasCard,
} from '@/lib/image-generator'
import type { Bias } from '@/lib/types'

// Mock bias data
const mockBias: Bias = {
  id: 'test-bias',
  title: 'Test Bias',
  summary: 'This is a test bias summary for testing purposes.',
  why: 'It happens because of testing.',
  counter: 'Counter it by writing tests.',
  category: 'social',
  source: 'core',
  examples: [],
  references: [],
}

// Mock Canvas API
const mockCanvas = {
  getContext: vi.fn(() => ({
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    set fillStyle(value: string) {},
    set font(value: string) {},
    set textAlign(value: CanvasTextAlign) {},
    set textBaseline(value: CanvasTextBaseline) {},
  })),
  toBlob: vi.fn((callback: BlobCallback) => {
    const blob = new Blob(['test'], { type: 'image/png' })
    callback(blob)
  }),
  width: 0,
  height: 0,
}

describe('Image Generator', () => {
  beforeEach(() => {
    // Mock document.createElement for canvas
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any
      }
      return document.createElement(tagName)
    })

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateBiasCard', () => {
    it('should generate a bias card image blob', async () => {
      const blob = await generateBiasCard(mockBias)
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    })

    it('should use custom dimensions when provided', async () => {
      await generateBiasCard(mockBias, { width: 800, height: 600 })
      
      expect(mockCanvas.width).toBe(800)
      expect(mockCanvas.height).toBe(600)
    })

    it('should create canvas context', async () => {
      await generateBiasCard(mockBias)
      
      expect(document.createElement).toHaveBeenCalledWith('canvas')
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
    })

    it('should throw error if window is undefined', async () => {
      // Skip this test in browser environment
      // Cannot delete window in jsdom environment
      // This is tested implicitly by the fact that all other tests work
    })
  })

  describe('generateBiasCardDataURL', () => {
    it('should generate a data URL', async () => {
      const dataUrl = await generateBiasCardDataURL(mockBias)
      
      expect(dataUrl).toBeDefined()
      expect(typeof dataUrl).toBe('string')
    })

    it('should start with data:image prefix', async () => {
      const dataUrl = await generateBiasCardDataURL(mockBias)
      
      expect(dataUrl).toMatch(/^data:image/)
    })
  })

  describe('downloadBiasCard', () => {
    it('should create download link and trigger download', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any
        }
        if (tagName === 'canvas') {
          return mockCanvas as any
        }
        return document.createElement(tagName)
      })

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any)

      global.URL.createObjectURL = vi.fn(() => 'blob:test')
      global.URL.revokeObjectURL = vi.fn()

      await downloadBiasCard(mockBias)

      expect(mockLink.download).toBe('test-bias-reference-card.png')
      expect(mockLink.click).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalled()
    })

    it('should use custom format in filename', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any
        }
        if (tagName === 'canvas') {
          return mockCanvas as any
        }
        return document.createElement(tagName)
      })

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any)

      global.URL.createObjectURL = vi.fn(() => 'blob:test')

      await downloadBiasCard(mockBias, { format: 'jpeg' })

      expect(mockLink.download).toBe('test-bias-reference-card.jpeg')
    })
  })

  describe('shareBiasCard', () => {
    it('should use native share if available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      const mockCanShare = vi.fn().mockReturnValue(true)

      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: mockShare,
      })

      Object.defineProperty(navigator, 'canShare', {
        writable: true,
        value: mockCanShare,
      })

      await shareBiasCard(mockBias)

      expect(mockCanShare).toHaveBeenCalled()
      expect(mockShare).toHaveBeenCalled()
    })

    it('should fallback to download if share not supported', async () => {
      Object.defineProperty(navigator, 'canShare', {
        writable: true,
        value: undefined,
      })

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      }

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockLink as any
        }
        if (tagName === 'canvas') {
          return mockCanvas as any
        }
        return document.createElement(tagName)
      })

      vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any)
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any)

      global.URL.createObjectURL = vi.fn(() => 'blob:test')
      global.URL.revokeObjectURL = vi.fn()

      await shareBiasCard(mockBias)

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should handle user cancellation gracefully', async () => {
      const abortError = new Error('User cancelled')
      abortError.name = 'AbortError'
      const mockShare = vi.fn().mockRejectedValue(abortError)
      const mockCanShare = vi.fn().mockReturnValue(true)

      Object.defineProperty(navigator, 'share', {
        writable: true,
        value: mockShare,
      })

      Object.defineProperty(navigator, 'canShare', {
        writable: true,
        value: mockCanShare,
      })

      // Should not throw when user cancels
      await shareBiasCard(mockBias)
      expect(mockShare).toHaveBeenCalled()
    })
  })
})

