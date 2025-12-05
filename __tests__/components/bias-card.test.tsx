import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BiasCard } from '@/components/bias-card'
import type { Bias } from '@/lib/types'

// Mock hooks
vi.mock('@/hooks/use-speech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    stop: vi.fn(),
    isSpeaking: false,
    isEnabled: true,
    isSupported: true,
  }),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

vi.mock('@/lib/haptics', () => ({
  haptics: {
    light: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('@/lib/native-features', () => ({
  shareBias: vi.fn(),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

const mockBias: Bias = {
  id: 'test-bias-1',
  title: 'Confirmation Bias',
  category: 'decision',
  summary: 'The tendency to search for, interpret, and recall information that confirms existing beliefs.',
  why: 'Our brains prefer information that matches what we already think.',
  counter: 'Actively seek out opposing viewpoints and challenge your assumptions.',
  source: 'core',
}

describe('BiasCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render bias title', () => {
      render(<BiasCard bias={mockBias} />)
      expect(screen.getByText('Confirmation Bias')).toBeInTheDocument()
    })

    it('should render bias summary', () => {
      render(<BiasCard bias={mockBias} />)
      expect(screen.getByText(/The tendency to search for/)).toBeInTheDocument()
    })

    it('should render "Why it happens" section', () => {
      render(<BiasCard bias={mockBias} />)
      expect(screen.getByText('Why it happens')).toBeInTheDocument()
      expect(screen.getByText(/Our brains prefer information/)).toBeInTheDocument()
    })

    it('should render "How to counter it" section', () => {
      render(<BiasCard bias={mockBias} />)
      expect(screen.getByText('How to counter it')).toBeInTheDocument()
      expect(screen.getByText(/Actively seek out opposing/)).toBeInTheDocument()
    })

    it('should render category badge', () => {
      render(<BiasCard bias={mockBias} />)
      // Category label is "Decision Making" (capitalized)
      expect(screen.getByText('Decision Making')).toBeInTheDocument()
    })

    it('should render compact variant when specified', () => {
      render(<BiasCard bias={mockBias} variant="compact" />)
      expect(screen.getByText('Confirmation Bias')).toBeInTheDocument()
      // Compact variant should still show title and summary
      expect(screen.getByText(/The tendency to search for/)).toBeInTheDocument()
    })
  })

  describe('Favorite Toggle', () => {
    it('should render favorite button when onToggleFavorite is provided', () => {
      const mockToggle = vi.fn()
      render(<BiasCard bias={mockBias} onToggleFavorite={mockToggle} />)
      
      const favoriteButton = screen.getByLabelText(/Add to favorites|Remove from favorites/i)
      expect(favoriteButton).toBeInTheDocument()
    })

    it('should not render favorite button when onToggleFavorite is not provided', () => {
      render(<BiasCard bias={mockBias} />)
      
      const favoriteButton = screen.queryByLabelText(/favorite/i)
      expect(favoriteButton).not.toBeInTheDocument()
    })

    it('should show filled heart when isFavorite is true', () => {
      const mockToggle = vi.fn()
      render(
        <BiasCard 
          bias={mockBias} 
          isFavorite={true} 
          onToggleFavorite={mockToggle} 
        />
      )
      
      const favoriteButton = screen.getByLabelText('Remove from favorites')
      expect(favoriteButton).toBeInTheDocument()
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should show empty heart when isFavorite is false', () => {
      const mockToggle = vi.fn()
      render(
        <BiasCard 
          bias={mockBias} 
          isFavorite={false} 
          onToggleFavorite={mockToggle} 
        />
      )
      
      const favoriteButton = screen.getByLabelText('Add to favorites')
      expect(favoriteButton).toBeInTheDocument()
      expect(favoriteButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('should render favorite button as clickable', () => {
      const mockToggle = vi.fn()
      
      render(
        <BiasCard 
          bias={mockBias} 
          isFavorite={false} 
          onToggleFavorite={mockToggle} 
        />
      )
      
      const favoriteButton = screen.getByLabelText('Add to favorites')
      expect(favoriteButton).toBeInTheDocument()
      expect(favoriteButton).toBeEnabled()
    })
  })

  describe('Mastered Toggle', () => {
    it('should render mastered button when onToggleMastered is provided', () => {
      const mockToggle = vi.fn()
      render(<BiasCard bias={mockBias} onToggleMastered={mockToggle} />)
      
      const masteredButton = screen.getByLabelText(/Mark as mastered|Unmark as mastered/i)
      expect(masteredButton).toBeInTheDocument()
    })

    it('should render mastered button as clickable', () => {
      const mockToggle = vi.fn()
      
      render(
        <BiasCard 
          bias={mockBias} 
          isMastered={false} 
          onToggleMastered={mockToggle} 
        />
      )
      
      const masteredButton = screen.getByLabelText('Mark as mastered')
      expect(masteredButton).toBeInTheDocument()
      expect(masteredButton).toBeEnabled()
    })
  })

  describe('Action Buttons', () => {
    it('should render Listen button', () => {
      render(<BiasCard bias={mockBias} />)
      expect(screen.getByLabelText(/Read bias aloud|Listen/i)).toBeInTheDocument()
    })

    it('should render Share button', () => {
      render(<BiasCard bias={mockBias} />)
      expect(screen.getByLabelText('Share this bias')).toBeInTheDocument()
    })

    it('should render Copy button', () => {
      render(<BiasCard bias={mockBias} />)
      expect(screen.getByLabelText(/Copy bias to clipboard/i)).toBeInTheDocument()
    })
  })
})

