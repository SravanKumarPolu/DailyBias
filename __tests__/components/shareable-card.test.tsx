/**
 * Tests for ShareableCard component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShareableCard } from '@/components/shareable-card'
import type { Bias } from '@/lib/types'
import * as imageGenerator from '@/lib/image-generator'

// Mock the image generator module
vi.mock('@/lib/image-generator', () => ({
  generateBiasCardDataURL: vi.fn(),
  downloadBiasCard: vi.fn(),
  shareBiasCard: vi.fn(),
}))

// Mock haptics
vi.mock('@/lib/haptics', () => ({
  haptics: {
    light: vi.fn(),
    success: vi.fn(),
  },
}))

// Mock toast
const mockToast = vi.fn()
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

const mockBias: Bias = {
  id: 'test-bias',
  title: 'Test Bias',
  summary: 'This is a test bias summary.',
  why: 'It happens because of testing.',
  counter: 'Counter it by writing tests.',
  category: 'social',
  source: 'core',
  examples: [],
  references: [],
}

describe('ShareableCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render trigger button', () => {
    render(<ShareableCard bias={mockBias} />)
    
    expect(screen.getByText('Reference Card')).toBeInTheDocument()
  })

  it('should render custom trigger if provided', () => {
    render(
      <ShareableCard 
        bias={mockBias} 
        trigger={<button>Custom Trigger</button>} 
      />
    )
    
    expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
  })

  it('should open dialog when trigger is clicked', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockResolvedValue('data:image/png;base64,test')
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      expect(screen.getByText('Quick Reference Card')).toBeInTheDocument()
    })
  })

  it('should generate preview when dialog opens', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockResolvedValue('data:image/png;base64,test')
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      expect(imageGenerator.generateBiasCardDataURL).toHaveBeenCalledWith(
        mockBias,
        expect.objectContaining({
          width: 540,
          height: 960,
        })
      )
    })
  })

  it('should show loading state while generating preview', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('data:image/png;base64,test'), 200))
    )
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    // Check for loading spinner instead of text
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should display preview image when generated', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockResolvedValue('data:image/png;base64,test')
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      const img = screen.getByAltText(`Reference card for ${mockBias.title}`)
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'data:image/png;base64,test')
    })
  })

  it('should handle download button click', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockResolvedValue('data:image/png;base64,test')
    vi.mocked(imageGenerator.downloadBiasCard).mockResolvedValue()
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      expect(screen.getByText('Save to Photos')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Save to Photos'))
    
    await waitFor(() => {
      expect(imageGenerator.downloadBiasCard).toHaveBeenCalledWith(
        mockBias,
        expect.objectContaining({
          width: 1080,
          height: 1920,
        })
      )
    })
  })

  it('should show success toast after download', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockResolvedValue('data:image/png;base64,test')
    vi.mocked(imageGenerator.downloadBiasCard).mockResolvedValue()
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      expect(screen.getByText('Save to Photos')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Save to Photos'))
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Card Downloaded',
        })
      )
    })
  })

  it('should handle share button click', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockResolvedValue('data:image/png;base64,test')
    vi.mocked(imageGenerator.shareBiasCard).mockResolvedValue()
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      expect(screen.getByText('Share')).toBeInTheDocument()
    })
    
    const shareButtons = screen.getAllByText('Share')
    await user.click(shareButtons[shareButtons.length - 1]) // Click the one in the dialog
    
    await waitFor(() => {
      expect(imageGenerator.shareBiasCard).toHaveBeenCalledWith(
        mockBias,
        expect.objectContaining({
          width: 1080,
          height: 1920,
        })
      )
    })
  })

  it('should show error toast if preview generation fails', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockRejectedValue(new Error('Generation failed'))
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Preview Failed',
          variant: 'destructive',
        })
      )
    })
  })

  it('should show error toast if download fails', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockResolvedValue('data:image/png;base64,test')
    vi.mocked(imageGenerator.downloadBiasCard).mockRejectedValue(new Error('Download failed'))
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      expect(screen.getByText('Save to Photos')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Save to Photos'))
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Download Failed',
          variant: 'destructive',
        })
      )
    })
  })

  it('should disable buttons while operations are in progress', async () => {
    const user = userEvent.setup()
    
    vi.mocked(imageGenerator.generateBiasCardDataURL).mockResolvedValue('data:image/png;base64,test')
    vi.mocked(imageGenerator.downloadBiasCard).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<ShareableCard bias={mockBias} />)
    
    await user.click(screen.getByText('Reference Card'))
    
    await waitFor(() => {
      expect(screen.getByText('Save to Photos')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Save to Photos'))
    
    // Check that the button shows "Downloading..." text
    await waitFor(() => {
      expect(screen.getByText('Downloading...')).toBeInTheDocument()
    })
  })
})

